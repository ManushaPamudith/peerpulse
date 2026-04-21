import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './modules/user-skill/routes/authRoutes.js';
import userRoutes from './modules/user-skill/routes/userRoutes.js';
import verificationRoutes from './modules/user-skill/routes/verificationRoutes.js';
import requestRoutes from './modules/requests-matching/routes/requestRoutes.js';
import sessionRoutes from './modules/sessions-booking/routes/sessionRoutes.js';
import notificationRoutes from './modules/sessions-booking/routes/notificationRoutes.js';
import reviewRoutes from './modules/feedback-reports/routes/reviewRoutes.js';
import adminRoutes from './modules/feedback-reports/routes/adminRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// --- CORS Configuration (Fixes the "CORS Error") ---
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175", "http://localhost:5178", "http://127.0.0.1:5178"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files (profile pictures, session notes) as static assets
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PeerPulse API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verifications', verificationRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});

// Port configuration (Using 5001 as 5000 is busy)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 PeerPulse server running on port ${PORT}`);
});