import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import tenantRoutes from './routes/tenants.js';
import leaseRoutes from './routes/leases.js';
import expenseRoutes from './routes/expenses.js';
import maintenanceRoutes from './routes/maintenance.js';
import reminderRoutes from './routes/reminders.js';
import dashboardRoutes from './routes/dashboard.js';
import organizationRoutes from './routes/organization.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { authenticateToken } from './middleware/enterprise-auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Allow specific production origins
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179',
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);

// Enterprise-enabled routes (using new authentication)
app.use('/api/organization', authenticateToken, organizationRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/properties', authenticateToken, propertyRoutes);
app.use('/api/tenants', authenticateToken, tenantRoutes);
app.use('/api/leases', authenticateToken, leaseRoutes);
app.use('/api/expenses', authenticateToken, expenseRoutes);
app.use('/api/maintenance', authenticateToken, maintenanceRoutes);
app.use('/api/reminders', authenticateToken, reminderRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LandlordOS API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
