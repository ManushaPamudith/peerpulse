import User from '../../user-skill/models/User.js';
import Session from '../../sessions-booking/models/Session.js';
import Review from '../models/Review.js';
import ReviewFlag from '../models/ReviewFlag.js';
import SkillVerification from '../../user-skill/models/SkillVerification.js';

export const getAllReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate('learner tutor', 'name email')
    .populate('session', 'title status scheduledAt')
    .sort({ createdAt: -1 });

  // Fetch all flags and group by review ID — include reasons
  const flags = await ReviewFlag.find().select('review reason').lean();
  const flagMap = {};
  for (const f of flags) {
    const key = String(f.review);
    if (!flagMap[key]) flagMap[key] = { count: 0, reasons: [] };
    flagMap[key].count += 1;
    flagMap[key].reasons.push(f.reason);
  }

  const reviewsWithFlags = reviews.map(r => ({
    ...r.toObject(),
    flagCount: flagMap[String(r._id)]?.count || 0,
    flagReasons: flagMap[String(r._id)]?.reasons || [],
  }));

  res.json({ success: true, reviews: reviewsWithFlags });
};

export const getAdminStats = async (req, res) => {
  const [totalUsers, completedSessions, totalReviews, verifiedTutorsRaw, pendingVerifications] = await Promise.all([
    User.countDocuments(),
    Session.countDocuments({ status: 'Completed' }),
    Review.countDocuments(),
    User.find({ 'skills.verified': true }).select('_id'),
    SkillVerification.countDocuments({ status: 'pending' }),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      completedSessions,
      totalReviews,
      verifiedTutors: verifiedTutorsRaw.length,
      pendingVerifications,
    },
  });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
};

export const getAllSkills = async (req, res) => {
  const users = await User.find({ 'skills.0': { $exists: true } }).select('name email university skills');
  const skills = [];
  users.forEach(u => {
    u.skills.forEach(s => {
      skills.push({
        _id: s._id,
        skill: s.skill,
        level: s.level,
        type: s.type,
        verified: s.verified,
        verificationStatus: s.verificationStatus,
        verificationMethod: s.verificationMethod,
        owner: { _id: u._id, name: u.name, email: u.email, university: u.university },
      });
    });
  });
  res.json({ success: true, skills });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/verifications?status=pending
// Returns all SkillVerification documents, filterable by status.
// ─────────────────────────────────────────────────────────────────────────────
export const getVerifications = async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== 'all' ? { status } : {};

  const verifications = await SkillVerification.find(filter)
    .populate('user', 'name email university')
    .populate('reviewedBy', 'name email')
    .sort({ submittedAt: -1 });

  res.json({ success: true, verifications });
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/verifications/:id/review
// Admin approves or rejects a pending verification request.
// Updates both the SkillVerification document and the skill inside the User.
// ─────────────────────────────────────────────────────────────────────────────
export const reviewVerification = async (req, res) => {
  const { decision, rejectionReason } = req.body;

  if (!['verified', 'rejected'].includes(decision)) {
    return res.status(400).json({ success: false, message: "Decision must be 'verified' or 'rejected'" });
  }

  const verification = await SkillVerification.findById(req.params.id);
  if (!verification) {
    return res.status(404).json({ success: false, message: 'Verification request not found' });
  }
  if (verification.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'This request has already been reviewed' });
  }

  // Update the SkillVerification document
  verification.status          = decision;
  verification.reviewedAt      = new Date();
  verification.reviewedBy      = req.user._id;
  verification.rejectionReason = decision === 'rejected' ? (rejectionReason?.trim() || '') : '';
  await verification.save();

  // Update the skill inside the User document
  const user = await User.findById(verification.user);
  if (user) {
    const skill = user.skills.id(verification.skillId);
    if (skill) {
      skill.verificationStatus = decision;
      skill.verified           = decision === 'verified';
      skill.verificationMethod = verification.skillType === 'Academic Module' ? 'grade' : 'mcq';
      await user.save();
    }
  }

  const populated = await SkillVerification.findById(verification._id)
    .populate('user', 'name email university')
    .populate('reviewedBy', 'name email');

  res.json({
    success: true,
    message: `Skill ${decision === 'verified' ? 'approved' : 'rejected'} successfully`,
    verification: populated,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/reviews/report
// Generates a summary report from all review data.
// ─────────────────────────────────────────────────────────────────────────────
export const getReviewReport = async (req, res) => {
  try {
    const [reviews, flagCount] = await Promise.all([
      Review.find().populate('tutor', 'name email').lean(),
      ReviewFlag.countDocuments(),
    ]);

    const totalReviews = reviews.length;
    const overallAvg = totalReviews
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) distribution[r.rating] = (distribution[r.rating] || 0) + 1;

    // Top tutors by average rating (min 1 review), top 5
    const tutorMap = {};
    for (const r of reviews) {
      const id = String(r.tutor?._id || r.tutor);
      if (!tutorMap[id]) tutorMap[id] = { name: r.tutor?.name || 'Unknown', total: 0, count: 0 };
      tutorMap[id].total += r.rating;
      tutorMap[id].count += 1;
    }
    const topTutors = Object.values(tutorMap)
      .map(t => ({ name: t.name, reviewCount: t.count, avgRating: parseFloat((t.total / t.count).toFixed(1)) }))
      .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
      .slice(0, 5);

    res.json({
      success: true,
      report: {
        generatedAt: new Date().toISOString(),
        totalReviews,
        overallAvgRating: overallAvg,
        flaggedReviewCount: flagCount,
        ratingDistribution: distribution,
        topTutors,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const tutorId = review.tutor;

    await ReviewFlag.deleteMany({ review: review._id });
    await review.deleteOne();

    // Recompute tutor rating
    const remaining = await Review.find({ tutor: tutorId });
    const avg = remaining.length
      ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
      : 0;
    await User.findByIdAndUpdate(tutorId, {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount: remaining.length,
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
