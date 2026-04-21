import mongoose from 'mongoose';

/**
 * SkillVerification — stores every quiz submission from a user.
 * Created when a user submits a verification quiz (pass or fail for technical,
 * always created for academic). Admin reviews pending entries and approves/rejects.
 */
const answerSchema = new mongoose.Schema(
  {
    questionId:     { type: Number },
    question:       { type: String, default: '' },
    selectedOption: { type: Number, default: -1 },
    correctOption:  { type: Number, default: -1 },
    isCorrect:      { type: Boolean, default: false },
  },
  { _id: false }
);

const skillVerificationSchema = new mongoose.Schema(
  {
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId:        { type: mongoose.Schema.Types.ObjectId, required: true },
    skillName:      { type: String, required: true, trim: true },
    skillType:      { type: String, enum: ['Technical Skill', 'Academic Module'], required: true },
    // Technical skills: category key e.g. "web_development"
    categoryKey:    { type: String, default: '' },
    categoryLabel:  { type: String, default: '' },
    // Academic modules: module code e.g. "IT3020"
    moduleCode:     { type: String, default: '' },
    moduleTitle:    { type: String, default: '' },
    // Quiz results
    quizAnswers:    { type: [answerSchema], default: [] },
    score:          { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentage:     { type: Number, default: 0 },
    // Evidence file (academic only, optional)
    evidenceFile:   { type: String, default: '' },
    // Lifecycle
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    submittedAt:      { type: Date, default: Date.now },
    reviewedAt:       { type: Date, default: null },
    reviewedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason:  { type: String, default: '' },
  },
  { timestamps: true }
);

const SkillVerification = mongoose.model('SkillVerification', skillVerificationSchema);
export default SkillVerification;
