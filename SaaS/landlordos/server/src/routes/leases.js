import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { 
  requirePermission, 
  getAccessibleProperties, 
  auditTrail 
} from '../middleware/enterprise-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all leases for user's accessible properties
router.get('/', 
  requirePermission('leases', 'read'),
  auditTrail('lease'),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const organizationId = req.organizationId;
      const { status, propertyId } = req.query;
      
      // Get properties the user has access to
      const accessibleProperties = await getAccessibleProperties(
        userId, 
        organizationId, 
        'read'
      );
      
      const accessiblePropertyIds = accessibleProperties.map(p => p.id);
      
      if (accessiblePropertyIds.length === 0) {
        return res.json({ leases: [] });
      }

      const where = {
        propertyId: { in: accessiblePropertyIds },
        ...(status && { status }),
        ...(propertyId && accessiblePropertyIds.includes(propertyId) && { propertyId }),
      };      const leases = await prisma.lease.findMany({
        where,
        include: {
          property: {
            select: { 
              id: true,
              address: true, 
              city: true, 
              state: true,
              type: true,
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          payments: {
            orderBy: { dueDate: 'desc' },
            take: 3,
          },
          _count: {
            select: { payments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

    const leasesWithComputedFields = leases.map(lease => ({
      ...lease,
      tenantName: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
      propertyAddress: `${lease.property.address}, ${lease.property.city}, ${lease.property.state}`,
      isActive: lease.status === 'ACTIVE',
      daysUntilExpiry: Math.ceil((new Date(lease.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
      totalPayments: lease._count.payments,
    }));

    res.json({ 
      leases: leasesWithComputedFields,
      total: leasesWithComputedFields.length,
      accessibleProperties: accessibleProperties.length
    });
  } catch (error) {
    console.error('Get leases error:', error);
    res.status(500).json({
      error: 'Internal server error fetching leases',
    });
  }
});

// Get single lease with detailed information
router.get('/:id', 
  requirePermission('leases', 'read'),
  auditTrail('lease'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const organizationId = req.organizationId;

      // Get accessible properties to verify access
      const accessibleProperties = await getAccessibleProperties(
        userId, 
        organizationId, 
        'read'
      );
      
      const accessiblePropertyIds = accessibleProperties.map(p => p.id);

      const lease = await prisma.lease.findFirst({
        where: {
          id,
          propertyId: { in: accessiblePropertyIds },
        },
        include: {
          property: true,
          tenant: true,
          payments: {
            orderBy: { dueDate: 'desc' },
        },
        reminders: {
          where: { isCompleted: false },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!lease) {
      return res.status(404).json({
        error: 'Lease not found',
      });
    }

    res.json({ lease });
  } catch (error) {
    console.error('Get lease error:', error);
    res.status(500).json({
      error: 'Internal server error fetching lease',
    });
  }
});

// Create new lease
router.post('/', [
  body('propertyId')
    .notEmpty()
    .withMessage('Property is required'),
  body('tenantId')
    .notEmpty()
    .withMessage('Tenant is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('monthlyRent')
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  body('securityDeposit')
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'EXPIRED', 'TERMINATED'])
    .withMessage('Invalid lease status'),
  body('terms')
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

    const userId = req.user.userId;
    const { propertyId, tenantId } = req.body;

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Property not found or access denied',
      });
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    // Check for overlapping active leases for the same property
    const overlappingLease = await prisma.lease.findFirst({
      where: {
        propertyId,
        status: 'ACTIVE',
        OR: [
          {
            startDate: { lte: new Date(req.body.endDate) },
            endDate: { gte: new Date(req.body.startDate) },
          },
        ],
      },
    });

    if (overlappingLease) {
      return res.status(400).json({
        error: 'Property already has an active lease during this period',
      });
    }

    const lease = await prisma.lease.create({
      data: req.body,
      include: {
        property: {
          select: { 
            id: true,
            address: true, 
            city: true, 
            state: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Lease created successfully',
      lease,
    });
  } catch (error) {
    console.error('Create lease error:', error);
    res.status(500).json({
      error: 'Internal server error creating lease',
    });
  }
});

// Update lease
router.put('/:id', [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('monthlyRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'EXPIRED', 'TERMINATED'])
    .withMessage('Invalid lease status'),
  body('terms')
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

    const { id } = req.params;
    const userId = req.user.userId;

    // Check if lease exists and belongs to user's property
    const existingLease = await prisma.lease.findFirst({
      where: {
        id,
        property: { ownerId: userId },
      },
    });

    if (!existingLease) {
      return res.status(404).json({
        error: 'Lease not found',
      });
    }

    // Validate date changes if provided
    const startDate = req.body.startDate || existingLease.startDate;
    const endDate = req.body.endDate || existingLease.endDate;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        error: 'End date must be after start date',
      });
    }

    const lease = await prisma.lease.update({
      where: { id },
      data: req.body,
      include: {
        property: {
          select: { 
            id: true,
            address: true, 
            city: true, 
            state: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: 'Lease updated successfully',
      lease,
    });
  } catch (error) {
    console.error('Update lease error:', error);
    res.status(500).json({
      error: 'Internal server error updating lease',
    });
  }
});

// Delete lease
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if lease exists and belongs to user's property
    const lease = await prisma.lease.findFirst({
      where: {
        id,
        property: { ownerId: userId },
      },
      include: {
        payments: true,
      },
    });

    if (!lease) {
      return res.status(404).json({
        error: 'Lease not found',
      });
    }

    // Check if there are any payments associated with this lease
    if (lease.payments.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete lease with associated payments',
        paymentsCount: lease.payments.length,
      });
    }

    await prisma.lease.delete({
      where: { id },
    });

    res.json({
      message: 'Lease deleted successfully',
    });
  } catch (error) {
    console.error('Delete lease error:', error);
    res.status(500).json({
      error: 'Internal server error deleting lease',
    });
  }
});

export default router;
