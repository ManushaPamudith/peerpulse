import mongoose from 'mongoose';

const reviewFlagSchema = new mongoose.Schema(
  {
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['Spam', 'Offensive language', 'False information', 'Irrelevant'],
      required: true,
    },
  },
  { timestamps: true }
);

reviewFlagSchema.index({ review: 1, reportedBy: 1 }, { unique: true });

const ReviewFlag = mongoose.model('ReviewFlag', reviewFlagSchema);
export default ReviewFlag;
