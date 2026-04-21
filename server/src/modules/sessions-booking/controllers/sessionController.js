import fs from 'fs';
import path from 'path';
import LearningRequest from '../../requests-matching/models/LearningRequest.js';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';

const ACTIVE_STATUSES = ['Scheduled', 'Confirmed'];

const normalizeId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return String(value._id);
  return String(value);
};

const isParticipant = (sessionOrRequest, userId) =>
  [normalizeId(sessionOrRequest.learner), normalizeId(sessionOrRequest.tutor)].includes(normalizeId(userId));

const isValidUrl = (value = '') => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const createNotification = async ({ user, session, title, message, type = 'session' }) => {
  if (!user) return;
  await Notification.create({ user, session, title, message, type });
};

const checkConflict = async ({ sessionDate, learner, tutor, excludeSessionId = null }) => {
  const query = {
    status: { $in: ACTIVE_STATUSES },
    scheduledAt: sessionDate,
    $or: [
      { learner },
      { tutor },
      { learner: tutor },
      { tutor: learner },
    ],
  };

  if (excludeSessionId) query._id = { $ne: excludeSessionId };
  return Session.findOne(query);
};

const basePopulate = (query) => query
  .populate('learner tutor', 'name email university')
  .populate('request', 'skill status message createdAt updatedAt')
  .populate('rescheduleRequest.requestedBy rescheduleRequest.respondedBy', 'name email')
  .populate('messages.sender', 'name email');

export const createSession = async (req, res) => {
  const {
    requestId,
    title,
    scheduledAt,
    duration,
    note,
    learnerGoal,
    agenda,
    sessionType = 'Online',
    meetingLink = '',
    location = '',
  } = req.body;

  const request = await LearningRequest.findById(requestId)
    .populate('learner tutor', 'name email university');

  if (!request || request.status !== 'Accepted') {
    return res.status(400).json({ success: false, message: 'Session can be created only for accepted requests' });
  }

  if (!isParticipant(request, req.user._id)) {
    return res.status(403).json({ success: false, message: 'You cannot schedule this session' });
  }

  if (!title?.trim()) {
    return res.status(400).json({ success: false, message: 'Session title is required' });
  }
  if (!learnerGoal?.trim()) {
    return res.status(400).json({ success: false, message: 'Learner goal is required' });
  }
  if (!agenda?.trim()) {
    return res.status(400).json({ success: false, message: 'Session agenda is required' });
  }
  if (!['Online', 'Physical'].includes(sessionType)) {
    return res.status(400).json({ success: false, message: 'Invalid session type' });
  }
  if (sessionType === 'Online' && !isValidUrl(meetingLink)) {
    return res.status(400).json({ success: false, message: 'A valid meeting link is required for online sessions' });
  }
  if (sessionType === 'Physical' && !location.trim()) {
    return res.status(400).json({ success: false, message: 'Location is required for physical sessions' });
  }

  const sessionDate = new Date(scheduledAt);
  if (Number.isNaN(sessionDate.getTime()) || sessionDate <= new Date()) {
    return res.status(400).json({ success: false, message: 'Sessions must be scheduled for a future date and time' });
  }

  const conflict = await checkConflict({
    sessionDate,
    learner: request.learner,
    tutor: request.tutor,
  });

  if (conflict) {
    return res.status(400).json({ success: false, message: 'Overlapping booking detected at this exact time' });
  }

  const session = await Session.create({
    request: request._id,
    learner: request.learner,
    tutor: request.tutor,
    title: title.trim(),
    scheduledAt: sessionDate,
    duration: Number(duration) || 60,
    note: note?.trim() || '',
    learnerGoal: learnerGoal.trim(),
    agenda: agenda.trim(),
    sessionType,
    meetingLink: sessionType === 'Online' ? meetingLink.trim() : '',
    location: sessionType === 'Physical' ? location.trim() : '',
  });

  await Promise.all([
    createNotification({
      user: request.learner,
      session: session._id,
      title: 'Session scheduled',
      message: `${title.trim()} has been scheduled for ${sessionDate.toLocaleString()}`,
      type: 'session',
    }),
    createNotification({
      user: request.tutor,
      session: session._id,
      title: 'New session booked',
      message: `${title.trim()} has been booked for ${sessionDate.toLocaleString()}`,
      type: 'session',
    }),
  ]);

  const populated = await basePopulate(Session.findById(session._id));
  return res.status(201).json({ success: true, message: 'Session scheduled', session: populated });
};

