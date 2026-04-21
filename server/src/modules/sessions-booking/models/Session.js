import mongoose from 'mongoose';

const rescheduleRequestSchema = new mongoose.Schema(
  {
    proposedAt: { type: Date },
    reason: { type: String, trim: true, default: '' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    respondedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 800 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const sessionNotesFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, default: '' },
    storedName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    path: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningRequest', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    note: { type: String, default: '', trim: true },
    learnerGoal: { type: String, default: '', trim: true },
    agenda: { type: String, default: '', trim: true },
    sessionType: { type: String, enum: ['Online', 'Physical'], default: 'Online' },
    meetingLink: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    cancellationReason: { type: String, default: '', trim: true },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rescheduleRequest: { type: rescheduleRequestSchema, default: null },
    messages: { type: [chatMessageSchema], default: [] },
    sessionNotesFile: { type: sessionNotesFileSchema, default: null },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;
