import User from '../models/User.js';
import SkillVerification from '../models/SkillVerification.js';

const VALID_SKILL_TYPES = ['Technical Skill', 'Academic Module'];

const VALID_CATEGORY_KEYS = [
  'programming_fundamentals',
  'web_development',
  'database',
  'object_oriented_programming',
  'networking',
  'software_engineering',
];

const VALID_MODULE_CODES = [
  'IT3030', 'IT3020', 'IT3010', 'IT2070', 'IT2010', 'IT2110',
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/verifications/submit
// ─────────────────────────────────────────────────────────────────────────────
export const submitVerification = async (req, res) => {
  const {
    skillId,
    skillName,
    skillType,
    categoryKey,
    categoryLabel,
    moduleCode,
    moduleTitle,
    quizAnswers,
    score,
    totalQuestions,
    percentage,
    evidenceFile,
    passed,
  } = req.body;

  // ── Required fields ──
  if (!skillId?.trim()) {
    return res.status(400).json({ success: false, message: 'skillId is required' });
  }
  if (!skillName?.trim()) {
    return res.status(400).json({ success: false, message: 'skillName is required' });
  }
  if (!skillType) {
    return res.status(400).json({ success: false, message: 'skillType is required' });
  }

  // ── skillType enum ──
  if (!VALID_SKILL_TYPES.includes(skillType)) {
    return res.status(400).json({
      success: false,
      message: `skillType must be one of: ${VALID_SKILL_TYPES.join(', ')}`,
    });
  }

  // ── Type-specific required fields ──
  if (skillType === 'Technical Skill') {
    if (!categoryKey?.trim()) {
      return res.status(400).json({ success: false, message: 'categoryKey is required for Technical Skills' });
    }
    if (!VALID_CATEGORY_KEYS.includes(categoryKey.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid categoryKey. Must be one of: ${VALID_CATEGORY_KEYS.join(', ')}`,
      });
    }
  }

  if (skillType === 'Academic Module') {
    if (!moduleCode?.trim()) {
      return res.status(400).json({ success: false, message: 'moduleCode is required for Academic Modules' });
    }
    if (!VALID_MODULE_CODES.includes(moduleCode.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid moduleCode. Must be one of: ${VALID_MODULE_CODES.join(', ')}`,
      });
    }
  }

  // ── Score / percentage range ──
  const numScore      = Number(score);
  const numTotal      = Number(totalQuestions);
  const numPercentage = Number(percentage);

  if (!Number.isFinite(numScore) || numScore < 0) {
    return res.status(400).json({ success: false, message: 'score must be a non-negative number' });
  }
  if (!Number.isFinite(numTotal) || numTotal < 1) {
    return res.status(400).json({ success: false, message: 'totalQuestions must be at least 1' });
  }
  if (numScore > numTotal) {
    return res.status(400).json({ success: false, message: 'score cannot exceed totalQuestions' });
  }
  if (!Number.isFinite(numPercentage) || numPercentage < 0 || numPercentage > 100) {
    return res.status(400).json({ success: false, message: 'percentage must be between 0 and 100' });
  }

  // ── quizAnswers must be an array ──
  if (quizAnswers !== undefined && !Array.isArray(quizAnswers)) {
    return res.status(400).json({ success: false, message: 'quizAnswers must be an array' });
  }

  // ── Technical skills: enforce 30-minute cooldown on failed attempts ──
  if (skillType === 'Technical Skill' && !passed) {
    // Store the failed attempt so cooldown can be enforced on next try
    await SkillVerification.create({
      user:           req.user._id,
      skillId:        skillId.trim(),
      skillName:      skillName.trim(),
      skillType,
      categoryKey:    categoryKey?.trim()   || '',
      categoryLabel:  categoryLabel?.trim() || '',
      quizAnswers:    Array.isArray(quizAnswers) ? quizAnswers : [],
      score:          numScore,
      totalQuestions: numTotal,
      percentage:     numPercentage,
      status:         'rejected',
      rejectionReason: 'Failed quiz — score below 70%',
      submittedAt:    new Date(),
    });
    return res.status(400).json({
      success: false,
      message: `Quiz score ${numPercentage}% is below the required 70%. You may retry after 30 minutes.`,
    });
  }

  // ── Technical skills: check 30-minute cooldown from last failed attempt ──
  if (skillType === 'Technical Skill' && passed) {
    const lastFailed = await SkillVerification.findOne({
      user:    req.user._id,
      skillId: skillId.trim(),
      status:  'rejected',
    }).sort({ submittedAt: -1 });

    if (lastFailed) {
      const minutesSince = (Date.now() - new Date(lastFailed.submittedAt).getTime()) / 60000;
      if (minutesSince < 30) {
        const minutesLeft = Math.ceil(30 - minutesSince);
        return res.status(429).json({
          success: false,
          message: `Please wait ${minutesLeft} more minute${minutesLeft !== 1 ? 's' : ''} before retrying.`,
          retryAfterMinutes: minutesLeft,
        });
      }
    }
  }

  // ── Verify user and skill exist ──
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const skill = user.skills.id(skillId.trim());
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found on your profile' });

  // ── Skill must not already be verified ──
  if (skill.verificationStatus === 'verified') {
    return res.status(400).json({ success: false, message: 'This skill is already verified' });
  }

  // ── Prevent duplicate pending submissions ──
  const existing = await SkillVerification.findOne({
    user:    req.user._id,
    skillId: skillId.trim(),
    status:  'pending',
  });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'A pending verification request already exists for this skill. Wait for admin review.',
    });
  }

  // ── Create the verification document ──
  const verification = await SkillVerification.create({
    user:           req.user._id,
    skillId:        skillId.trim(),
    skillName:      skillName.trim(),
    skillType,
    categoryKey:    categoryKey?.trim()   || '',
    categoryLabel:  categoryLabel?.trim() || '',
    moduleCode:     moduleCode?.trim()    || '',
    moduleTitle:    moduleTitle?.trim()   || '',
    quizAnswers:    Array.isArray(quizAnswers) ? quizAnswers : [],
    score:          numScore,
    totalQuestions: numTotal,
    percentage:     numPercentage,
    evidenceFile:   evidenceFile?.trim()  || '',
    status:         'pending',
    submittedAt:    new Date(),
  });

  // ── Update skill status to pending ──
  skill.verificationStatus = 'pending';
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Verification request submitted. Pending admin review.',
    verificationId: verification._id,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/verifications/cooldown/:skillId
// Returns cooldown status for a technical skill
// ─────────────────────────────────────────────────────────────────────────────
export const getCooldownStatus = async (req, res) => {
  const lastFailed = await SkillVerification.findOne({
    user:    req.user._id,
    skillId: req.params.skillId,
    status:  'rejected',
  }).sort({ submittedAt: -1 });

  if (!lastFailed) return res.json({ success: true, onCooldown: false });

  const minutesSince = (Date.now() - new Date(lastFailed.submittedAt).getTime()) / 60000;
  if (minutesSince >= 30) return res.json({ success: true, onCooldown: false });

  const minutesLeft = Math.ceil(30 - minutesSince);
  return res.json({ success: true, onCooldown: true, minutesLeft });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/verifications/my-status
// ─────────────────────────────────────────────────────────────────────────────
export const getMyVerificationStatus = async (req, res) => {
  const user = await User.findById(req.user._id).select('skills');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const statusMap = {};
  user.skills.forEach((s) => {
    statusMap[s._id.toString()] = s.verificationStatus || 'unverified';
  });

  res.json({ success: true, statusMap });
};
