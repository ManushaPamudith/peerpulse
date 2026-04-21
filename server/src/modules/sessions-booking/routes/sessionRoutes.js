import express from 'express';
import upload from '../../../middleware/uploadMiddleware.js';
import {
  createSession,
  getMySessions,
  updateSession,
  sendSessionMessage,
  uploadSessionNotesFile,
  downloadSessionNotesFile,
} from '../controllers/sessionController.js';
import { protect } from '../../../middleware/authMiddleware.js';

const router = express.Router();
router.get('/my', protect, getMySessions);
router.post('/', protect, createSession);
router.post('/:id/messages', protect, sendSessionMessage);
router.post('/:id/notes-file', protect, upload.single('notesFile'), uploadSessionNotesFile);
router.get('/:id/notes-file', protect, downloadSessionNotesFile);
router.patch('/:id', protect, updateSession);
export default router;
