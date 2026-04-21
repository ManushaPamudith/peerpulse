import jwt from 'jsonwebtoken';
import User from '../modules/user-skill/models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

export const tutorOnly = (req, res, next) => {
  if (!['tutor', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Tutor access required' });
  }
  next();
};

export const learnerOnly = (req, res, next) => {
  if (!['student', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Only learners can perform this action' });
  }
  next();
};