export const getMySessions = async (req, res) => {
  const sessions = await basePopulate(
    Session.find({
      $or: [{ learner: req.user._id }, { tutor: req.user._id }],
    }).sort({ scheduledAt: 1 })
  );

  return res.json({ success: true, sessions });
};

export const updateSession = async (req, res) => {
  const { status, scheduledAt, cancellationReason = '', rescheduleRequest } = req.body;
  const session = await Session.findById(req.params.id);

  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  if (!isParticipant(session, req.user._id)) {
    return res.status(403).json({ success: false, message: 'You cannot modify this session' });
  }

  const isTutor = String(session.tutor) === String(req.user._id);
  const roleLabel = isTutor ? 'Tutor' : 'Learner';

  if (rescheduleRequest?.action === 'request') {
    if (!['Scheduled', 'Confirmed'].includes(session.status)) {
      return res.status(400).json({ success: false, message: 'Reschedule request is allowed only for scheduled or confirmed sessions' });
    }

    const newDate = new Date(rescheduleRequest.proposedAt);
    if (Number.isNaN(newDate.getTime()) || newDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Rescheduled time must be in the future' });
    }
    if (!rescheduleRequest.reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Reschedule reason is required' });
    }
    if (session.rescheduleRequest?.status === 'Pending') {
      return res.status(400).json({ success: false, message: 'A reschedule request is already pending' });
    }

    const conflict = await checkConflict({
      sessionDate: newDate,
      learner: session.learner,
      tutor: session.tutor,
      excludeSessionId: session._id,
    });
    if (conflict) {
      return res.status(400).json({ success: false, message: 'The proposed reschedule time conflicts with another active session' });
    }

    session.rescheduleRequest = {
      proposedAt: newDate,
      reason: rescheduleRequest.reason.trim(),
      requestedBy: req.user._id,
      status: 'Pending',
      respondedBy: null,
      respondedAt: null,
      createdAt: new Date(),
    };
    await session.save();

    const otherParty = isTutor ? session.learner : session.tutor;
    await createNotification({
      user: otherParty,
      session: session._id,
      title: 'Reschedule request received',
      message: `${roleLabel} requested to move ${session.title} to ${newDate.toLocaleString()}`,
      type: 'reschedule',
    });

    const populated = await basePopulate(Session.findById(session._id));
    return res.json({ success: true, message: 'Reschedule request sent', session: populated });
  }

  if (rescheduleRequest?.action === 'respond') {
    const pending = session.rescheduleRequest;
    if (!pending || pending.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'No pending reschedule request found' });
    }
    if (String(pending.requestedBy) === String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You cannot approve or reject your own reschedule request' });
    }
    if (!['Approved', 'Rejected'].includes(rescheduleRequest.decision)) {
      return res.status(400).json({ success: false, message: 'Invalid reschedule decision' });
    }

    pending.status = rescheduleRequest.decision;
    pending.respondedBy = req.user._id;
    pending.respondedAt = new Date();

    if (rescheduleRequest.decision === 'Approved') {
      const newDate = new Date(pending.proposedAt);
      if (Number.isNaN(newDate.getTime()) || newDate <= new Date()) {
        return res.status(400).json({ success: false, message: 'Approved reschedule time is no longer valid' });
      }
      const conflict = await checkConflict({
        sessionDate: newDate,
        learner: session.learner,
        tutor: session.tutor,
        excludeSessionId: session._id,
      });
      if (conflict) {
        return res.status(400).json({ success: false, message: 'The approved time now conflicts with another active session' });
      }
      session.scheduledAt = newDate;
    }

    await session.save();

    await createNotification({
      user: pending.requestedBy,
      session: session._id,
      title: `Reschedule ${rescheduleRequest.decision.toLowerCase()}`,
      message: `${session.title} reschedule request was ${rescheduleRequest.decision.toLowerCase()}`,
      type: 'reschedule',
    });

    const populated = await basePopulate(Session.findById(session._id));
    return res.json({ success: true, message: `Reschedule request ${rescheduleRequest.decision.toLowerCase()}`, session: populated });
  }

  if (scheduledAt) {
    if (['Ongoing', 'Completed', 'Cancelled'].includes(session.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule a session that has already started, completed, or been cancelled' });
    }
    const newDate = new Date(scheduledAt);
    if (Number.isNaN(newDate.getTime()) || newDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Rescheduled time must be in the future' });
    }
    const conflict = await checkConflict({
      sessionDate: newDate,
      learner: session.learner,
      tutor: session.tutor,
      excludeSessionId: session._id,
    });
    if (conflict) {
      return res.status(400).json({ success: false, message: 'The new time conflicts with another active session' });
    }
    session.scheduledAt = newDate;
  }

  if (status) {
    const TUTOR_TRANSITIONS = {
      Scheduled: ['Confirmed', 'Cancelled'],
      Confirmed: ['Ongoing', 'Completed', 'Cancelled'],
      Ongoing: ['Completed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };
    const LEARNER_TRANSITIONS = {
      Scheduled: ['Cancelled'],
      Confirmed: ['Cancelled'],
      Ongoing: [],
      Completed: [],
      Cancelled: [],
    };

    const allowed = isTutor ? (TUTOR_TRANSITIONS[session.status] || []) : (LEARNER_TRANSITIONS[session.status] || []);
    if (!allowed.includes(status)) {
      return res.status(403).json({
        success: false,
        message: `${roleLabel} cannot transition session from ${session.status} to ${status}`,
      });
    }

    if (status === 'Ongoing') {
      const now = new Date();
      const scheduled = new Date(session.scheduledAt);
      if (now < scheduled) {
        return res.status(400).json({ success: false, message: 'Cannot start session before the scheduled time' });
      }
    }

    if (status === 'Cancelled') {
      if (!cancellationReason.trim()) {
        return res.status(400).json({ success: false, message: 'Cancellation reason is required' });
      }
      session.cancellationReason = cancellationReason.trim();
      session.cancelledBy = req.user._id;
    }

    session.status = status;
    const otherParty = isTutor ? session.learner : session.tutor;
    const statusMessage =
      status === 'Confirmed' ? `${session.title} has been confirmed.`
      : status === 'Ongoing' ? `${session.title} has started.`
      : status === 'Completed' ? `${session.title} has been marked completed.`
      : `${session.title} was cancelled. Reason: ${cancellationReason.trim()}`;

    await createNotification({
      user: otherParty,
      session: session._id,
      title: `Session ${status.toLowerCase()}`,
      message: statusMessage,
      type: 'session',
    });
  }

  await session.save();
  const populated = await basePopulate(Session.findById(session._id));
  return res.json({ success: true, message: 'Session updated', session: populated });
};

export const sendSessionMessage = async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  if (!isParticipant(session, req.user._id)) {
    return res.status(403).json({ success: false, message: 'You cannot chat in this session' });
  }

  const text = req.body.text?.trim();
  if (!text) {
    return res.status(400).json({ success: false, message: 'Message text is required' });
  }

  session.messages.push({ sender: req.user._id, text });
  await session.save();

  const otherParty = String(session.learner) === String(req.user._id) ? session.tutor : session.learner;
  await createNotification({
    user: otherParty,
    session: session._id,
    title: 'New chat message',
    message: `You have a new session chat message in ${session.title}`,
    type: 'chat',
  });

  const updatedSession = await basePopulate(Session.findById(session._id));
  return res.status(201).json({ success: true, message: 'Message sent', session: updatedSession });
};

export const uploadSessionNotesFile = async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  if (String(session.tutor) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Only the tutor can upload tutor notes' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please choose a file to upload' });
  }

  if (session.sessionNotesFile?.path && fs.existsSync(session.sessionNotesFile.path)) {
    try { fs.unlinkSync(session.sessionNotesFile.path); } catch {}
  }

  session.sessionNotesFile = {
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    uploadedAt: new Date(),
  };
  await session.save();

  const otherParty = session.learner;
  await createNotification({
    user: otherParty,
    session: session._id,
    title: 'Tutor notes uploaded',
    message: `Tutor notes were uploaded for ${session.title}. You can now download them.`,
    type: 'session',
  });

  const updatedSession = await basePopulate(Session.findById(session._id));
  return res.json({ success: true, message: 'Tutor notes uploaded', session: updatedSession });
};

export const downloadSessionNotesFile = async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  if (!isParticipant(session, req.user._id)) {
    return res.status(403).json({ success: false, message: 'You cannot download notes for this session' });
  }
  if (!session.sessionNotesFile?.path) {
    return res.status(404).json({ success: false, message: 'No tutor notes file uploaded yet' });
  }
  const filePath = path.resolve(session.sessionNotesFile.path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Tutor notes file could not be found on the server' });
  }
  return res.download(filePath, session.sessionNotesFile.originalName || session.sessionNotesFile.storedName);
};
