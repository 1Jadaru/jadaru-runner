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
    }    // Generate token
    const token = generateToken(user.id);

    // Fetch full user data with enterprise structure
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
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
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            settings: true,
            createdAt: true,
          },
        },
        userRoles: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            isActive: true,
            assignedAt: true,
            role: {
              select: {
                id: true,
                name: true,
                level: true,
                permissions: true,
              },
            },
          },
        },
        assignments: {
          where: {
            isActive: true,
          },
          select: {
            propertyId: true,
          },
        },
      },
    });    // Calculate user permissions from all active roles
    const permissions = new Set();
    fullUser.userRoles?.forEach(userRole => {
      if (userRole.isActive && userRole.role?.permissions) {
        // Handle permissions whether they're stored as JSON object or array
        const rolePermissions = userRole.role.permissions;
        if (Array.isArray(rolePermissions)) {
          rolePermissions.forEach(permission => permissions.add(permission));
        } else if (typeof rolePermissions === 'object' && rolePermissions !== null) {
          // If permissions are stored as object with permission names as keys
          Object.keys(rolePermissions).forEach(permission => {
            if (rolePermissions[permission]) {
              permissions.add(permission);
            }
          });
        }
      }
    });

    // If user has "all" permission, add all specific permissions
    if (permissions.has('all')) {
      const allPermissions = [
        'READ_DASHBOARD', 'READ_PROPERTIES', 'CREATE_PROPERTIES', 'UPDATE_PROPERTIES', 'DELETE_PROPERTIES',
        'READ_TENANTS', 'CREATE_TENANTS', 'UPDATE_TENANTS', 'DELETE_TENANTS',
        'READ_LEASES', 'CREATE_LEASES', 'UPDATE_LEASES', 'DELETE_LEASES',
        'READ_EXPENSES', 'CREATE_EXPENSES', 'UPDATE_EXPENSES', 'DELETE_EXPENSES',
        'READ_MAINTENANCE', 'CREATE_MAINTENANCE', 'UPDATE_MAINTENANCE', 'DELETE_MAINTENANCE',
        'READ_REMINDERS', 'CREATE_REMINDERS', 'UPDATE_REMINDERS', 'DELETE_REMINDERS',
        'READ_PAYMENTS', 'CREATE_PAYMENTS', 'UPDATE_PAYMENTS', 'DELETE_PAYMENTS',
        'MANAGE_ORGANIZATION', 'INVITE_USERS', 'READ_USERS', 'UPDATE_USERS', 'DELETE_USERS',
        'ASSIGN_PROPERTIES', 'READ_AUDIT_LOGS'
      ];
      allPermissions.forEach(permission => permissions.add(permission));
    }

    // Get assigned property IDs
    const assignedPropertyIds = fullUser.assignments?.map(assignment => assignment.propertyId) || [];

    // Format user object for frontend
    const formattedUser = {
      ...fullUser,
      permissions: Array.from(permissions),
      assignedPropertyIds,
      assignments: undefined, // Remove raw assignments from response
    };

    res.json({
      message: 'Login successful',
      user: formattedUser,
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
router.get('/me', authMiddleware, async (req, res) => {
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
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            settings: true,
            createdAt: true,
          },
        },
        userRoles: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            isActive: true,
            assignedAt: true,
            role: {
              select: {
                id: true,
                name: true,
                level: true,
                permissions: true,
              },
            },
          },
        },
        assignments: {
          where: {
            isActive: true,
          },
          select: {
            propertyId: true,
          },
        },
        _count: {
          select: {
            properties: true,
            expenses: true,
            reminders: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }    // Calculate user permissions from all active roles
    const permissions = new Set();
    user.userRoles?.forEach(userRole => {
      if (userRole.isActive && userRole.role?.permissions) {
        // Handle permissions whether they're stored as JSON object or array
        const rolePermissions = userRole.role.permissions;
        if (Array.isArray(rolePermissions)) {
          rolePermissions.forEach(permission => permissions.add(permission));
        } else if (typeof rolePermissions === 'object' && rolePermissions !== null) {
          // If permissions are stored as object with permission names as keys
          Object.keys(rolePermissions).forEach(permission => {
            if (rolePermissions[permission]) {
              permissions.add(permission);
            }
          });
        }
      }
    });

    // If user has "all" permission, add all specific permissions
    if (permissions.has('all')) {
      const allPermissions = [
        'READ_DASHBOARD', 'READ_PROPERTIES', 'CREATE_PROPERTIES', 'UPDATE_PROPERTIES', 'DELETE_PROPERTIES',
        'READ_TENANTS', 'CREATE_TENANTS', 'UPDATE_TENANTS', 'DELETE_TENANTS',
        'READ_LEASES', 'CREATE_LEASES', 'UPDATE_LEASES', 'DELETE_LEASES',
        'READ_EXPENSES', 'CREATE_EXPENSES', 'UPDATE_EXPENSES', 'DELETE_EXPENSES',
        'READ_MAINTENANCE', 'CREATE_MAINTENANCE', 'UPDATE_MAINTENANCE', 'DELETE_MAINTENANCE',
        'READ_REMINDERS', 'CREATE_REMINDERS', 'UPDATE_REMINDERS', 'DELETE_REMINDERS',
        'READ_PAYMENTS', 'CREATE_PAYMENTS', 'UPDATE_PAYMENTS', 'DELETE_PAYMENTS',
        'MANAGE_ORGANIZATION', 'INVITE_USERS', 'READ_USERS', 'UPDATE_USERS', 'DELETE_USERS',
        'ASSIGN_PROPERTIES', 'READ_AUDIT_LOGS'
      ];
      allPermissions.forEach(permission => permissions.add(permission));
    }

    // Get assigned property IDs
    const assignedPropertyIds = user.assignments?.map(assignment => assignment.propertyId) || [];

    // Format user object for frontend
    const formattedUser = {
      ...user,
      permissions: Array.from(permissions),
      assignedPropertyIds,
      assignments: undefined, // Remove raw assignments from response
    };

    res.json({
      user: formattedUser,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error getting profile',
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  body('phone')
    .optional()
    .trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { firstName, lastName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        tier: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error updating profile',
    });
  }
});

// Refresh token
router.post('/refresh', authMiddleware, (req, res) => {
  try {
    const newToken = generateToken(req.user.id);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error refreshing token',
    });
  }
});

export default router;
