// Organization Management Routes - Enterprise Features

import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { 
  requirePermission, 
  requireRoleLevel,
  getUserPermissions,
  auditTrail 
} from '../middleware/enterprise-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get organization details
router.get('/',
  requirePermission('organization', 'read'),
  async (req, res) => {
    try {
      const organizationId = req.organizationId;
      
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
              lastLogin: true,
              createdAt: true
            }
          },
          properties: {
            select: {
              id: true,
              address: true,
              city: true,
              state: true,
              type: true,
              status: true
            }
          },
          _count: {
            select: {
              users: true,
              properties: true,
              userRoles: true
            }
          }
        }
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json({ organization });
    } catch (error) {
      console.error('Get organization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update organization settings
router.patch('/',
  requireRoleLevel(9), // Admin level
  auditTrail('organization'),
  [
    body('name').optional().isLength({ min: 1 }).trim(),
    body('type').optional().isIn(['INDIVIDUAL_LANDLORD', 'PROPERTY_MANAGEMENT', 'REAL_ESTATE_COMPANY', 'INVESTMENT_FIRM', 'OTHER']),
    body('settings').optional().isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const organizationId = req.organizationId;
      const updateData = {};
      
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.type) updateData.type = req.body.type;
      if (req.body.settings) updateData.settings = req.body.settings;
      if (req.body.logo) updateData.logo = req.body.logo;
      if (req.body.address) updateData.address = req.body.address;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.website) updateData.website = req.body.website;

      const organization = await prisma.organization.update({
        where: { id: organizationId },
        data: updateData
      });

      res.json({ organization });
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get organization users with roles
router.get('/users',
  requirePermission('users', 'read'),
  async (req, res) => {
    try {
      const organizationId = req.organizationId;
      
      const users = await prisma.user.findMany({
        where: { organizationId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          userRoles: {
            where: { isActive: true },
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                  description: true
                }
              }
            }
          },
          assignments: {
            where: { isActive: true },
            include: {
              property: {
                select: {
                  id: true,
                  address: true,
                  city: true,
                  state: true
                }
              }
            }
          }
        }
      });

      res.json({ users });
    } catch (error) {
      console.error('Get organization users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Invite user to organization
router.post('/users/invite',
  requirePermission('users', 'create'),
  requireRoleLevel(7), // Manager level
  auditTrail('user'),
  [
    body('email').isEmail().normalizeEmail(),
    body('firstName').isLength({ min: 1 }).trim(),
    body('lastName').isLength({ min: 1 }).trim(),
    body('roleId').isString(),
    body('propertyIds').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const organizationId = req.organizationId;
      const { email, firstName, lastName, roleId, propertyIds = [] } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'User with this email already exists' 
        });
      }

      // Verify role exists and user has permission to assign it
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Check if requesting user can assign this role level
      const userPermissions = await getUserPermissions(req.user.userId, organizationId);
      if (userPermissions.maxLevel <= role.level) {
        return res.status(403).json({ 
          error: 'Cannot assign role with level equal or higher than your own' 
        });
      }

      // Generate temporary password (in production, send invitation email)
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          organizationId,
          isActive: true
        }
      });

      // Assign role
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: role.id,
          organizationId,
          assignedBy: req.user.userId
        }
      });

      // Create property assignments if specified
      if (propertyIds.length > 0) {
        const assignments = propertyIds.map(propertyId => ({
          userId: newUser.id,
          propertyId,
          roleType: 'MANAGER', // Default assignment role
          organizationId,
          assignedBy: req.user.userId
        }));

        await prisma.assignment.createMany({
          data: assignments
        });
      }

      res.status(201).json({ 
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        },
        tempPassword, // In production, this would be sent via email
        message: 'User invited successfully'
      });
    } catch (error) {
      console.error('Invite user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update user role
router.patch('/users/:userId/role',
  requirePermission('users', 'update'),
  requireRoleLevel(7),
  auditTrail('user'),
  [
    body('roleId').isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const organizationId = req.organizationId;
      const { userId } = req.params;
      const { roleId } = req.body;

      // Verify role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Check permissions
      const userPermissions = await getUserPermissions(req.user.userId, organizationId);
      if (userPermissions.maxLevel <= role.level) {
        return res.status(403).json({ 
          error: 'Cannot assign role with level equal or higher than your own' 
        });
      }

      // Deactivate existing roles
      await prisma.userRole.updateMany({
        where: {
          userId,
          organizationId,
          isActive: true
        },
        data: { isActive: false }
      });

      // Assign new role
      await prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
          organizationId,
          assignedBy: req.user.userId
        }
      });

      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Assign user to property
router.post('/users/:userId/assignments',
  requirePermission('assignments', 'create'),
  requireRoleLevel(5),
  auditTrail('assignment'),
  [
    body('propertyId').isString(),
    body('roleType').isIn(['VIEWER', 'COORDINATOR', 'MANAGER', 'ADMIN'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const organizationId = req.organizationId;
      const { userId } = req.params;
      const { propertyId, roleType, permissions } = req.body;

      // Verify property belongs to organization
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          organizationId
        }
      });

      if (!property) {
        return res.status(400).json({ error: 'Property not found' });
      }

      // Create or update assignment
      const assignment = await prisma.assignment.upsert({
        where: {
          userId_propertyId: {
            userId,
            propertyId
          }
        },
        update: {
          roleType,
          permissions,
          assignedBy: req.user.userId,
          isActive: true
        },
        create: {
          userId,
          propertyId,
          roleType,
          permissions,
          organizationId,
          assignedBy: req.user.userId
        }
      });

      res.json({ assignment });
    } catch (error) {
      console.error('Assign user to property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get available roles
router.get('/roles',
  requirePermission('roles', 'read'),
  async (req, res) => {
    try {
      const organizationId = req.organizationId;
      
      // Get system roles and organization-specific roles
      const roles = await prisma.role.findMany({
        where: {
          OR: [
            { isSystemRole: true },
            { organizationId }
          ]
        },
        orderBy: [
          { level: 'desc' },
          { name: 'asc' }
        ]
      });

      res.json({ roles });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get audit logs
router.get('/audit',
  requirePermission('audit', 'read'),
  requireRoleLevel(7),
  async (req, res) => {
    try {
      const organizationId = req.organizationId;
      const { limit = 50, offset = 0, entityType, userId } = req.query;

      const where = {
        organizationId,
        ...(entityType && { entityType: entityType.toUpperCase() }),
        ...(userId && { userId })
      };

      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      const total = await prisma.auditLog.count({ where });

      res.json({ 
        auditLogs,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
