import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard overview data
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current date for calculations
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

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
        where: { ownerId: userId },
      }),

      // Active leases
      prisma.lease.findMany({
        where: {
          property: { ownerId: userId },
          status: 'ACTIVE',
        },
        include: {
          property: {
            select: { address: true, city: true },
          },
          tenant: {
            select: { firstName: true, lastName: true },
          },
        },
      }),

      // Monthly rent total (from active leases)
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

      // Yearly expenses
      prisma.expense.aggregate({
        where: {
          property: { ownerId: userId },
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
          userId,
          isCompleted: false,
          dueDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          property: {
            select: { address: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),

      // Pending maintenance tasks
      prisma.maintenanceTask.findMany({
        where: {
          property: { ownerId: userId },
          status: 'PENDING',
        },
        include: {
          property: {
            select: { address: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Recent expenses (last 30 days)
      prisma.expense.findMany({
        where: {
          property: { ownerId: userId },
          date: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          property: {
            select: { address: true },
          },
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),

      // Property performance data
      prisma.property.findMany({
        where: { ownerId: userId },
        include: {
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

    // Calculate derived metrics
    const occupancyRate = propertiesCount > 0 
      ? (activeLeases.length / propertiesCount) * 100 
      : 0;

    const monthlyRentIncome = monthlyRentTotal._sum.monthlyRent || 0;
    const monthlyExpenseAmount = monthlyExpenses._sum.amount || 0;
    const monthlyNetIncome = monthlyRentIncome - monthlyExpenseAmount;

    // Format property performance data
    const performanceData = propertyPerformance.map(property => ({
      id: property.id,
      address: property.address,
      monthlyRent: property.leases.reduce((sum, lease) => sum + lease.monthlyRent, 0),
      monthlyExpenses: property.expenses.reduce((sum, expense) => sum + expense.amount, 0),
      netIncome: property.leases.reduce((sum, lease) => sum + lease.monthlyRent, 0) - 
                 property.expenses.reduce((sum, expense) => sum + expense.amount, 0),
    }));

    const overview = {
      totalProperties: propertiesCount,
      activeLeases: activeLeases.length,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      monthlyRentIncome,
      monthlyExpenses: monthlyExpenseAmount,
      monthlyNetIncome,
      yearlyExpenses: yearlyExpenses._sum.amount || 0,
      pendingMaintenanceTasks: pendingMaintenanceTasks.length,
    };

    res.json({
      overview,
      upcomingReminders,
      recentExpenses,
      performanceData,
      activeLeases: activeLeases.map(lease => ({
        id: lease.id,
        tenant: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
        property: `${lease.property.address}, ${lease.property.city}`,
        monthlyRent: lease.monthlyRent,
        leaseEnd: lease.leaseEnd,
      })),
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      error: 'Internal server error fetching dashboard overview',
    });
  }
});

// Get financial summary
router.get('/financial-summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    // Build date range based on period
    let dateRanges = [];
    const currentYear = parseInt(year);
    
    if (period === 'monthly') {
      // Get data for each month of the year
      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);
        dateRanges.push({ startDate, endDate, label: startDate.toLocaleString('default', { month: 'short' }) });
      }
    } else if (period === 'quarterly') {
      // Get data for each quarter
      const quarters = [
        { start: 0, end: 2, label: 'Q1' },
        { start: 3, end: 5, label: 'Q2' },
        { start: 6, end: 8, label: 'Q3' },
        { start: 9, end: 11, label: 'Q4' },
      ];
      
      dateRanges = quarters.map(quarter => ({
        startDate: new Date(currentYear, quarter.start, 1),
        endDate: new Date(currentYear, quarter.end + 1, 0, 23, 59, 59),
        label: quarter.label,
      }));
    }

    // Fetch financial data for each period
    const financialData = await Promise.all(
      dateRanges.map(async ({ startDate, endDate, label }) => {
        const [income, expenses] = await Promise.all([
          // Income from active leases (simplified - assumes rent collected monthly)
          prisma.lease.aggregate({
            where: {
              property: { ownerId: userId },
              status: 'ACTIVE',
              leaseStart: { lte: endDate },
              leaseEnd: { gte: startDate },
            },
            _sum: { monthlyRent: true },
          }),
          
          // Expenses for the period
          prisma.expense.aggregate({
            where: {
              property: { ownerId: userId },
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          }),
        ]);

        return {
          period: label,
          income: income._sum.monthlyRent || 0,
          expenses: expenses._sum.amount || 0,
          netIncome: (income._sum.monthlyRent || 0) - (expenses._sum.amount || 0),
        };
      })
    );

    res.json({
      period,
      year: currentYear,
      data: financialData,
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({
      error: 'Internal server error fetching financial summary',
    });
  }
});

// Get dashboard stats (simplified version for frontend compatibility)
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
