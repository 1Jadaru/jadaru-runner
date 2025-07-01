import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, requirePermission } from '../middleware/enterprise-auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateUser);

// Get dashboard overview data
router.get('/overview', requirePermission('READ_DASHBOARD'), async (req, res) => {
  try {
    const { organization, assignedPropertyIds } = req.user;
    
    // Get current date for calculations
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    // Build base where clause for organization
    let propertyWhere = {
      organizationId: organization.id,
    };

    // Add property assignment filter if user doesn't have access to all properties
    if (assignedPropertyIds && assignedPropertyIds.length > 0) {
      propertyWhere.id = { in: assignedPropertyIds };
    }

    // Run all queries in parallel for better performance
    const [
      propertiesCount,
      activeLeases,
      monthlyRentTotal,
      monthlyExpenses,
      yearlyExpenses,
      upcomingReminders,
      pendingMaintenanceTasks,
      recentExpenses,
      propertyPerformance,
    ] = await Promise.all([
      // Properties count
      prisma.property.count({
        where: propertyWhere,
      }),

      // Active leases
      prisma.lease.findMany({
        where: {
          property: propertyWhere,
          status: 'ACTIVE',
        },
        include: {
          property: {
            select: { id: true, address: true, city: true },
          },
          tenant: {
            select: { firstName: true, lastName: true },
          },
        },
      }),      // Monthly rent total (from active leases)
      prisma.lease.aggregate({
        where: {
          property: propertyWhere,
          status: 'ACTIVE',
        },
        _sum: {
          monthlyRent: true,
        },
      }),

      // Monthly expenses
      prisma.expense.aggregate({
        where: {
          property: propertyWhere,
          date: {
            gte: firstDayOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Yearly expenses
      prisma.expense.aggregate({
        where: {
          property: propertyWhere,
          date: {
            gte: firstDayOfYear,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Upcoming reminders (next 30 days)
      prisma.reminder.findMany({
        where: {
          isCompleted: false,
          dueDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
          OR: [
            // Reminders associated with properties
            {
              property: propertyWhere,
            },
            // Reminders associated with leases of organization properties
            {
              lease: {
                property: propertyWhere,
              },
            },
          ],
        },
        orderBy: {
          dueDate: 'asc',
        },
        take: 5,
        include: {
          property: {
            select: { id: true, address: true },
          },
        },
      }),

      // Pending maintenance tasks
      prisma.maintenanceTask.count({
        where: {
          property: propertyWhere,
          status: {
            in: ['PENDING', 'IN_PROGRESS'],
          },
        },
      }),

      // Recent expenses (last 5)
      prisma.expense.findMany({
        where: { 
          property: propertyWhere,
        },
        orderBy: {
          date: 'desc',
        },
        take: 5,
        include: {
          property: {
            select: { id: true, address: true },
          },
        },
      }),

      // Property performance (rent vs expenses per property)
      prisma.property.findMany({
        where: propertyWhere,
        select: {
          id: true,
          address: true,
          city: true,
          leases: {
            where: { status: 'ACTIVE' },
            select: { monthlyRent: true },
          },
          expenses: {
            where: {
              date: {
                gte: firstDayOfMonth,
              },
            },
            select: { amount: true },
          },
        },
      }),
    ]);

    // Calculate metrics
    const monthlyRentIncome = monthlyRentTotal._sum.monthlyRent || 0;
    const monthlyExpenseAmount = monthlyExpenses._sum.amount || 0;
    const yearlyExpenseAmount = yearlyExpenses._sum.amount || 0;
    const monthlyNetIncome = monthlyRentIncome - monthlyExpenseAmount;

    // Calculate property performance
    const performanceData = propertyPerformance.map(property => {
      const monthlyRent = property.leases.reduce((sum, lease) => sum + lease.monthlyRent, 0);
      const monthlyExpenseTotal = property.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const netIncome = monthlyRent - monthlyExpenseTotal;
      
      return {
        id: property.id,
        address: property.address,
        city: property.city,
        monthlyRent,
        monthlyExpenses: monthlyExpenseTotal,
        netIncome,
        profitMargin: monthlyRent > 0 ? ((netIncome / monthlyRent) * 100).toFixed(1) : 0,
      };
    });

    // Calculate occupancy rate
    const totalProperties = propertiesCount;
    const occupiedProperties = activeLeases.length;
    const occupancyRate = totalProperties > 0 ? ((occupiedProperties / totalProperties) * 100).toFixed(1) : 0;

    res.json({
      overview: {
        totalProperties: propertiesCount,
        activeLeases: activeLeases.length,
        occupancyRate: parseFloat(occupancyRate),
        monthlyRentIncome,
        monthlyExpenses: monthlyExpenseAmount,
        monthlyNetIncome,
        yearlyExpenses: yearlyExpenseAmount,
        pendingMaintenanceTasks,
      },
      upcomingReminders,
      recentExpenses,
      performanceData,
      activeLeases: activeLeases.map(lease => ({
        id: lease.id,
        propertyAddress: `${lease.property.address}, ${lease.property.city}`,
        tenantName: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
        monthlyRent: lease.monthlyRent,
        endDate: lease.endDate,
      })),
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      error: 'Internal server error fetching dashboard data',
    });
  }
});

// Get financial summary by month
router.get('/financial-summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;

    // Get active leases for income estimation
    const activeLeases = await prisma.lease.findMany({
      where: {
        property: { ownerId: userId },
        status: 'ACTIVE',
      },
      select: {
        monthlyRent: true,
        startDate: true,
        endDate: true,
      },
    });

    // Calculate total monthly rent from active leases
    const totalMonthlyRent = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

    // Get monthly financial data for the year
    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const [payments, expenses] = await Promise.all([
        // Try to get actual payments, fallback to estimated rent
        prisma.payment.aggregate({
          where: {
            lease: {
              property: { ownerId: userId },
            },
            paymentType: 'RENT',
            status: 'PAID',
            paidDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        }).catch(() => ({ _sum: { amount: null } })),

        // Calculate expenses for the month
        prisma.expense.aggregate({
          where: {
            userId,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      // Use actual payments if available, otherwise estimate based on active leases
      let monthIncome = payments._sum.amount || 0;
      
      // If no payment data but we have active leases, estimate income
      if (monthIncome === 0 && totalMonthlyRent > 0) {
        // Check if this month is within the lease periods
        const activeLeasesForMonth = activeLeases.filter(lease => {
          const leaseStart = new Date(lease.startDate);
          const leaseEnd = new Date(lease.endDate);
          return startDate >= leaseStart && endDate <= leaseEnd;
        });
        
        monthIncome = activeLeasesForMonth.reduce((sum, lease) => sum + lease.monthlyRent, 0);
      }

      const monthExpenses = expenses._sum.amount || 0;

      monthlyData.push({
        month: month + 1,
        monthName: startDate.toLocaleString('default', { month: 'long' }),
        income: monthIncome,
        expenses: monthExpenses,
        netIncome: monthIncome - monthExpenses,
      });
    }

    res.json({
      year: parseInt(year),
      monthlyData,
      totals: {
        income: monthlyData.reduce((sum, month) => sum + month.income, 0),
        expenses: monthlyData.reduce((sum, month) => sum + month.expenses, 0),
        netIncome: monthlyData.reduce((sum, month) => sum + month.netIncome, 0),
      },
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({
      error: 'Internal server error fetching financial summary',
    });
  }
});

// Get dashboard stats (simplified)
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current date for calculations
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel for better performance
    const [
      totalProperties,
      activeLeases,
      monthlyIncome,
      monthlyExpenses,
      pendingMaintenance,
      upcomingRentDue,
    ] = await Promise.all([
      // Properties count
      prisma.property.count({
        where: { ownerId: userId },
      }),
      
      // Active leases count
      prisma.lease.count({
        where: {
          property: { ownerId: userId },
          status: 'ACTIVE',
        },
      }),
      
      // Monthly income (sum of active lease amounts)
      prisma.lease.aggregate({
        where: {
          property: { ownerId: userId },
          status: 'ACTIVE',
        },
        _sum: {
          monthlyRent: true,
        },
      }),
      
      // Monthly expenses (current month)
      prisma.expense.aggregate({
        where: {
          property: { ownerId: userId },
          date: {
            gte: firstDayOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      
      // Pending maintenance count  
      prisma.maintenanceTask.count({
        where: {
          property: { ownerId: userId },
          status: 'PENDING',
        },
      }),
      
      // Upcoming rent due (this week)
      prisma.lease.count({
        where: {
          property: { ownerId: userId },
          status: 'ACTIVE',
          // Add logic for rent due dates if you have that field
        },
      }),
    ]);

    const stats = {
      totalProperties: totalProperties || 0,
      activeLeases: activeLeases || 0,
      monthlyIncome: monthlyIncome._sum.monthlyRent || 0,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
      pendingMaintenance: pendingMaintenance || 0,
      upcomingRentDue: upcomingRentDue || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Internal server error fetching dashboard stats',
    });
  }
});

export default router;
