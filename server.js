const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static('.'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 5000,
  maxPoolSize: 10
}).then(() => {
  console.log('Connected to MongoDB Atlas');
  console.log('Database: attention_tracker');
  console.log('Collections: users, sessions');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePhoto: { type: String, default: '' },
  dateOfBirth: { type: Date },
  lastLowAttentionAlert: { type: Date },
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  streak: { type: Number, default: 0 },
  lastSessionDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Create indexes for better performance
userSchema.index({ role: 1, points: -1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Session Schema
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: Date,
  endTime: Date,
  duration: Number,
  averageAttention: Number,
  dataPoints: Number,
  sessionData: Array
});

const Session = mongoose.model('Session', sessionSchema);

// Create indexes for better performance
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ averageAttention: -1 });

// Email Configuration
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

async function sendLowAttentionAlert(user, session) {
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) return;

  const mailOptions = {
    from: EMAIL_USER,
    to: admin.email,
    subject: `Low Attention Alert - ${user.username}`,
    html: `
      <h2>Low Attention Alert</h2>
      <p><strong>User:</strong> ${user.username} (${user.email})</p>
      <p><strong>Attention Score:</strong> ${Math.round(session.averageAttention)}%</p>
      <p><strong>Duration:</strong> ${Math.round(session.duration / 60)} minutes</p>
      <p><strong>Time:</strong> ${new Date(session.endTime).toLocaleString()}</p>
      <hr>
      <p style="color: red;">This user's attention has been consistently low. Please review their session data.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Low attention alert sent to admin');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Save session
app.post('/api/sessions', auth, async (req, res) => {
  try {
    const session = new Session({ ...req.body, userId: req.userId });
    await session.save();
    const user = await User.findById(req.userId);
    
    // Points & Gamification
    const points = Math.round(session.averageAttention);
    user.points = (user.points || 0) + points;
    
    // Streak calculation
    const today = new Date().setHours(0,0,0,0);
    const lastSession = user.lastSessionDate ? new Date(user.lastSessionDate).setHours(0,0,0,0) : 0;
    const daysDiff = (today - lastSession) / (1000 * 60 * 60 * 24);
    user.streak = daysDiff === 1 ? (user.streak || 0) + 1 : daysDiff === 0 ? user.streak : 1;
    user.lastSessionDate = new Date();
    
    // Badges
    if (!user.badges) user.badges = [];
    if (user.streak >= 7 && !user.badges.includes('7-day-streak')) user.badges.push('7-day-streak');
    if (session.averageAttention >= 90 && !user.badges.includes('focus-master')) user.badges.push('focus-master');
    if (user.points >= 1000 && !user.badges.includes('1k-points')) user.badges.push('1k-points');
    
    // Check for low attention and send alert
    if (session.averageAttention < 50) {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      if (!user.lastLowAttentionAlert || user.lastLowAttentionAlert < twoHoursAgo) {
        await sendLowAttentionAlert(user, session);
        user.lastLowAttentionAlert = now;
      }
    }
    
    await user.save();
    res.json({ success: true, session, points, streak: user.streak, badges: user.badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user sessions (admin sees all)
app.get('/api/sessions', auth, async (req, res) => {
  try {
    const query = req.userRole === 'admin' ? {} : { userId: req.userId };
    const sessions = await Session.find(query).populate('userId', 'username email').sort({ startTime: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all users
app.get('/api/admin/users', auth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get leaderboard (accessible to all authenticated users) - Optimized
app.get('/api/admin/leaderboard', auth, async (req, res) => {
  try {
    // Get all users with role 'user'
    const users = await User.find({ role: 'user' })
      .select('username level points streak totalSessions badges')
      .sort({ points: -1 })
      .lean();
    
    // Calculate average attention from user's sessions
    const leaderboard = await Promise.all(users.map(async (user) => {
      const sessions = await Session.find({ userId: user._id })
        .select('averageAttention')
        .lean();
      const avgAttention = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.averageAttention || 0), 0) / sessions.length
        : 0;
      return { ...user, avgAttention, totalSessions: sessions.length };
    }));
    
    // Sort by average attention (users without sessions will have 0)
    const sortedLeaderboard = leaderboard
      .sort((a, b) => (b.avgAttention || 0) - (a.avgAttention || 0));
    
    res.json({ success: true, leaderboard: sortedLeaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get statistics
app.get('/api/admin/stats', auth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSessions = await Session.countDocuments();
    const avgAttention = await Session.aggregate([{ $group: { _id: null, avg: { $avg: '$averageAttention' } } }]);
    const totalPoints = await User.aggregate([{ $match: { role: 'user' } }, { $group: { _id: null, total: { $sum: '$points' } } }]);
    
    res.json({ 
      success: true, 
      stats: {
        totalUsers,
        totalSessions,
        avgAttention: Math.round(avgAttention[0]?.avg || 0),
        totalPoints: totalPoints[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get leaderboard (public endpoint for all users) - Optimized
app.get('/api/leaderboard', auth, async (req, res) => {
  try {
    // Get all users with role 'user'
    const users = await User.find({ role: 'user' })
      .select('username level points streak totalSessions badges')
      .sort({ points: -1 })
      .lean();
    
    console.log('Total users found:', users.length);
    
    // Calculate average attention from user's sessions
    const leaderboard = await Promise.all(users.map(async (user) => {
      const sessions = await Session.find({ userId: user._id })
        .select('averageAttention')
        .lean();
      const avgAttention = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.averageAttention || 0), 0) / sessions.length
        : 0;
      console.log(`User ${user.username}: ${sessions.length} sessions, avg: ${avgAttention}`);
      return { ...user, avgAttention, totalSessions: sessions.length };
    }));
    
    // Sort by average attention (users without sessions will have 0)
    const sortedLeaderboard = leaderboard
      .sort((a, b) => (b.avgAttention || 0) - (a.avgAttention || 0));
    
    console.log('Total leaderboard count:', sortedLeaderboard.length);
    
    res.json({ success: true, leaderboard: sortedLeaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get sessions by userId
app.get('/api/admin/sessions/:userId', auth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ startTime: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId, '-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
app.put('/api/profile', auth, async (req, res) => {
  try {
    const { username, email, dateOfBirth, profilePhoto } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, 
      { username, email, dateOfBirth, profilePhoto },
      { new: true, select: '-password' }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
app.put('/api/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create admin
app.get('/api/create-admin', async (req, res) => {
  try {
    const existing = await User.findOne({ email: 'admin@attention.com' });
    if (existing) return res.json({ message: 'Admin exists', email: 'admin@attention.com' });
    await new User({
      username: 'admin',
      email: 'admin@attention.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    }).save();
    res.json({ success: true, message: 'Admin created!', email: 'admin@attention.com', password: 'admin123' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test endpoint - creates sample data
app.get('/api/test-data', async (req, res) => {
  try {
    const testUser = await User.findOne({ email: 'test@example.com' }) || 
      await new User({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('test123', 10)
      }).save();

    const testSession = await new Session({
      userId: testUser._id,
      startTime: new Date(),
      endTime: new Date(),
      duration: 3600,
      averageAttention: 75.5,
      dataPoints: 100,
      sessionData: [{ timestamp: Date.now(), attention: 75 }]
    }).save();

    res.json({ 
      success: true, 
      message: 'Test data created! Check MongoDB Atlas now.',
      user: testUser.email,
      session: testSession._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server: http://localhost:3000');
  console.log('Create admin: http://localhost:3000/api/create-admin');
  console.log('Test data: http://localhost:3000/api/test-data');
  console.log('Register: http://localhost:3000/register.html');
  console.log('Email alerts: Enabled (sends when attention < 50%)');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port 3000 is already in use!');
    console.log('Solutions:');
    console.log('1. Stop the existing server (Ctrl+C)');
    console.log('2. Kill process: netstat -ano | findstr :3000, then taskkill /PID <PID> /F');
    console.log('3. Change port in server.js');
    process.exit(1);
  }
});
