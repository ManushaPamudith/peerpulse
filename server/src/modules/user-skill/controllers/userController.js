import User from '../models/User.js';

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { profilePicture: imageUrl });
    res.json({ success: true, profilePicture: imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

export const deleteProfilePicture = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { profilePicture: '' });
    res.json({ success: true, message: 'Profile picture removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove profile picture' });
  }
};

export const getPublicProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Explicitly return only safe public fields — never expose email, phone, password
  const publicProfile = {
    _id:           user._id,
    name:          user.name,
    university:    user.university,
    bio:           user.bio,
    profilePicture:user.profilePicture,
    role:          user.role,
    averageRating: user.averageRating,
    reviewCount:   user.reviewCount,
    createdAt:     user.createdAt,
    skills: (user.skills || []).map(s => ({
      _id:                s._id,
      skill:              s.skill,
      level:              s.level,
      type:               s.type,
      verified:           s.verified,
      verificationStatus: s.verificationStatus || (s.verified ? 'verified' : 'unverified'),
      verificationMethod: s.verificationMethod,
      categoryKey:        s.categoryKey,
      moduleCode:         s.moduleCode,
    })),
  };

  res.json({ success: true, user: publicProfile });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Name — if provided, must not be blank and must meet length requirements
  if (req.body.name !== undefined) {
    const name = req.body.name.trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }
    if (name.length < 3) {
      return res.status(400).json({ success: false, message: 'Name must be at least 3 characters' });
    }
    if (name.length > 60) {
      return res.status(400).json({ success: false, message: 'Name must be 60 characters or fewer' });
    }
    user.name = name;
  }

  // Phone — optional, must be valid Sri Lankan mobile if provided
  if (req.body.phone !== undefined) {
    const phone = req.body.phone.trim();
    if (phone !== '' && !/^0[0-9]{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be 10 digits starting with 0 (e.g. 0771234567)' });
    }
    user.phone = phone;
  }

  // Bio — optional, cap at 300 characters
  if (req.body.bio !== undefined) {
    const bio = req.body.bio.trim();
    if (bio.length > 300) {
      return res.status(400).json({ success: false, message: 'Bio must be 300 characters or fewer' });
    }
    user.bio = bio;
  }

  if (req.body.university !== undefined && req.body.university.trim()) {
    user.university = req.body.university.trim();
  }
  if (req.body.profilePicture !== undefined) {
    user.profilePicture = req.body.profilePicture;
  }

  await user.save();
  res.json({ success: true, message: 'Profile updated', user });
};

export const addSkill = async (req, res) => {
  const { skill, level, type, categoryKey, moduleCode } = req.body;

  if (!skill?.trim() || !level || !type) {
    return res.status(400).json({ success: false, message: 'Skill name, level, and type are required' });
  }

  const trimmedSkill = skill.trim();
  if (trimmedSkill.length < 2) {
    return res.status(400).json({ success: false, message: 'Skill name must be at least 2 characters' });
  }
  if (trimmedSkill.length > 80) {
    return res.status(400).json({ success: false, message: 'Skill name must be 80 characters or fewer' });
  }

  const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ success: false, message: 'Level must be Beginner, Intermediate, Advanced, or Expert' });
  }

  const VALID_TYPES = ['Technical Skill', 'Academic Module'];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'Type must be Technical Skill or Academic Module' });
  }

  if (type === 'Technical Skill' && !categoryKey?.trim()) {
    return res.status(400).json({ success: false, message: 'Please select a category for this technical skill' });
  }

  if (type === 'Academic Module' && !moduleCode?.trim()) {
    return res.status(400).json({ success: false, message: 'Please select an academic module from the list' });
  }

  const user = await User.findById(req.user._id);
  const duplicate = user.skills.some((item) => item.skill.toLowerCase() === trimmedSkill.toLowerCase());
  if (duplicate) {
    return res.status(400).json({ success: false, message: 'You already have a skill with this name' });
  }

  user.skills.push({
    skill:       trimmedSkill,
    level,
    type,
    categoryKey: type === 'Technical Skill' ? categoryKey.trim() : '',
    moduleCode:  type === 'Academic Module'  ? moduleCode.trim()  : '',
  });
  await user.save();

  res.status(201).json({ success: true, message: 'Skill added', skills: user.skills });
};

