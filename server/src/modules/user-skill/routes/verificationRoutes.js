import express from 'express';
import { submitVerification, getMyVerificationStatus, getCooldownStatus } from '../controllers/verificationController.js';
import { protect } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// User submits a quiz result → creates a pending SkillVerification document
router.post('/submit', protect, submitVerification);

// User fetches their own skill verification statuses
router.get('/my-status', protect, getMyVerificationStatus);

// Check cooldown status before opening quiz modal
router.get('/cooldown/:skillId', protect, getCooldownStatus);

export default router;
