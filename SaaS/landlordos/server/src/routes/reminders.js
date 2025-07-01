import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, requirePermission, logActivity } from '../middleware/enterprise-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateUser);

// Get all reminders for organization
router.get('/', requirePermission('READ_REMINDERS'), async (req, res) => {
  try {
    const { organization, assignedPropertyIds } = req.user;
    const { completed = false } = req.query;
    
    // Build where clause for organization
    let where = {
      isCompleted: completed === 'true',
      OR: [
        // Reminders associated with properties
        {
          property: {
            organizationId: organization.id,
            ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
              id: { in: assignedPropertyIds }
            } : {}),
          },
        },
        // Reminders associated with leases of organization properties
        {
          lease: {
            property: {
              organizationId: organization.id,
              ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                id: { in: assignedPropertyIds }
              } : {}),
            },
          },
        },
      ],
    };

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        property: {
          select: { id: true, address: true, city: true },
        },
        lease: {
          select: { 
            id: true,
            tenant: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      error: 'Internal server error fetching reminders',
    });
  }
});

// Create new reminder
router.post('/', requirePermission('CREATE_REMINDERS'), async (req, res) => {
  try {
    const { organization, assignedPropertyIds } = req.user;
    const { propertyId, leaseId } = req.body;
    
    // Verify property access if propertyId is provided
    if (propertyId) {
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
          error: 'You do not have permission to create reminders for this property',
        });
      }
    }

    // Verify lease access if leaseId is provided
    if (leaseId) {
      const lease = await prisma.lease.findFirst({
        where: {
          id: leaseId,
          property: {
            organizationId: organization.id,
            ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
              id: { in: assignedPropertyIds }
            } : {}),
          },
        },
      });

      if (!lease) {
        return res.status(403).json({
          error: 'You do not have permission to create reminders for this lease',
        });
      }
    }
      const reminder = await prisma.reminder.create({
      data: req.body,
      include: {
        property: {
          select: { id: true, address: true, city: true },
        },
        lease: {
          select: { 
            id: true,
            tenant: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'REMINDER_CREATED', `Created reminder: ${reminder.title}`, {
      reminderId: reminder.id,
      propertyId: reminder.propertyId,
      leaseId: reminder.leaseId,
      title: reminder.title,
    });

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder,
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      error: 'Internal server error creating reminder',
    });
  }
});

// Mark reminder as completed
router.patch('/:id/complete', requirePermission('UPDATE_REMINDERS'), async (req, res) => {
  try {
    const { id } = req.params;
    const { organization, assignedPropertyIds } = req.user;

    // First, find the reminder to ensure it belongs to the organization
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        OR: [
          // Reminders associated with properties
          {
            property: {
              organizationId: organization.id,
              ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                id: { in: assignedPropertyIds }
              } : {}),
            },
          },
          // Reminders associated with leases of organization properties
          {
            lease: {
              property: {
                organizationId: organization.id,
                ...(assignedPropertyIds && assignedPropertyIds.length > 0 ? {
                  id: { in: assignedPropertyIds }
                } : {}),
              },
            },
          },
        ],
      },
    });

    if (!existingReminder) {
      return res.status(404).json({
        error: 'Reminder not found',
      });
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        isCompleted: true,
      },
    });

    // Log the activity
    await logActivity(req.user.id, organization.id, 'REMINDER_COMPLETED', `Completed reminder: ${reminder.title}`, {
      reminderId: reminder.id,
      title: reminder.title,
    });

    res.json({
      message: 'Reminder marked as completed',
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({
      error: 'Internal server error completing reminder',
    });
  }
});

export default router;