export const verifySkill = async (req, res) => {
  const { skillId } = req.params;
  const { method, score } = req.body;
  const user = await User.findById(req.user._id);
  const skill = user.skills.id(skillId);

  if (!skill) {
    return res.status(404).json({ success: false, message: 'Skill not found' });
  }

  if (method === 'grade') {
    skill.verified = true;
    skill.verificationMethod = 'grade';
  } else if (method === 'mcq') {
    const numericScore = Number(score);
    if (numericScore < 70) {
      return res.status(400).json({ success: false, message: 'MCQ score must be 70 or above' });
    }
    skill.verified = true;
    skill.verificationMethod = 'mcq';
  } else {
    return res.status(400).json({ success: false, message: 'Invalid verification method' });
  }

  await user.save();
  res.json({ success: true, message: 'Skill verified', skills: user.skills });
};

export const updateSkill = async (req, res) => {
  const { skillId } = req.params;
  const { skill, level, type, categoryKey, moduleCode } = req.body;

  if (!skill?.trim() || !level || !type) {
    return res.status(400).json({ success: false, message: 'Skill name, level, and type are required' });
  }

  const trimmedSkill = skill.trim();
  if (trimmedSkill.length < 2) {
    return res.status(400).json({ success: false, message: 'Skill name must be at least 2 characters' });
  }
  if (trimmedSkill.length > 80) {
    return res.status(400).json({ success: false, message: 'Skill name must be 80 characters or fewer' });
  }

  const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ success: false, message: 'Level must be Beginner, Intermediate, Advanced, or Expert' });
  }

  const VALID_TYPES = ['Technical Skill', 'Academic Module'];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'Type must be Technical Skill or Academic Module' });
  }

  if (type === 'Technical Skill' && !categoryKey?.trim()) {
    return res.status(400).json({ success: false, message: 'Please select a category for this technical skill' });
  }

  if (type === 'Academic Module' && !moduleCode?.trim()) {
    return res.status(400).json({ success: false, message: 'Please select an academic module from the list' });
  }

  const user = await User.findById(req.user._id);
  const existing = user.skills.id(skillId);
  if (!existing) return res.status(404).json({ success: false, message: 'Skill not found' });

  if (existing.verificationStatus === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'This skill is under admin review. Changes are not allowed until the review is completed.',
    });
  }
  if (existing.verificationStatus === 'verified') {
    return res.status(403).json({
      success: false,
      message: 'Verified skills cannot be edited. Contact an admin if a change is needed.',
    });
  }

  const duplicate = user.skills.some(
    (s) => s._id.toString() !== skillId && s.skill.toLowerCase() === trimmedSkill.toLowerCase()
  );
  if (duplicate) {
    return res.status(400).json({ success: false, message: 'Another skill with that name already exists' });
  }

  existing.skill       = trimmedSkill;
  existing.level       = level;
  existing.type        = type;
  existing.categoryKey = type === 'Technical Skill' ? categoryKey.trim() : '';
  existing.moduleCode  = type === 'Academic Module'  ? moduleCode.trim()  : '';

  // If the skill was previously rejected, reset to unverified so it can be re-submitted
  if (existing.verificationStatus === 'rejected') {
    existing.verificationStatus = 'unverified';
  }

  await user.save();

  res.json({ success: true, message: 'Skill updated', skills: user.skills });
};

export const deleteSkill = async (req, res) => {
  const { skillId } = req.params;
  const user = await User.findById(req.user._id);
  const skill = user.skills.id(skillId);
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

  // Block deletion while pending or verified
  if (skill.verificationStatus === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'This skill is under admin review. Deletion is not allowed until the review is completed.',
    });
  }
  if (skill.verificationStatus === 'verified') {
    return res.status(403).json({
      success: false,
      message: 'Verified skills cannot be deleted. Contact an admin if removal is needed.',
    });
  }

  user.skills.pull(skillId);
  await user.save();
  res.json({ success: true, message: 'Skill deleted', skills: user.skills });
};
