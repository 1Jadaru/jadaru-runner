// Enterprise Migration Script - Phase 1
// This script migrates existing users to the organization model

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Built-in system roles
const SYSTEM_ROLES = [
  {
    name: 'OWNER',
    description: 'Organization owner with full access',
    permissions: { all: true },
    level: 10,
    isSystemRole: true
  },
  {
    name: 'ADMIN',
    description: 'Administrator with most permissions',
    permissions: {
      users: ['create', 'read', 'update', 'delete'],
      properties: ['create', 'read', 'update', 'delete'],
      leases: ['create', 'read', 'update', 'delete'],
      payments: ['create', 'read', 'update', 'delete'],
      reports: ['read'],
      settings: ['update']
    },
    level: 9,
    isSystemRole: true
  },
  {
    name: 'MANAGER',
    description: 'Property manager with operational access',
    permissions: {
      properties: ['read', 'update'],
      leases: ['create', 'read', 'update'],
      payments: ['create', 'read', 'update'],
      tenants: ['create', 'read', 'update'],
      maintenance: ['create', 'read', 'update'],
      reports: ['read']
    },
    level: 7,
    isSystemRole: true
  },
  {
    name: 'COORDINATOR',
    description: 'Operations coordinator with limited access',
    permissions: {
      properties: ['read'],
      leases: ['read'],
      payments: ['read'],
      maintenance: ['create', 'read', 'update'],
      reminders: ['create', 'read', 'update']
    },
    level: 5,
    isSystemRole: true
  },
  {
    name: 'VIEWER',
    description: 'Read-only access to assigned properties',
    permissions: {
      properties: ['read'],
      leases: ['read'],
      payments: ['read']
    },
    level: 1,
    isSystemRole: true
  }
];

async function createSystemRoles() {
  console.log('🔧 Creating system roles...');
  
  for (const roleData of SYSTEM_ROLES) {
    const role = await prisma.role.upsert({
      where: { 
        id: `system-${roleData.name.toLowerCase()}`
      },
      update: {},
      create: {
        id: `system-${roleData.name.toLowerCase()}`,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        level: roleData.level,
        isSystemRole: roleData.isSystemRole,
        organizationId: null // System roles have no organization
      }
    });
    
    console.log(`✅ Created system role: ${role.name}`);
  }
}

async function migrateUsersToOrganizations() {
  console.log('🏢 Starting enterprise migration...');
  
  // First create system roles
  await createSystemRoles();
  
  const users = await prisma.user.findMany({
    include: { 
      properties: true,
      _count: {
        select: {
          properties: true
        }
      }
    }
  });
  
  console.log(`📊 Found ${users.length} users to migrate`);
  
  for (const user of users) {
    console.log(`\\n👤 Processing user: ${user.email}`);
    
    // Create individual organization for each existing user
    const organization = await prisma.organization.create({
      data: {
        name: `${user.firstName} ${user.lastName} Properties`,
        slug: `user-${user.id}`,
        type: 'INDIVIDUAL_LANDLORD',
        subscription: user.tier === 'FREE' ? 'BASIC' : 
                     user.tier === 'BASIC' ? 'PROFESSIONAL' : 'ENTERPRISE',
        maxUsers: 1,
        maxProperties: 100,
        ownerId: user.id,
        email: user.email,
      }
    });
    
    console.log(`  ✅ Created organization: ${organization.name}`);
    
    // Update user to belong to their organization
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id }
    });
    
    console.log(`  ✅ Updated user organization membership`);
    
    // Update all their properties to belong to the organization
    if (user.properties.length > 0) {
      await prisma.property.updateMany({
        where: { ownerId: user.id },
        data: { 
          organizationId: organization.id,
          // Keep ownerId for backward compatibility
        }
      });
      
      console.log(`  ✅ Updated ${user.properties.length} properties`);
    }
      // Get the OWNER role
    const ownerRole = await prisma.role.findFirst({
      where: { 
        id: 'system-owner'
      }
    });
    
    if (ownerRole) {
      // Assign OWNER role to the user
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: ownerRole.id,
          organizationId: organization.id,
          assignedBy: user.id, // Self-assigned
          isActive: true
        }
      });
      
      console.log(`  ✅ Assigned OWNER role to user`);
    }
    
    // Create assignments for all their properties
    for (const property of user.properties) {
      await prisma.assignment.create({
        data: {
          userId: user.id,
          propertyId: property.id,
          roleType: 'OWNER',
          organizationId: organization.id,
          assignedBy: user.id,
          permissions: { all: true }
        }
      });
    }
    
    if (user.properties.length > 0) {
      console.log(`  ✅ Created ${user.properties.length} property assignments`);
    }
    
    // Log the migration in audit trail
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: user.id,
        action: 'MIGRATE_TO_ORGANIZATION',
        newValues: {
          organizationId: organization.id,
          organizationName: organization.name,
          propertiesCount: user.properties.length
        },
        userId: user.id,
        organizationId: organization.id,
        timestamp: new Date()
      }
    });
    
    console.log(`  ✅ Migration completed for ${user.email}`);
  }
  
  console.log(`\\n🎉 Migration completed successfully!`);
  console.log(`📊 Summary:`);
  console.log(`   - ${users.length} users migrated`);
  console.log(`   - ${users.length} organizations created`);
  console.log(`   - ${SYSTEM_ROLES.length} system roles created`);
  
  const totalProperties = users.reduce((sum, user) => sum + user._count.properties, 0);
  console.log(`   - ${totalProperties} properties updated`);
  console.log(`   - ${totalProperties} property assignments created`);
}

async function verifyMigration() {
  console.log('\\n🔍 Verifying migration...');
  
  const organizations = await prisma.organization.count();
  const userRoles = await prisma.userRole.count();
  const assignments = await prisma.assignment.count();
  const auditLogs = await prisma.auditLog.count();
  
  console.log(`✅ Organizations: ${organizations}`);
  console.log(`✅ User roles: ${userRoles}`);
  console.log(`✅ Property assignments: ${assignments}`);
  console.log(`✅ Audit logs: ${auditLogs}`);
  
  // Verify data integrity
  const usersWithoutOrg = await prisma.user.count({
    where: { organizationId: null }
  });
  
  const propertiesWithoutOrg = await prisma.property.count({
    where: { 
      AND: [
        { organizationId: null },
        { ownerId: { not: null } }
      ]
    }
  });
  
  if (usersWithoutOrg > 0) {
    console.log(`⚠️  Warning: ${usersWithoutOrg} users without organization`);
  }
  
  if (propertiesWithoutOrg > 0) {
    console.log(`⚠️  Warning: ${propertiesWithoutOrg} properties without organization`);
  }
  
  if (usersWithoutOrg === 0 && propertiesWithoutOrg === 0) {
    console.log('✅ Migration verification passed!');
  }
}

async function main() {
  try {
    await migrateUsersToOrganizations();
    await verifyMigration();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
