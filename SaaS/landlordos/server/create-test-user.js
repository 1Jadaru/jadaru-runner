// Create a second test user and test data segregation
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('Creating test user...');
  
  // Create a second test user
  const hashedPassword = await bcrypt.hash('test123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test1@landlordos.co' },
    update: {},
    create: {
      email: 'test1@landlordos.co',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '555-0999',
      tier: 'FREE',
    },
  });

  console.log('✅ Created test user:', testUser.email, 'ID:', testUser.id);

  // Create a property for this test user
  const testProperty = await prisma.property.create({
    data: {
      address: '999 Test Street',
      city: 'Test City',
      state: 'TX',
      zipCode: '12345',
      type: 'APARTMENT',
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 800,
      purchasePrice: 150000,
      currentValue: 180000,
      mortgage: 1000,
      ownerId: testUser.id,
    },
  });

  console.log('✅ Created test property:', testProperty.id);
  // Create a tenant for this property
  const testTenant = await prisma.tenant.create({
    data: {
      firstName: 'Test',
      lastName: 'Tenant',
      email: 'tenant@test.com',
      phone: '555-1234',
    },
  });

  console.log('✅ Created test tenant:', testTenant.id);

  // Create a lease for this test user's property
  const testLease = await prisma.lease.create({
    data: {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-05-31'),
      monthlyRent: 900,
      securityDeposit: 900,
      status: 'ACTIVE',
      propertyId: testProperty.id,
      tenantId: testTenant.id,
    },
  });

  console.log('✅ Created test lease:', testLease.id);

  await prisma.$disconnect();
}

createTestUser().catch(console.error);
