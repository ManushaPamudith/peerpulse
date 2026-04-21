import User from '../../user-skill/models/User.js';
import LearningRequest from '../models/LearningRequest.js';

const LEVEL_ORDER = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

const humanTimeAgo = (date) => {
  if (!date) return 'No activity';
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes <= 5) return 'Online';
  if (minutes < 60) return `Active ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  const days = Math.round(hours / 24);
  return `Active ${days}d ago`;
};

const formatAvailabilitySlot = (availability) => {
  if (!availability?.isAvailable) return 'Currently unavailable';
  const days = (availability.preferredDays || []).length > 0 ? availability.preferredDays.join(', ') : 'Any day';
  const hours = availability.preferredHours || { start: '09:00', end: '18:00' };
  const timezone = availability.timezone ? ` (${availability.timezone})` : '';
  return `${days} · ${hours.start}–${hours.end}${timezone}`;
};

const buildResponseRate = (avgMs, count) => {
  if (!count || !avgMs) return 'No response history';
  const hours = avgMs / 3600000;
  if (hours < 2) return 'Fast responder';
  if (hours < 8) return 'Responsive';
  return 'Slower responder';
};

const demandTag = (count) => {
  if (count >= 8) return 'High demand';
  if (count >= 3) return 'Growing demand';
  return 'Low demand';
};

const isAvailabilityMatching = (tutorAvailability, learnerAvailability) => {
  if (!tutorAvailability?.isAvailable || !learnerAvailability?.isAvailable) return 0.5;

  const tutorDays = tutorAvailability.preferredDays || [];
  const learnerDays = learnerAvailability.preferredDays || [];

  if (tutorDays.length === 0 || learnerDays.length === 0) return 0.8;

  const commonDays = tutorDays.filter(day => learnerDays.includes(day));
  return commonDays.length > 0 ? 1 : 0.5;
};

const isSkillVerified = (skillDoc) =>
  !!(skillDoc && (skillDoc.verified === true || skillDoc.verificationStatus === 'verified'));

// Helper: Calculate matching score (0-100)
// learnerLevel: proficiency filter from the learner (empty = no level filter → full level credit when skill matches)
// learnerAvailability: logged-in user's availability for schedule overlap scoring
const calculateMatchingScore = (tutor, learnerSkill, learnerLevel, learnerAvailability = {}) => {
  let score = 0;

  const skills = tutor.skills || [];
  const learnerSkillNorm = (learnerSkill || '').trim().toLowerCase();
  const matchedSkill = skills.find(
    (s) => s.skill && s.skill.toLowerCase() === learnerSkillNorm
  );

  // 1. Skill Match (40%)
  if (matchedSkill) {
    score += 40;
  }

  // 2. Level Match (20%) — compare tutor's teaching level to the learner's chosen filter, not to itself
  if (matchedSkill) {
    const filterLevel = (learnerLevel || '').trim();
    if (!filterLevel) {
      score += 20;
    } else if (matchedSkill.level === filterLevel) {
      score += 20;
    } else {
      score += 10;
    }
  }

  // 3. Verification (15%)
  if (isSkillVerified(matchedSkill)) {
    score += 15;
  }

  // 4. Rating (15%)
  if (tutor.averageRating > 0) {
    score += (tutor.averageRating / 5) * 15;
  }

  // 5. Availability (10%)
  const availabilityScore = isAvailabilityMatching(tutor.availability, learnerAvailability) * 10;
  score += availabilityScore;

  return Math.min(100, Math.round(score));
};

const boostMatchingScore = (baseScore, responseStats = {}, successRate = null) => {
  let boosted = baseScore;
  const hours = responseStats?.avgResponseMs ? responseStats.avgResponseMs / 3600000 : null;
  const responseCount = responseStats?.count || 0;

  // Reward proven responsiveness once enough history exists.
  if (responseCount >= 3 && hours !== null) {
    if (hours < 2) boosted += 5;
    else if (hours < 8) boosted += 3;
  }

  // Reward tutor's past success rate if there is enough outcome history.
  if (typeof successRate === 'number') {
    if (successRate >= 0.7) boosted += 5;
    else if (successRate >= 0.5) boosted += 3;
  }

  return Math.min(100, Math.round(boosted));
};

// Helper: Check if request already exists (duplicate prevention)
const hasDuplicateRequest = async (learnerId, tutorId, skillName) => {
  const existing = await LearningRequest.findOne({
    learner: learnerId,
    tutor: tutorId,
    skill: { $regex: new RegExp(`^${skillName}$`, 'i') },
    status: { $nin: ['Cancelled', 'Expired'] }
  });
  return !!existing;
};

// Helper: Auto-expire old requests
const expireOldRequests = async () => {
  const now = new Date();
  await LearningRequest.updateMany(
    {
      expiresAt: { $lt: now },
      status: 'Pending',
      isWithdrawn: false
    },
    { 
      status: 'Expired',
      isWithdrawn: true,
      withdrawnAt: now,
      withdrawnReason: 'Request auto-expired after 48 hours'
    }
  );
};

export const discoverTutors = async (req, res) => {
  try {
    const { skill = '', level = '', verified = '', availabilityMatch = 'false' } = req.query;
    const learnerAvailability = req.user.availability || {};

    // Expire old requests before fetching
    await expireOldRequests();

    const demandAgg = await LearningRequest.aggregate([
      { $match: { status: { $ne: 'Expired' } } },
      { $group: { _id: { $toLower: '$skill' }, count: { $sum: 1 } } },
    ]);
    const demandMap = demandAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const responseAgg = await LearningRequest.aggregate([
      { $match: { status: { $in: ['Accepted', 'Rejected'] }, isWithdrawn: false } },
      { $project: { tutor: 1, responseMs: { $subtract: ['$updatedAt', '$createdAt'] } } },
      { $group: { _id: '$tutor', avgResponseMs: { $avg: '$responseMs' }, count: { $sum: 1 } } },
    ]);
    const responseMap = responseAgg.reduce((acc, item) => {
      acc[item._id.toString()] = { avgResponseMs: item.avgResponseMs, count: item.count };
      return acc;
    }, {});

    const outcomeAgg = await LearningRequest.aggregate([
      { $match: { status: { $in: ['Accepted', 'Rejected'] }, isWithdrawn: false } },
      {
        $group: {
          _id: '$tutor',
          total: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
          }
        }
      }
    ]);
    const successRateMap = outcomeAgg.reduce((acc, item) => {
      acc[item._id.toString()] = item.total > 0 ? item.accepted / item.total : null;
      return acc;
    }, {});

    let users = await User.find({ _id: { $ne: req.user._id } }).select('-password');

    const learnerLevelFilter = (level || '').trim();

    const tutors = users
      .map((user) => {
        const matchedSkills = user.skills.filter((item) => {
          const skillMatch = !skill || item.skill.toLowerCase().includes(skill.toLowerCase());
          const levelMatch = !learnerLevelFilter || item.level === learnerLevelFilter;
          const verifiedMatch =
            verified !== 'true' || isSkillVerified(item);
          const availabilityMatch_check = availabilityMatch !== 'true' || isAvailabilityMatching(user.availability, learnerAvailability) > 0.5;
          return skillMatch && levelMatch && verifiedMatch && availabilityMatch_check;
        });

        if (!matchedSkills.length) return null;

        const responseStats = responseMap[user._id.toString()] || {};
        const successRate = successRateMap[user._id.toString()] ?? null;
        const matchingScores = matchedSkills.map((skillItem) => {
          const base = calculateMatchingScore(user, skillItem.skill, learnerLevelFilter, learnerAvailability);
          return boostMatchingScore(base, responseStats, successRate);
        });
        const maxMatchingScore = Math.max(...matchingScores);
        const primarySkill = matchedSkills.reduce((best, current) => {
          const bestBase = calculateMatchingScore(user, best.skill, learnerLevelFilter, learnerAvailability);
          const currentBase = calculateMatchingScore(user, current.skill, learnerLevelFilter, learnerAvailability);
          const bestScore = boostMatchingScore(bestBase, responseStats, successRate);
          const currentScore = boostMatchingScore(currentBase, responseStats, successRate);
          return currentScore > bestScore ? current : best;
        }, matchedSkills[0]);

        const demandCount = Math.max(...matchedSkills.map(s => demandMap[s.skill.toLowerCase()] || 0));
        const gapWarning =
          learnerLevelFilter &&
          Math.abs((LEVEL_ORDER[primarySkill.level] || 0) - (LEVEL_ORDER[learnerLevelFilter] || 0)) > 1;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          university: user.university,
          updatedAt: user.updatedAt,
          skills: matchedSkills.map(s => ({
            _id:                s._id,
            skill:              s.skill,
            level:              s.level,
            type:               s.type,
            verified:           s.verified,
            verificationStatus: s.verificationStatus || (s.verified ? 'verified' : 'unverified'),
            verificationMethod: s.verificationMethod,
            categoryKey:        s.categoryKey,
            moduleCode:         s.moduleCode,
          })),
          averageRating: user.averageRating,
          reviewCount: user.reviewCount,
          matchingScore: maxMatchingScore,
          availability: user.availability,
          availabilityLabel: formatAvailabilitySlot(user.availability),
          responseRateLabel: buildResponseRate(responseStats.avgResponseMs, responseStats.count),
          demandTag: demandTag(demandCount),
          lastActiveLabel: humanTimeAgo(user.updatedAt),
          levelGapWarning: gapWarning,
          suggestedTime: formatAvailabilitySlot(user.availability),
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.matchingScore !== a.matchingScore) {
          return b.matchingScore - a.matchingScore;
        }
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.reviewCount - a.reviewCount;
      });

    res.json({ success: true, tutors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { tutorId, skill, message, priority = 'Normal' } = req.body;

    if (!tutorId || !skill || !message) {
      return res.status(400).json({ success: false, message: 'Tutor, skill, and message are required' });
    }

    if (!['Normal', 'Urgent'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Priority must be Normal or Urgent' });
    }

    await expireOldRequests();

    const activeCount = await LearningRequest.countDocuments({
      learner: req.user._id,
      status: 'Pending',
      isWithdrawn: false,
      expiresAt: { $gt: new Date() }
    });
    if (activeCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'You can only have up to 5 active requests at once. Close or withdraw an old request before creating a new one.'
      });
    }

    const hasDuplicate = await hasDuplicateRequest(req.user._id, tutorId, skill);
    if (hasDuplicate) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this skill with this tutor'
      });
    }

    const recentRejected = await LearningRequest.findOne({
      learner: req.user._id,
      tutor: tutorId,
      skill: { $regex: new RegExp(`^${skill}$`, 'i') },
      status: 'Rejected',
      isWithdrawn: false
    }).sort({ updatedAt: -1 });

    if (recentRejected) {
      const hoursSinceRejection = (Date.now() - recentRejected.updatedAt.getTime()) / 3600000;
      if (hoursSinceRejection < 24) {
        return res.status(400).json({
          success: false,
          message: `You can re-request this skill after ${Math.ceil(24 - hoursSinceRejection)} hours following rejection.`
        });
      }
    }

    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    const matchedSkill = tutor.skills.find(s => s.skill.toLowerCase() === skill.toLowerCase());
    const requestedLevel = matchedSkill?.level || 'Beginner';
    const matchingScore = calculateMatchingScore(
      tutor,
      skill,
      requestedLevel,
      req.user?.availability || {}
    );

    const request = await LearningRequest.create({
      learner: req.user._id,
      tutor: tutorId,
      skill,
      message,
      priority,
      matchingScore
    });

    const populated = await request.populate('learner tutor', 'name email university averageRating');
    res.status(201).json({
      success: true,
      message: 'Request sent',
      request: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const { status = '', priority = '' } = req.query;

    // Expire old requests
    await expireOldRequests();

    const filter = {
      $or: [{ learner: req.user._id }, { tutor: req.user._id }]
    };

    // Add status filter if provided
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Add priority filter if provided
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    const requests = await LearningRequest.find(filter)
      .populate('learner tutor', 'name email university averageRating')
      .sort({ priority: -1, createdAt: -1 }); // Urgent first, then by creation time

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await LearningRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (String(request.tutor) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the tutor can update this request' });
    }

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Can only accept/reject pending requests
    if (request.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot ${status.toLowerCase()} a ${request.status.toLowerCase()} request` 
      });
    }

    // Cannot accept/reject withdrawn or expired requests
    if (request.isWithdrawn || request.status === 'Expired') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot ${status.toLowerCase()} a ${request.status.toLowerCase()} request` 
      });
    }

    request.status = status;
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    
    if (status === 'Accepted') {
      request.acceptedAt = now;
      request.cancelableUntil = fiveMinutesFromNow;
    } else if (status === 'Rejected') {
      request.rejectedAt = now;
      request.cancelableUntil = fiveMinutesFromNow;
    }
    
    await request.save();
    const populated = await request.populate('learner tutor', 'name email university averageRating');
    res.json({ success: true, message: `Request ${status.toLowerCase()}`, request: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// New: Withdraw request (only for Pending requests)
export const withdrawRequest = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const request = await LearningRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only learner can withdraw
    if (String(request.learner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the request creator can withdraw' });
    }

    // Can only withdraw Pending requests
    if (request.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot withdraw a ${request.status.toLowerCase()} request. Only pending requests can be withdrawn.` 
      });
    }

    if (request.isWithdrawn) {
      return res.status(400).json({ success: false, message: 'Request is already withdrawn' });
    }

    request.isWithdrawn = true;
    request.withdrawnAt = new Date();
    request.withdrawnReason = reason;
    request.status = 'Cancelled';
    request.cancelableUntil = null;
    
    await request.save();
    const populated = await request.populate('learner tutor', 'name email university averageRating');
    
    res.json({ 
      success: true, 
      message: 'Request withdrawn successfully', 
      request: populated 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// New: Cancel pending request (learner can cancel within 5 minutes of sending)
export const cancelRequest = async (req, res) => {
  try {
    const request = await LearningRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only learner can cancel their own request
    if (String(request.learner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the request creator can cancel' });
    }

    // Can only cancel Pending requests
    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${request.status.toLowerCase()} request. Only pending requests can be cancelled.`
      });
    }

    // Check if still within 5-minute cancellation window
    const now = new Date();
    if (request.createdAt && new Date(request.createdAt).getTime() + (5 * 60000) < now.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation window has expired. Request can only be cancelled within 5 minutes of creation.'
      });
    }

    request.isWithdrawn = true;
    request.withdrawnAt = new Date();
    request.withdrawnReason = 'Cancelled by learner';
    request.status = 'Cancelled';
    request.cancelableUntil = null;

    await request.save();
    const populated = await request.populate('learner tutor', 'name email university averageRating');

    res.json({
      success: true,
      message: 'Request cancelled successfully',
      request: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// New: Cancel accepted request (tutor can cancel within 5 minutes of accepting)
export const cancelAcceptedRequest = async (req, res) => {
  try {
    const request = await LearningRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only tutor can cancel an accepted request
    if (String(request.tutor) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the tutor can cancel this' });
    }

    // Can only cancel Accepted requests
    if (request.status !== 'Accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${request.status.toLowerCase()} request. Only accepted requests can be cancelled.`
      });
    }

    // Check if still within 5-minute cancellation window
    const now = new Date();
    if (request.acceptedAt && new Date(request.acceptedAt).getTime() + (5 * 60000) < now.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation window has expired. Accepted requests can only be cancelled within 5 minutes.'
      });
    }

    request.status = 'Pending';
    request.acceptedAt = null;
    request.cancelableUntil = null;

    await request.save();
    const populated = await request.populate('learner tutor', 'name email university averageRating');

    res.json({
      success: true,
      message: 'Accepted request cancelled successfully',
      request: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// New: Cancel rejected request (tutor can undo rejection within 5 minutes)
export const cancelRejectedRequest = async (req, res) => {
  try {
    const request = await LearningRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only tutor can undo their rejection
    if (String(request.tutor) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the tutor can undo this rejection' });
    }

    // Can only undo Rejected requests
    if (request.status !== 'Rejected') {
      return res.status(400).json({
        success: false,
        message: `Cannot undo status of a ${request.status.toLowerCase()} request. Only rejected requests can be undone.`
      });
    }

    // Check if still within 5-minute cancellation window
    const now = new Date();
    if (request.rejectedAt && new Date(request.rejectedAt).getTime() + (5 * 60000) < now.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Undo window has expired. Rejections can only be undone within 5 minutes.'
      });
    }

    request.status = 'Pending';
    request.rejectedAt = null;
    request.cancelableUntil = null;

    await request.save();
    const populated = await request.populate('learner tutor', 'name email university averageRating');

    res.json({
      success: true,
      message: 'Rejection undone successfully',
      request: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Module 2 Enhancement: Get Tutor Analytics
export const getTutorAnalytics = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    // Get request stats
    const allRequests = await LearningRequest.find({ tutor: tutorId, isWithdrawn: false });
    const totalRequests = allRequests.length;
    const acceptedCount = allRequests.filter(r => r.status === 'Accepted').length;
    const rejectedCount = allRequests.filter(r => r.status === 'Rejected').length;
    const acceptanceRate = totalRequests > 0 ? acceptedCount / totalRequests : 0;

    // Calculate average response time
    const respondedRequests = allRequests.filter(r => r.status !== 'Pending');
    let avgResponseTime = null;
    if (respondedRequests.length > 0) {
      const totalResponseMs = respondedRequests.reduce((sum, r) => {
        return sum + (new Date(r.updatedAt) - new Date(r.createdAt));
      }, 0);
      avgResponseTime = totalResponseMs / respondedRequests.length;
    }

    // Get recent history (last 5 requests)
    const recentRequests = await LearningRequest.find({ tutor: tutorId, isWithdrawn: false })
      .populate('learner', 'name')
      .select('skill status createdAt learner')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentHistory = recentRequests.map(req => ({
      skill: req.skill,
      status: req.status,
      learnerName: req.learner?.name || 'Unknown',
      daysAgo: Math.round((Date.now() - new Date(req.createdAt)) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      analytics: {
        totalRequests,
        acceptedCount,
        rejectedCount,
        acceptanceRate,
        avgResponseTime,
        recentHistory,
        tutorName: tutor.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Module 2 Enhancement: Get Skill Demand Insights
export const getSkillDemandInsights = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({ success: false, message: 'Skill parameter is required' });
    }

    // Get total requests for this skill
    const skillRequests = await LearningRequest.find({
      skill: { $regex: new RegExp(`^${skill}$`, 'i') },
      isWithdrawn: false,
      status: { $ne: 'Expired' }
    });

    const demandCount = skillRequests.length;

    // Calculate acceptance rate for this skill
    const acceptedCount = skillRequests.filter(r => r.status === 'Accepted').length;
    const respondedCount = skillRequests.filter(r => r.status !== 'Pending').length;
    const acceptanceRate = respondedCount > 0 ? acceptedCount / respondedCount : 0;

    // Get tutors who teach this skill
    const tutorCount = await User.countDocuments({
      'skills.skill': { $regex: new RegExp(`^${skill}$`, 'i') }
    });

    res.json({
      success: true,
      demand: {
        skill,
        demandCount,
        acceptanceRate,
        averageDemandIndicator: demandCount >= 8 ? 'High' : demandCount >= 3 ? 'Growing' : 'Low',
        tutorCount,
        demandPercentage: tutorCount > 0 ? Math.min(100, Math.round((demandCount / tutorCount) * 100)) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Module 2 Enhancement: Get All Skills Demand
export const getAllSkillsDemand = async (req, res) => {
  try {
    const demandAgg = await LearningRequest.aggregate([
      { $match: { isWithdrawn: false, status: { $ne: 'Expired' } } },
      { $group: { _id: { $toLower: '$skill' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const skillsDemand = demandAgg.map(item => ({
      skill: item._id,
      demandCount: item.count,
      demandLevel: item.count >= 8 ? 'High' : item.count >= 3 ? 'Growing' : 'Low'
    }));

    res.json({ success: true, skillsDemand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Module 2 Enhancement: Get Request History for Tutor
export const getRequestHistory = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { limit = 10 } = req.query;

    const history = await LearningRequest.find({ tutor: tutorId, isWithdrawn: false })
      .populate('learner', 'name email')
      .select('skill status priority createdAt updatedAt matchingScore')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
