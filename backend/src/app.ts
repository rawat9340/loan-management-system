import 'express-async-errors';
import dotenv from 'dotenv';
// Load env vars FIRST before any other imports that might use them
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db';

// Routes
import authRoutes from './routes/auth.routes';
import borrowerRoutes from './routes/borrower.routes';
import loanRoutes from './routes/loan.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/borrower', borrowerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err: Error & { status?: number; code?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err.message);

  // Mongoose duplicate key
  if (err.code === 11000) {
    res.status(409).json({ success: false, message: 'Duplicate entry. Record already exists.' });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LMS Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;
