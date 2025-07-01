import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all properties for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      ownerId: userId,
      ...(search && {
        OR: [
          { address: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

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

    // Format the response with additional computed fields
    const formattedProperties = properties.map(property => {
      const activeLease = property.leases[0]; // Assuming one active lease per property
      return {
        ...property,
        currentTenant: activeLease 
          ? `${activeLease.tenant.firstName} ${activeLease.tenant.lastName}`
          : null,
        currentRent: activeLease?.monthlyRent || null,
        isOccupied: !!activeLease,
      };
    });

    res.json({
      properties: formattedProperties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Properties fetch error:', error);
    res.status(500).json({
      error: 'Internal server error fetching properties',
    });
  }
});

// Get a single property by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const property = await prisma.property.findFirst({
      where: {
        id,
        ownerId: userId,
      },
      include: {
        leases: {
          include: {
            tenant: true,
          },
          orderBy: { createdAt: 'desc' },
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
        insurance: true,
      },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Property not found',
      });
    }

    res.json({ property });
  } catch (error) {
    console.error('Property fetch error:', error);
    res.status(500).json({
      error: 'Internal server error fetching property',
    });
  }
});

// Create a new property
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
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const userId = req.user.id;
    const propertyData = {
      ...req.body,
      ownerId: userId,
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

    res.status(201).json({
      message: 'Property created successfully',
      property,
    });
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({
      error: 'Internal server error creating property',
    });
  }
});

// Update a property
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
    const userId = req.user.id;

    // Check if property exists and belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!existingProperty) {
      return res.status(404).json({
        error: 'Property not found',
      });
    }

    // Update property
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

    res.json({
      message: 'Property updated successfully',
      property,
    });
  } catch (error) {
    console.error('Property update error:', error);
    res.status(500).json({
      error: 'Internal server error updating property',
    });
  }
});

// Delete a property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if property exists and belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        ownerId: userId,
      },
      include: {
        leases: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!existingProperty) {
      return res.status(404).json({
        error: 'Property not found',
      });
    }

    // Check if property has active leases
    if (existingProperty.leases.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete property with active leases',
        details: 'Please terminate all active leases before deleting the property',
      });
    }

    // Delete property (this will cascade delete related records)
    await prisma.property.delete({
      where: { id },
    });

    res.json({
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Property deletion error:', error);
    res.status(500).json({
      error: 'Internal server error deleting property',
    });
  }
});

// Add property insurance
router.post('/:id/insurance', [
  body('provider')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Insurance provider is required'),
  body('policyNumber')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Policy number is required'),
  body('premium')
    .isFloat({ min: 0 })
    .withMessage('Premium must be a positive number'),
  body('deductible')
    .isFloat({ min: 0 })
    .withMessage('Deductible must be a positive number'),
  body('coverage')
    .isFloat({ min: 0 })
    .withMessage('Coverage amount must be a positive number'),
  body('expiresAt')
    .isISO8601()
    .withMessage('Valid expiration date is required'),
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
    const userId = req.user.id;

    // Check if property exists and belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Property not found',
      });
    }

    // Create or update insurance
    const insurance = await prisma.propertyInsurance.upsert({
      where: { propertyId: id },
      update: req.body,
      create: {
        ...req.body,
        propertyId: id,
      },
    });

    res.status(201).json({
      message: 'Property insurance updated successfully',
      insurance,
    });
  } catch (error) {
    console.error('Property insurance error:', error);
    res.status(500).json({
      error: 'Internal server error managing property insurance',
    });
  }
});

export default router;
