import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, requirePermission, logActivity } from '../middleware/enterprise-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateUser);

// Get all expenses for organization
router.get('/', requirePermission('READ_EXPENSES'), async (req, res) => {
  try {
    const { organization, assignedPropertyIds } = req.user;
    const { page = 1, limit = 20, category, propertyId } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause for organization
    let where = {
      property: {
        organizationId: organization.id,
      },
    };

    // Add property assignment filter if user doesn't have access to all properties
    if (assignedPropertyIds && assignedPropertyIds.length > 0) {
      where.property.id = { in: assignedPropertyIds };
    }

    // Add optional filters
    if (category) {
      where.category = category;
    }
    if (propertyId) {
      where.propertyId = propertyId;
      // Ensure the property is accessible to the user
      if (assignedPropertyIds && assignedPropertyIds.length > 0 && !assignedPropertyIds.includes(propertyId)) {
        return res.status(403).json({
          error: 'You do not have permission to view expenses for this property',
        });
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          property: {
            select: { id: true, address: true, city: true },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      error: 'Internal server error fetching expenses',
    });
  }
});

// Create new expense
router.post('/', requirePermission('CREATE_EXPENSES'), async (req, res) => {
  try {
    const { organization, assignedPropertyIds } = req.user;
    const { propertyId } = req.body;
    
    // Verify the property belongs to the organization
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId: organization.id,
        ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
          id: { in: assignedPropertyIds }
        } : {}),
      },
    });

    if (!property) {
      return res.status(403).json({
        error: 'You do not have permission to create expenses for this property',
      });
    }
    
    const expense = await prisma.expense.create({
      data: req.body,
      include: {
        property: {
          select: { id: true, address: true, city: true },
        },
      },
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'EXPENSE_CREATED', `Created expense: ${expense.description} - $${expense.amount}`, {
      expenseId: expense.id,
      propertyId: expense.propertyId,
      amount: expense.amount,
      category: expense.category,
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      error: 'Internal server error creating expense',
    });
  }
});

export default router;
