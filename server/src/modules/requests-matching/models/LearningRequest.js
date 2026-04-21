import mongoose from 'mongoose';

const learningRequestSchema = new mongoose.Schema(
  {
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Expired'], default: 'Pending' },
    priority: { type: String, default: 'Normal' },
    isWithdrawn: { type: Boolean, default: false },
    withdrawnAt: { type: Date, default: null },
    withdrawnReason: { type: String, default: '', trim: true },
    expiresAt: { type: Date },
    matchingScore: { type: Number, default: 0, min: 0, max: 100 },
    acceptedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    cancelableUntil: { type: Date, default: null }
  },
  { timestamps: true }
);

// Auto-set expiration to 48 hours from creation and normalize priority
learningRequestSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 48);
    this.expiresAt = expirationTime;
  }
  // Normalize priority to proper case
  if (this.priority) {
    this.priority = this.priority.charAt(0).toUpperCase() + this.priority.slice(1).toLowerCase();
  } else {
    this.priority = 'Normal';
  }
  next();
});

const LearningRequest = mongoose.model('LearningRequest', learningRequestSchema);
export default LearningRequest;
