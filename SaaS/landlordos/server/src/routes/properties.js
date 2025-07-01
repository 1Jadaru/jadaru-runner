import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, requirePermission, logActivity } from '../middleware/enterprise-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateUser);

// Get all properties for the authenticated user's organization
router.get('/', requirePermission('READ_PROPERTIES'), async (req, res) => {
  try {
    const { organization, assignedPropertyIds } = req.user;
    const { page = 1, limit = 10, search } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Base where clause for organization
    let where = {
      organizationId: organization.id,
    };

    // Add property assignment filter if user doesn't have access to all properties
    if (assignedPropertyIds && assignedPropertyIds.length > 0) {
      where.id = { in: assignedPropertyIds };
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          leases: {
            where: { status: 'ACTIVE' },
            include: {
              tenant: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          _count: {
            select: {
              expenses: true,
              maintenanceTasks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties: properties.map(property => ({
        ...property,
        currentTenant: property.leases[0]?.tenant 
          ? `${property.leases[0].tenant.firstName} ${property.leases[0].tenant.lastName}`
          : null,
        currentRent: property.leases[0]?.monthlyRent || null,
        isOccupied: property.leases.length > 0,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      error: 'Internal server error fetching properties',
    });
  }
});

// Get single property with detailed information
router.get('/:id', requirePermission('READ_PROPERTIES'), async (req, res) => {
  try {
    const { id } = req.params;
    const { organization, assignedPropertyIds } = req.user;

    // Build where clause
    let where = {
      id,
      organizationId: organization.id,
    };

    // Add property assignment filter if user doesn't have access to all properties
    if (assignedPropertyIds && assignedPropertyIds.length > 0) {
      where.id = { in: assignedPropertyIds.filter(propId => propId === id) };
    }

    const property = await prisma.property.findFirst({
      where,
      include: {
        insurance: true,
        leases: {
          include: {
            tenant: true,
            payments: {
              orderBy: { dueDate: 'desc' },
              take: 5,
            },
          },
          orderBy: { startDate: 'desc' },
        },
        expenses: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        maintenanceTasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reminders: {
          where: { isCompleted: false },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Property not found',
      });
    }

    res.json({ property });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      error: 'Internal server error fetching property',
    });
  }
});

// Create new property
router.post('/', [
  body('address')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Address is required'),
  body('city')
    .trim()
    .isLength({ min: 1 })
    .withMessage('City is required'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be 2 characters'),
  body('zipCode')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Valid zip code is required'),
  body('type')
    .isIn(['SINGLE_FAMILY', 'DUPLEX', 'CONDO', 'TOWNHOUSE', 'APARTMENT', 'OTHER'])
    .withMessage('Valid property type is required'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bathrooms must be a non-negative number'),
  body('squareFeet')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Square feet must be a non-negative integer'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number'),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current value must be a non-negative number'),
  body('mortgage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Mortgage must be a non-negative number'),
], requirePermission('CREATE_PROPERTIES'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { organization } = req.user;
    const propertyData = {
      ...req.body,
      organizationId: organization.id,
    };

    const property = await prisma.property.create({
      data: propertyData,
      include: {
        _count: {
          select: {
            leases: true,
            expenses: true,
            maintenanceTasks: true,
          },
        },
      },
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'PROPERTY_CREATED', `Created property: ${property.address}`, {
      propertyId: property.id,
      address: property.address,
    });

    res.status(201).json({
      message: 'Property created successfully',
      property,
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      error: 'Internal server error creating property',
    });
  }
});

// Update property
router.put('/:id', [
  body('address')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Address cannot be empty'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('City cannot be empty'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be 2 characters'),
  body('zipCode')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Valid zip code is required'),
  body('type')
    .optional()
    .isIn(['SINGLE_FAMILY', 'DUPLEX', 'CONDO', 'TOWNHOUSE', 'APARTMENT', 'OTHER'])
    .withMessage('Valid property type is required'),
], requirePermission('UPDATE_PROPERTIES'), async (req, res) => {
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

    // Build where clause
    let where = {
      id,
      organizationId: organization.id,
    };

    // Add property assignment filter if user doesn't have access to all properties
    if (assignedPropertyIds && assignedPropertyIds.length > 0) {
      if (!assignedPropertyIds.includes(id)) {
        return res.status(403).json({
          error: 'You do not have permission to update this property',
        });
      }
    }

    // Check if property exists and belongs to organization
    const existingProperty = await prisma.property.findFirst({
      where,
    });

    if (!existingProperty) {
      return res.status(404).json({
        error: 'Property not found',
      });
    }

    const property = await prisma.property.update({
      where: { id },
      data: req.body,
      include: {
        _count: {
          select: {
            leases: true,
            expenses: true,
            maintenanceTasks: true,
          },
        },
      },
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'PROPERTY_UPDATED', `Updated property: ${property.address}`, {
      propertyId: property.id,
      address: property.address,
      changes: req.body,
    });

    res.json({
      message: 'Property updated successfully',
      property,
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      error: 'Internal server error updating property',
    });
  }
});

// Delete property
router.delete('/:id', requirePermission('DELETE_PROPERTIES'), async (req, res) => {
  try {
    const { id } = req.params;
    const { organization, assignedPropertyIds } = req.user;

    // Build where clause
    let where = {
      id,
      organizationId: organization.id,
    };

    // Add property assignment filter if user doesn't have access to all properties
    if (assignedPropertyIds && assignedPropertyIds.length > 0) {
      if (!assignedPropertyIds.includes(id)) {
        return res.status(403).json({
          error: 'You do not have permission to delete this property',
        });
      }
    }

    // Check if property exists and belongs to organization
    const property = await prisma.property.findFirst({
      where,
      include: {
        _count: {
          select: {
            leases: true,
            expenses: true,
            maintenanceTasks: true,
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Property not found',
      });
    }

    // Check if there are active leases
    const activeLeases = await prisma.lease.count({
      where: {
        propertyId: id,
        status: 'ACTIVE',
      },
    });

    if (activeLeases > 0) {
      return res.status(400).json({
        error: 'Cannot delete property with active leases',
        activeLeases,
      });
    }    await prisma.property.delete({
      where: { id },
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'PROPERTY_DELETED', `Deleted property: ${property.address}`, {
      propertyId: property.id,
      address: property.address,
    });

    res.json({
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      error: 'Internal server error deleting property',
    });
  }
});

export default router;
