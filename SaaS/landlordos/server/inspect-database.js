// Inspect database to understand the data segregation issue
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectDatabase() {
  console.log('🔍 Inspecting database for data segregation issue...\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true }
  });
  
  console.log('📋 Users in database:');
  users.forEach(user => {
    console.log(`  - ${user.email} (ID: ${user.id})`);
  });
  console.log('');

  // Get all properties with their owners
  const properties = await prisma.property.findMany({
    select: { 
      id: true, 
      address: true, 
      city: true, 
      state: true, 
      ownerId: true,
      owner: { select: { email: true } }
    }
  });
  
  console.log('🏠 Properties in database:');
  properties.forEach(property => {
    console.log(`  - ${property.address}, ${property.city} (ID: ${property.id})`);
    console.log(`    Owner: ${property.owner.email} (ID: ${property.ownerId})`);
  });
  console.log('');

  // Get all leases with property and owner details
  const leases = await prisma.lease.findMany({
    include: {
      property: {
        select: { 
          id: true,
          address: true, 
          city: true, 
          state: true, 
          ownerId: true,
          owner: { select: { email: true } }
        }
      },
      tenant: { select: { firstName: true, lastName: true } }
    }
  });
  
  console.log('📝 Leases in database:');
  leases.forEach((lease, index) => {
    console.log(`  Lease ${index + 1}:`);
    console.log(`    ID: ${lease.id}`);
    console.log(`    Property: ${lease.property.address}, ${lease.property.city}`);
    console.log(`    Property Owner: ${lease.property.owner.email} (ID: ${lease.property.ownerId})`);
    console.log(`    Tenant: ${lease.tenant.firstName} ${lease.tenant.lastName}`);
    console.log(`    Monthly Rent: $${lease.monthlyRent}`);
    console.log('');
  });

  // Test the actual query used in the leases route for each user
  console.log('🧪 Testing lease queries for each user:');
  for (const user of users) {
    console.log(`\n--- Testing query for ${user.email} (ID: ${user.id}) ---`);
    
    const userLeases = await prisma.lease.findMany({
      where: {
        property: { ownerId: user.id }
      },
      include: {
        property: {
          select: { 
            address: true, 
            city: true, 
            state: true,
            ownerId: true
          }
        },
        tenant: { select: { firstName: true, lastName: true } }
      }
    });
    
    console.log(`  Found ${userLeases.length} leases:`);
    userLeases.forEach((lease, index) => {
      console.log(`    ${index + 1}. ${lease.property.address} - ${lease.tenant.firstName} ${lease.tenant.lastName} ($${lease.monthlyRent})`);
      console.log(`       Property Owner ID: ${lease.property.ownerId}`);
    });
  }

  await prisma.$disconnect();
}

inspectDatabase().catch(console.error);
