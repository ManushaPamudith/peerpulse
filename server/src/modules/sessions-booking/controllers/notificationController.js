import Notification from '../models/Notification.js';
import Session from '../models/Session.js';

export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .populate('session', 'title status scheduledAt sessionType')
    .sort({ createdAt: -1 })
    .limit(25);

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const sessions = await Session.find({
    $or: [{ learner: req.user._id }, { tutor: req.user._id }],
    status: { $in: ['Scheduled', 'Confirmed'] },
    scheduledAt: { $gte: now, $lte: in24h },
  })
    .select('title scheduledAt sessionType location meetingLink status')
    .sort({ scheduledAt: 1 })
    .limit(10);

  const reminders = sessions.map((session) => ({
    _id: `reminder-${session._id}`,
    type: 'reminder',
    title: 'Upcoming session reminder',
    message: `${session.title} starts at ${new Date(session.scheduledAt).toLocaleString()}`,
    session,
    createdAt: session.scheduledAt,
    read: false,
  }));

  res.json({
    success: true,
    notifications,
    reminders,
    unreadCount: notifications.filter((item) => !item.read).length,
  });
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  notification.read = true;
  await notification.save();
  res.json({ success: true, notification });
};
