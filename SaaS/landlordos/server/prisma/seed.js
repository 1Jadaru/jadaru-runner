import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@landlordos.com' },
    update: {},
    create: {
      email: 'demo@landlordos.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Landlord',
      phone: '555-0123',
      tier: 'FREE',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create sample properties
  const property1 = await prisma.property.create({
    data: {
      address: '123 Maple Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      type: 'SINGLE_FAMILY',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1200,
      purchasePrice: 180000,
      currentValue: 220000,
      mortgage: 1200,
      ownerId: demoUser.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      address: '456 Oak Avenue',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      type: 'DUPLEX',
      bedrooms: 2,
      bathrooms: 1.5,
      squareFeet: 900,
      purchasePrice: 150000,
      currentValue: 180000,
      mortgage: 950,
      ownerId: demoUser.id,
    },
  });

  console.log('✅ Created sample properties');

  // Create sample tenants
  const tenant1 = await prisma.tenant.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '555-1234',
      emergencyContact: 'Jane Smith',
      emergencyPhone: '555-5678',
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '555-9876',
      emergencyContact: 'Mike Johnson',
      emergencyPhone: '555-4321',
    },
  });

  console.log('✅ Created sample tenants');

  // Create sample leases
  const lease1 = await prisma.lease.create({
    data: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyRent: 1500,
      securityDeposit: 1500,
      status: 'ACTIVE',
      propertyId: property1.id,
      tenantId: tenant1.id,
    },
  });

  const lease2 = await prisma.lease.create({
    data: {
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-02-28'),
      monthlyRent: 1200,
      securityDeposit: 1200,
      status: 'ACTIVE',
      propertyId: property2.id,
      tenantId: tenant2.id,
    },
  });

  console.log('✅ Created sample leases');

  // Create sample expenses
  await prisma.expense.create({
    data: {
      description: 'Plumbing repair - kitchen sink',
      amount: 250,
      category: 'REPAIRS',
      date: new Date('2024-11-15'),
      propertyId: property1.id,
      userId: demoUser.id,
    },
  });

  await prisma.expense.create({
    data: {
      description: 'Property insurance premium',
      amount: 1200,
      category: 'INSURANCE',
      date: new Date('2024-01-01'),
      propertyId: property1.id,
      userId: demoUser.id,
    },
  });

  console.log('✅ Created sample expenses');

  // Create sample maintenance tasks
  await prisma.maintenanceTask.create({
    data: {
      title: 'HVAC Inspection',
      description: 'Annual HVAC system inspection and filter replacement',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: new Date('2024-12-31'),
      estimatedCost: 150,
      propertyId: property1.id,
    },
  });

  await prisma.maintenanceTask.create({
    data: {
      title: 'Gutter Cleaning',
      description: 'Clean gutters and check for damage',
      priority: 'LOW',
      status: 'COMPLETED',
      dueDate: new Date('2024-11-01'),
      completedDate: new Date('2024-11-05'),
      estimatedCost: 100,
      actualCost: 85,
      vendorName: 'Springfield Gutter Services',
      propertyId: property2.id,
    },
  });

  console.log('✅ Created sample maintenance tasks');

  // Create sample reminders
  await prisma.reminder.create({
    data: {
      title: 'Lease Renewal Notice',
      description: 'Send lease renewal notice to tenant',
      type: 'LEASE_EXPIRING',
      dueDate: new Date('2024-10-01'),
      userId: demoUser.id,
      propertyId: property1.id,
      leaseId: lease1.id,
    },
  });

  await prisma.reminder.create({
    data: {
      title: 'Property Tax Due',
      description: 'Annual property tax payment due',
      type: 'PROPERTY_TAX',
      dueDate: new Date('2024-12-15'),
      userId: demoUser.id,
      propertyId: property2.id,
    },
  });

  console.log('✅ Created sample reminders');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
