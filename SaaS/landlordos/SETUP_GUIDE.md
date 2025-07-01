# LandlordOS - Complete Setup Guide

*Last Updated: December 19, 2024 - Post-Modernization*

> **✨ Note**: This project has been completely modernized with premium UI/UX design, advanced animations, tier-based features, and modern React patterns. See [FRONTEND_MODERNIZATION_COMPLETE.md](./FRONTEND_MODERNIZATION_COMPLETE.md) for details on the recent improvements.

This guide will walk you through creating the LandlordOS property management SaaS application from scratch. Follow these steps carefully to recreate the entire project.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure Setup](#project-structure-setup)
3. [Backend Setup (Express/Prisma/PostgreSQL)](#backend-setup)
4. [Frontend Setup (React/Vite/TypeScript)](#frontend-setup)
5. [Database Configuration](#database-configuration)
6. [Authentication Implementation](#authentication-implementation)
7. [API Routes Development](#api-routes-development)
8. [Frontend Components](#frontend-components)
9. [Testing & Verification](#testing--verification)
10. [Troubleshooting](#troubleshooting)

## 🎉 **What's New in the Modernized Version**
- **Premium UI/UX**: Glassmorphism effects, gradients, animations with Framer Motion
- **Enhanced Components**: EnhancedCards, DashboardModern, GlassMorphism components
- **Tier-based Features**: FREE/BASIC/PREMIUM tiers with AdSense integration
- **Modern Stack**: React 19, TypeScript 5.8, Tailwind CSS 3.4, Vite 6.3
- **Security**: Comprehensive CSP, proper error handling, console error resolution
- **Responsive Design**: Mobile-first approach with perfect scaling

## Additional Resources
- **[README.md](./README.md)** - Complete project overview and quick start
- **[CURRENT_STATUS.md](./CURRENT_STATUS.md)** - Current project status and features
- **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** - Detailed running instructions
- **[FRONTEND_ENHANCEMENT_ROADMAP.md](./FRONTEND_ENHANCEMENT_ROADMAP.md)** - Future improvement suggestions
- **[FRONTEND_MODERNIZATION_COMPLETE.md](./FRONTEND_MODERNIZATION_COMPLETE.md)** - Modernization summary

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (version 18+ recommended)
- **npm** or **yarn** package manager  
- **PostgreSQL** database server
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

### System Requirements
- Windows 10/11, macOS, or Linux
- At least 4GB RAM
- 2GB free disk space

## Project Structure Setup

### 1. Create Root Directory
```bash
mkdir landlordos
cd landlordos
```

### 2. Initialize Git Repository
```bash
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
echo "build/" >> .gitignore
```

### 3. Create Project Structure
```bash
# Create main directories
mkdir server client docs scripts

# Create subdirectories
mkdir server/src server/prisma server/uploads
mkdir server/src/routes server/src/middleware server/src/utils
mkdir client/src client/public
mkdir client/src/components client/src/pages client/src/services client/src/contexts client/src/hooks
```

## Backend Setup

### 1. Initialize Backend Project
```bash
cd server
npm init -y
```

### 2. Install Backend Dependencies
```bash
# Core dependencies
npm install express cors helmet dotenv bcryptjs jsonwebtoken
npm install @prisma/client prisma express-validator express-rate-limit
npm install multer

# Development dependencies
npm install -D nodemon
```

### 3. Update package.json Scripts
Edit `server/package.json`:
```json
{
  "name": "@landlordos/server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

### 4. Create Environment Configuration
Create `server/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/landlordos_dev"

# JWT
JWT_SECRET="landlordos_super_secure_jwt_secret_2025"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
```

### 5. Create Prisma Schema
Create `server/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Tier Enum
enum UserTier {
  FREE
  BASIC
  PREMIUM
}

// Property Type Enum
enum PropertyType {
  SINGLE_FAMILY
  DUPLEX
  CONDO
  TOWNHOUSE
  APARTMENT
  OTHER
}

// Lease Status Enum
enum LeaseStatus {
  ACTIVE
  EXPIRED
  TERMINATED
  PENDING
}

// Maintenance Status Enum
enum MaintenanceStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// User model for landlords/property managers
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  phone     String?
  avatar    String?
  tier      UserTier @default(FREE)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  properties Property[]
  expenses   Expense[]
  reminders  Reminder[]

  @@map("users")
}

// Property model
model Property {
  id          String        @id @default(cuid())
  address     String
  city        String
  state       String
  zipCode     String
  type        PropertyType  @default(SINGLE_FAMILY)
  bedrooms    Int?
  bathrooms   Float?
  squareFeet  Int?
  purchasePrice Float?
  currentValue  Float?
  mortgage      Float?
  insurance     PropertyInsurance?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Foreign Keys
  ownerId     String
  owner       User          @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  // Relations
  leases      Lease[]
  expenses    Expense[]
  maintenanceTasks MaintenanceTask[]
  reminders   Reminder[]

  @@map("properties")
}

// Property Insurance model
model PropertyInsurance {
  id          String   @id @default(cuid())
  provider    String
  policyNumber String
  premium     Float
  deductible  Float
  coverage    Float
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Foreign Keys
  propertyId  String   @unique
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@map("property_insurance")
}

// Tenant model
model Tenant {
  id          String    @id @default(cuid())
  firstName   String
  lastName    String
  email       String    @unique
  phone       String?
  emergencyContact String?
  emergencyPhone   String?
  dateOfBirth DateTime?
  ssn         String?   // Encrypted
  employerName String?
  employerPhone String?
  monthlyIncome Float?
  creditScore Int?
  backgroundCheck Boolean @default(false)
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  leases      Lease[]

  @@map("tenants")
}

// Lease model
model Lease {
  id           String      @id @default(cuid())
  monthlyRent  Float
  securityDeposit Float?
  leaseStart   DateTime
  leaseEnd     DateTime
  status       LeaseStatus @default(PENDING)
  terms        String?
  notes        String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Foreign Keys
  propertyId   String
  property     Property    @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  tenantId     String
  tenant       Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("leases")
}

// Expense model
model Expense {
  id          String   @id @default(cuid())
  amount      Float
  description String
  category    String
  date        DateTime
  receipt     String?  // File path
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Foreign Keys
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("expenses")
}

// Maintenance Task model
model MaintenanceTask {
  id          String            @id @default(cuid())
  title       String
  description String
  priority    String            @default("MEDIUM")
  status      MaintenanceStatus @default(PENDING)
  cost        Float?
  scheduledDate DateTime?
  completedDate DateTime?
  contractorName String?
  contractorPhone String?
  notes       String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  // Foreign Keys
  propertyId  String
  property    Property          @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@map("maintenance_tasks")
}

// Reminder model
model Reminder {
  id          String   @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Foreign Keys
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  propertyId  String?
  property    Property? @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@map("reminders")
}
```

## Database Configuration

### 1. Set Up PostgreSQL Database
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE landlordos_dev;
CREATE USER landlordos_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE landlordos_dev TO landlordos_user;
```

### 2. Initialize Prisma
```bash
cd server
npx prisma generate
npx prisma db push
```

### 3. Verify Database Connection
```bash
npx prisma studio
```

## Backend Implementation

### 1. Create Main Server File
Create `server/src/index.js`:
```javascript
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

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

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
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/properties', authMiddleware, propertyRoutes);
app.use('/api/tenants', authMiddleware, tenantRoutes);
app.use('/api/leases', authMiddleware, leaseRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);
app.use('/api/reminders', authMiddleware, reminderRoutes);

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
```

### 2. Create Authentication Middleware
Create `server/src/middleware/auth.js`:
```javascript
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.' 
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tier: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Access denied. Account is deactivated.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied. Token expired.' 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};

export const requireTier = (requiredTier) => {
  const tierLevels = { FREE: 0, BASIC: 1, PREMIUM: 2 };
  
  return (req, res, next) => {
    const userTierLevel = tierLevels[req.user.tier] || 0;
    const requiredTierLevel = tierLevels[requiredTier] || 0;
    
    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        error: `Access denied. ${requiredTier} tier required.`,
        currentTier: req.user.tier,
        requiredTier,
      });
    }
    
    next();
  };
};
```

### 3. Create Error Handler Middleware
Create `server/src/middleware/errorHandler.js`:
```javascript
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Duplicate entry. This record already exists.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found.',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
    });
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};
```

### 4. Create Authentication Routes
Create `server/src/routes/auth.js`:
```javascript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register new user
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        tier: 'FREE', // Default to free tier
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tier: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration',
    });
  }
});

// Login user
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login',
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        tier: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error fetching profile',
    });
  }
});

export default router;
```

### 5. Create Additional Route Files

You'll need to create these route files (I'll provide the basic structure):

- `server/src/routes/dashboard.js` - Dashboard statistics
- `server/src/routes/properties.js` - Property CRUD operations
- `server/src/routes/tenants.js` - Tenant management
- `server/src/routes/leases.js` - Lease management
- `server/src/routes/expenses.js` - Expense tracking
- `server/src/routes/maintenance.js` - Maintenance requests
- `server/src/routes/reminders.js` - Reminders and notifications

(Due to length constraints, I'll include the key ones - dashboard and properties - in the following sections)

## Frontend Setup

### 1. Initialize Frontend Project
```bash
cd ../client
npm create vite@latest . -- --template react-ts
```

### 2. Install Frontend Dependencies
```bash
# Core dependencies
npm install react-router-dom @tanstack/react-query axios
npm install @headlessui/react @heroicons/react lucide-react
npm install tailwindcss postcss autoprefixer

# Development dependencies
npm install -D @types/react @types/react-dom
npm install -D eslint @typescript-eslint/eslint-plugin
```

### 3. Configure Tailwind CSS
```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Update package.json Scripts
```json
{
  "name": "@landlordos/client",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### 5. Create Environment Configuration
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Testing & Verification

### 1. Start Backend Server
```bash
cd server
npm run dev
```

### 2. Start Frontend Server
```bash
cd client
npm run dev
```

### 3. Test Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **CORS Errors**
   - Verify CORS_ORIGIN in server .env
   - Check frontend URL matches allowed origins

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure consistent secret across requests

4. **Port Conflicts**
   - Backend: Default port 5000
   - Frontend: Default port 5173
   - Change PORT in .env if needed

### Debug Commands
```bash
# Check running processes
lsof -i :5000
lsof -i :5173

# View logs
npm run dev # Shows real-time logs

# Database inspection
npx prisma studio
```

## Next Steps

After completing this setup:

1. Implement remaining API routes
2. Build frontend components
3. Add advanced features (file uploads, notifications)
4. Implement proper error handling
5. Add comprehensive testing
6. Set up deployment pipeline

## Security Considerations

- Use strong JWT secrets in production
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Regular security updates
- Implement proper RBAC

## Performance Optimization

- Database indexing
- Query optimization
- Caching strategies
- Code splitting
- Image optimization
- CDN usage

---

This guide provides a solid foundation for building the LandlordOS application. Each section can be expanded based on specific requirements and features needed.
