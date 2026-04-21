import express from 'express';
import {
  getAllSkills,
  getAllUsers,
  getAdminStats,
  getAllReviews,
  deleteReview,
  getReviewReport,
  getVerifications,
  reviewVerification,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats',                    protect, adminOnly, getAdminStats);
router.get('/users',                    protect, adminOnly, getAllUsers);
router.get('/skills',                   protect, adminOnly, getAllSkills);
router.get('/reviews',                  protect, adminOnly, getAllReviews);
router.get('/reviews/report',           protect, adminOnly, getReviewReport);
router.delete('/reviews/:id',           protect, adminOnly, deleteReview);
router.get('/verifications',            protect, adminOnly, getVerifications);
router.patch('/verifications/:id/review', protect, adminOnly, reviewVerification);

export default router;
