import express from 'express';
import { createReview, getReviews, getReviewsBySession, getReviewsByUser, flagReview } from '../controllers/reviewController.js';
import { protect, learnerOnly } from '../../../middleware/authMiddleware.js';

const router = express.Router();
router.get('/my', protect, getReviews);
router.get('/session/:id', protect, getReviewsBySession);
router.get('/user/:id', protect, getReviewsByUser);
router.post('/', protect, createReview);
router.post('/:id/flag', protect, flagReview);
export default router;
