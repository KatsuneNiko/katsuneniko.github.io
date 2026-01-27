import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Import routes
import authRoutes from './routes/auth.js';
import cardRoutes from './routes/cards.js';
import githubRoutes from './routes/github.js';

// Import services
import { initializeYGOProDeckCache, updatePricesDaily } from './services/ygoproService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'yugioh-binder'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  // Initialize YGOProDeck cache on startup
  initializeYGOProDeckCache();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/github', githubRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Scheduled jobs
// Update YGOProDeck cache weekly (every Sunday at 2 AM)
cron.schedule('0 2 * * 0', async () => {
  console.log('🔄 Running weekly YGOProDeck cache update...');
  await initializeYGOProDeckCache();
});

// Update prices daily (every day at 3 AM)
cron.schedule('0 3 * * *', async () => {
  console.log('🔄 Running daily price update...');
  await updatePricesDaily();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
