import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true,
    },
    type: {
      type: String,
      enum: ['Academic Module', 'Technical Skill'],
      required: true,
    },
    // For Technical Skills: the category key chosen at skill-add time
    // e.g. "web_development", "database", "programming_fundamentals"
    categoryKey: { type: String, default: '' },
    // For Academic Modules: the module code chosen at skill-add time
    // e.g. "IT3020", "IT2070"
    moduleCode: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    verificationMethod: {
      type: String,
      enum: ['none', 'grade', 'mcq'],
      default: 'none',
    },
    // Tracks the full verification lifecycle: unverified → pending → verified | rejected
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    university: { type: String, default: 'SLIIT' },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
    skills: [skillSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    availability: {
      isAvailable: { type: Boolean, default: true },
      timezone: { type: String, default: 'UTC' },
      preferredDays: { type: [String], default: [] },
      preferredHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' }
      }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
