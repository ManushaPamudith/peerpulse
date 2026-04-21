import express from 'express';
import { 
  createRequest, 
  discoverTutors, 
  getMyRequests, 
  updateRequestStatus, 
  withdrawRequest, 
  cancelRequest, 
  cancelAcceptedRequest, 
  cancelRejectedRequest,
  getTutorAnalytics,
  getSkillDemandInsights,
  getAllSkillsDemand,
  getRequestHistory
} from '../controllers/requestController.js';
import { protect } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// Core Request Management Routes
router.get('/discover', protect, discoverTutors);
router.get('/my', protect, getMyRequests);
router.post('/', protect, createRequest);
router.patch('/:id/status', protect, updateRequestStatus);
router.patch('/:id/withdraw', protect, withdrawRequest);
router.patch('/:id/cancel', protect, cancelRequest);
router.patch('/:id/cancel-accepted', protect, cancelAcceptedRequest);
router.patch('/:id/cancel-rejected', protect, cancelRejectedRequest);

// Module 2 Analytics Routes
router.get('/analytics/tutor/:tutorId', protect, getTutorAnalytics);
router.get('/analytics/skill-demand', protect, getSkillDemandInsights);
router.get('/analytics/all-skills', protect, getAllSkillsDemand);
router.get('/analytics/history/:tutorId', protect, getRequestHistory);

export default router;
