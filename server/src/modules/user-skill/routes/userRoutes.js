import express from 'express';
import { addSkill, deleteSkill, getProfile, getPublicProfile, updateProfile, updateSkill, verifySkill, uploadProfilePicture, deleteProfilePicture } from '../controllers/userController.js';
import { getAllSkills } from '../../feedback-reports/controllers/adminController.js';
import { protect } from '../../../middleware/authMiddleware.js';
import { uploadAvatar } from '../../../middleware/uploadMiddleware.js';

const router = express.Router();
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/picture', protect, uploadAvatar.single('avatar'), uploadProfilePicture);
router.delete('/profile/picture', protect, deleteProfilePicture);
// Public profile — any logged-in user can view another user's safe public data
router.get('/:id/public', protect, getPublicProfile);
// Public skills listing — used by Browse Skills page, accessible to all authenticated users
router.get('/skills/all', protect, getAllSkills);
router.post('/skills', protect, addSkill);
router.put('/skills/:skillId', protect, updateSkill);
router.patch('/skills/:skillId/verify', protect, verifySkill);
router.delete('/skills/:skillId', protect, deleteSkill);
export default router;
