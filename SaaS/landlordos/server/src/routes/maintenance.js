import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, requirePermission, logActivity } from '../middleware/enterprise-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateUser);

// Get all maintenance tasks for organization properties
router.get('/', requirePermission('READ_MAINTENANCE'), async (req, res) => {
  try {
    const { organization, assignedPropertyIds } = req.user;
    const { status, priority } = req.query;
    
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
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    const tasks = await prisma.maintenanceTask.findMany({
      where,
      include: {
        property: {
          select: { id: true, address: true, city: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get maintenance tasks error:', error);
    res.status(500).json({
      error: 'Internal server error fetching maintenance tasks',
    });
  }
});

// Create new maintenance task
router.post('/', requirePermission('CREATE_MAINTENANCE'), async (req, res) => {
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
        error: 'You do not have permission to create maintenance tasks for this property',
      });
    }

    const task = await prisma.maintenanceTask.create({
      data: req.body,
      include: {
        property: {
          select: { id: true, address: true, city: true },
        },
      },    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'MAINTENANCE_CREATED', `Created maintenance task: ${task.title}`, {
      taskId: task.id,
      propertyId: task.propertyId,
      title: task.title,
      priority: task.priority,
    });

    res.status(201).json({
      message: 'Maintenance task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create maintenance task error:', error);
    res.status(500).json({
      error: 'Internal server error creating maintenance task',
    });
  }
});

export default router;
