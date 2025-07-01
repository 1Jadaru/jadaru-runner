import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, requirePermission, logActivity } from '../middleware/enterprise-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateUser);

// Get all tenants
router.get('/', requirePermission('READ_TENANTS'), async (req, res) => {
  try {
    const { organization, assignedPropertyIds } = req.user;

    // Build where clause for organization
    let where = {
      leases: {
        some: {
          property: {
            organizationId: organization.id,
          },
        },
      },
    };

    // Add property assignment filter if user doesn't have access to all properties
    if (assignedPropertyIds && assignedPropertyIds.length > 0) {
      where.leases.some.property.id = { in: assignedPropertyIds };
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        leases: {
          include: {
            property: {
              select: { id: true, address: true, city: true, state: true },
            },
          },
          where: { 
            status: 'ACTIVE',
            property: {
              organizationId: organization.id,
              ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                id: { in: assignedPropertyIds }
              } : {}),
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const tenantsWithCurrentProperty = tenants.map(tenant => ({
      ...tenant,
      currentProperty: tenant.leases[0]?.property || null,
      currentRent: tenant.leases[0]?.monthlyRent || null,
      isActive: tenant.leases.length > 0,
    }));

    res.json({ tenants: tenantsWithCurrentProperty });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      error: 'Internal server error fetching tenants',
    });
  }
});

// Get single tenant with detailed information
router.get('/:id', requirePermission('READ_TENANTS'), async (req, res) => {
  try {
    const { id } = req.params;
    const { organization, assignedPropertyIds } = req.user;

    const tenant = await prisma.tenant.findFirst({
      where: { 
        id,
        leases: {
          some: {
            property: {
              organizationId: organization.id,
              ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                id: { in: assignedPropertyIds }
              } : {}),
            },
          },
        },
      },
      include: {
        leases: {
          include: {
            property: true,
            payments: {
              orderBy: { dueDate: 'desc' },
              take: 10,
            },
          },
          where: {
            property: {
              organizationId: organization.id,
              ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                id: { in: assignedPropertyIds }
              } : {}),
            },
          },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    res.json({ tenant });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      error: 'Internal server error fetching tenant',
    });
  }
});

// Create new tenant
router.post('/', [
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Valid phone number is required'),
  body('emergencyContact')
    .optional()
    .trim(),
  body('emergencyPhone')
    .optional()
    .trim(),
], requirePermission('CREATE_TENANTS'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { organization } = req.user;

    // Check if email already exists within the organization
    const existingTenant = await prisma.tenant.findFirst({
      where: { 
        email: req.body.email,
        leases: {
          some: {
            property: {
              organizationId: organization.id,
            },
          },
        },
      },
    });

    if (existingTenant) {
      return res.status(400).json({
        error: 'A tenant with this email already exists in your organization',
      });
    }

    const tenant = await prisma.tenant.create({
      data: req.body,
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'TENANT_CREATED', `Created tenant: ${tenant.firstName} ${tenant.lastName}`, {
      tenantId: tenant.id,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      email: tenant.email,
    });

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant,
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      error: 'Internal server error creating tenant',
    });
  }
});

// Update tenant
router.put('/:id', [
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
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Valid phone number is required'),
  body('emergencyContact')
    .optional()
    .trim(),
  body('emergencyPhone')
    .optional()
    .trim(),
], requirePermission('UPDATE_TENANTS'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { organization, assignedPropertyIds } = req.user;

    // Check if tenant exists and belongs to organization
    const existingTenant = await prisma.tenant.findFirst({
      where: { 
        id,
        leases: {
          some: {
            property: {
              organizationId: organization.id,
              ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                id: { in: assignedPropertyIds }
              } : {}),
            },
          },
        },
      },
    });

    if (!existingTenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    // Check if email is being changed and if it already exists within organization
    if (req.body.email && req.body.email !== existingTenant.email) {
      const emailExists = await prisma.tenant.findFirst({
        where: { 
          email: req.body.email,
          id: { not: id },
          leases: {
            some: {
              property: {
                organizationId: organization.id,
              },
            },
          },
        },
      });

      if (emailExists) {
        return res.status(400).json({
          error: 'A tenant with this email already exists in your organization',
        });
      }
    }    const tenant = await prisma.tenant.update({
      where: { id },
      data: req.body,
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'TENANT_UPDATED', `Updated tenant: ${tenant.firstName} ${tenant.lastName}`, {
      tenantId: tenant.id,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      changes: req.body,
    });

    res.json({
      message: 'Tenant updated successfully',
      tenant,
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      error: 'Internal server error updating tenant',
    });
  }
});

// Delete tenant
router.delete('/:id', requirePermission('DELETE_TENANTS'), async (req, res) => {
  try {
    const { id } = req.params;
    const { organization, assignedPropertyIds } = req.user;

    // Check if tenant exists and belongs to organization
    const tenant = await prisma.tenant.findFirst({
      where: { 
        id,
        leases: {
          some: {
            property: {
              organizationId: organization.id,
              ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                id: { in: assignedPropertyIds }
              } : {}),
            },
          },
        },
      },
      include: {
        leases: {
          where: {
            property: {
              organizationId: organization.id,
              ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                id: { in: assignedPropertyIds }
              } : {}),
            },
          },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    // Check if there are active leases
    const activeLeases = tenant.leases.filter(lease => lease.status === 'ACTIVE');

    if (activeLeases.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete tenant with active leases',
        activeLeases: activeLeases.length,
      });
    }    await prisma.tenant.delete({
      where: { id },
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'TENANT_DELETED', `Deleted tenant: ${tenant.firstName} ${tenant.lastName}`, {
      tenantId: tenant.id,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
    });

    res.json({
      message: 'Tenant deleted successfully',
    });
  } catch (error) {    console.error('Delete tenant error:', error);
    res.status(500).json({
      error: 'Internal server error deleting tenant',
    });
  }
});

export default router;
