import Review from '../models/Review.js';
import Session from '../../sessions-booking/models/Session.js';
import User from '../../user-skill/models/User.js';
import ReviewFlag from '../models/ReviewFlag.js';

// Recomputes and persists averageRating + reviewCount on the tutor's User document
const syncTutorRating = async (tutorId) => {
  const received = await Review.find({ tutor: tutorId });
  const count = received.length;
  const avg = count
    ? parseFloat((received.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
    : 0;
  await User.findByIdAndUpdate(tutorId, { averageRating: avg, reviewCount: count });
};

export const createReview = async (req, res) => {
  const { sessionId, rating, comment } = req.body;

  if (!comment?.trim()) {
    return res.status(400).json({ success: false, message: 'Feedback comment is required' });
  }

  const session = await Session.findById(sessionId);

  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  if (String(session.learner) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Only the learner can review the session' });
  }
  if (session.status !== 'Completed') {
    return res.status(400).json({ success: false, message: 'Feedback can only be submitted after the session is completed' });
  }

  const exists = await Review.findOne({ session: sessionId });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Review already exists for this session' });
  }

  const review = await Review.create({
    session: session._id,
    learner: session.learner,
    tutor: session.tutor,
    rating,
    comment,
  });

  // Persist updated averageRating + reviewCount on the tutor's profile
  await syncTutorRating(session.tutor);

  const populated = await review.populate('learner tutor session', 'name email title');
  res.status(201).json({ success: true, message: 'Review submitted', review: populated });
};

export const getReviews = async (req, res) => {
  // Fetch reviews where the user is the learner (given) OR the tutor (received)
  // The learner field always identifies who submitted the review,
  // so average rating must only be computed from reviews where tutor === current user.
  const reviews = await Review.find({
    $or: [{ learner: req.user._id }, { tutor: req.user._id }],
  })
    .populate('learner tutor', 'name email')
    .populate('session', 'title status scheduledAt')
    .sort({ createdAt: -1 });

  // Compute average using only reviews received as a tutor (learner → tutor feedback)
  const receivedReviews = reviews.filter(r => String(r.tutor?._id ?? r.tutor) === String(req.user._id));
  const avgRating = receivedReviews.length
    ? parseFloat((receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(1))
    : null;

  res.json({ success: true, reviews, avgRating });
};

export const getReviewsBySession = async (req, res) => {
  const review = await Review.findOne({ session: req.params.id })
    .populate('learner tutor', 'name email')
    .populate('session', 'title status');

  if (!review) return res.status(404).json({ success: false, message: 'No review found for this session' });
  res.json({ success: true, review });
};

export const getReviewsByUser = async (req, res) => {
  const reviews = await Review.find({
    $or: [{ learner: req.params.id }, { tutor: req.params.id }],
  })
    .populate('learner tutor', 'name email')
    .populate('session', 'title status scheduledAt')
    .sort({ createdAt: -1 });

  // Average rating = only reviews where this user was the tutor (learner → tutor feedback)
  const receivedReviews = reviews.filter(r => String(r.tutor?._id ?? r.tutor) === String(req.params.id));
  const avgRating = receivedReviews.length
    ? parseFloat((receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(1))
    : null;

  res.json({ success: true, reviews, avgRating });
};

export const flagReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (String(review.learner) === String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You cannot flag your own review' });
    }

    const validReasons = ['Spam', 'Offensive language', 'False information', 'Irrelevant'];
    if (!validReasons.includes(req.body.reason)) {
      return res.status(400).json({ success: false, message: 'Invalid reason' });
    }

    const flag = await ReviewFlag.create({
      review: review._id,
      reportedBy: req.user._id,
      reason: req.body.reason,
    });

    return res.status(201).json({ success: true, flag });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already flagged this review' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
