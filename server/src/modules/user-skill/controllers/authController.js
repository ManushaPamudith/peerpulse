import User from '../models/User.js';
import generateToken from '../../../utils/generateToken.js';

// Strict SLIIT email format: itXXXXXXXX@my.sliit.lk
const SLIIT_EMAIL_RE = /^it\d{8}@my\.sliit\.lk$/i;

export const registerUser = async (req, res) => {
  const { name, email, password, university, phone, role } = req.body;

  // Required field presence
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  // Name length
  const trimmedName = name.trim();
  if (trimmedName.length < 3) {
    return res.status(400).json({ success: false, message: 'Name must be at least 3 characters' });
  }
  if (trimmedName.length > 60) {
    return res.status(400).json({ success: false, message: 'Name must be 60 characters or fewer' });
  }

  // Email format — must match SLIIT student format
  const trimmedEmail = email.trim().toLowerCase();
  if (!SLIIT_EMAIL_RE.test(trimmedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Email must be in the format itXXXXXXXX@my.sliit.lk',
    });
  }

  // Password length
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  // Phone — optional but must be valid Sri Lankan mobile if provided
  if (phone?.trim() && !/^0[0-9]{9}$/.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be 10 digits starting with 0 (e.g. 0771234567)',
    });
  }

  const existingUser = await User.findOne({ email: trimmedEmail });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'This email is already registered' });
  }

  // Only allow student or tutor self-registration (not admin)
  const assignedRole = role === 'tutor' ? 'tutor' : 'student';

  const user = await User.create({
    name:       trimmedName,
    email:      trimmedEmail,
    password,
    university: university?.trim() || 'SLIIT',
    role:       assignedRole,
    ...(phone?.trim() ? { phone: phone.trim() } : {}),
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token: generateToken(user._id),
    user: {
      _id:            user._id,
      name:           user.name,
      email:          user.email,
      university:     user.university,
      phone:          user.phone,
      role:           user.role,
      skills:         user.skills,
      profilePicture: user.profilePicture,
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Input presence check — prevents crash if body is empty
  if (!email?.trim() || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    user: {
      _id:            user._id,
      name:           user.name,
      email:          user.email,
      university:     user.university,
      phone:          user.phone,
      role:           user.role,
      skills:         user.skills,
      profilePicture: user.profilePicture,
    },
  });
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
