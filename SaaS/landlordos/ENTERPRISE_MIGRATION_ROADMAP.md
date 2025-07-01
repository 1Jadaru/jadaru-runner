# Enterprise Migration Roadmap for LandlordOS

## Executive Summary

The current LandlordOS database schema is **not enterprise-ready**. This document provides a practical migration roadmap to transform the system from individual landlord support to full enterprise-grade multi-user organizations.

## Current State Assessment

### ✅ What Works Well
- Individual property management
- Basic lease tracking
- Payment management
- Clean data relationships

### ❌ Critical Gaps for Enterprise
- **No organizational structure**
- **No role-based permissions**
- **No team collaboration**
- **No user hierarchy**
- **No property assignments**
- **No audit trails**

## Migration Strategy

### 🎯 **Phase 1: Foundation (Weeks 1-2)**
**Goal**: Add organizational structure without breaking existing functionality

#### Database Changes
```sql
-- Add organization table
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'INDIVIDUAL_LANDLORD',
  subscription TEXT DEFAULT 'BASIC',
  max_users INTEGER DEFAULT 5,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add organization_id to users table
ALTER TABLE users ADD COLUMN organization_id TEXT;
ALTER TABLE users ADD CONSTRAINT fk_user_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- Add organization_id to properties table  
ALTER TABLE properties ADD COLUMN organization_id TEXT;
ALTER TABLE properties ADD CONSTRAINT fk_property_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id);
```

#### Migration Script
```javascript
// migrate-phase1.js
async function migrateToOrganizations() {
  const users = await prisma.user.findMany({
    include: { properties: true }
  });
  
  for (const user of users) {
    // Create individual organization for each existing user
    const org = await prisma.organization.create({
      data: {
        name: `${user.firstName} ${user.lastName}`,
        slug: `user-${user.id}`,
        type: 'INDIVIDUAL_LANDLORD',
        ownerId: user.id,
      }
    });
    
    // Update user to belong to their organization
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: org.id }
    });
    
    // Update all their properties
    await prisma.property.updateMany({
      where: { ownerId: user.id },
      data: { organizationId: org.id }
    });
  }
}
```

### 🎯 **Phase 2: Role System (Weeks 3-4)**
**Goal**: Implement role-based access control

#### Database Changes
```sql
-- Create roles table
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  level INTEGER NOT NULL,
  organization_id TEXT,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Create user_roles junction table
CREATE TABLE user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by TEXT NOT NULL,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  UNIQUE(user_id, role_id, organization_id)
);
```

#### Built-in Roles Setup
```javascript
// setup-roles.js
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
      reports: ['read']
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
      tenants: ['create', 'read', 'update']
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
      maintenance: ['create', 'read', 'update']
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
```

### 🎯 **Phase 3: Property Assignments (Weeks 5-6)**
**Goal**: Enable users to be assigned to specific properties

#### Database Changes
```sql
-- Create assignments table
CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  role_type TEXT NOT NULL,
  permissions JSONB,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  organization_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  UNIQUE(user_id, property_id)
);
```

#### Enhanced API Middleware
```javascript
// Enhanced permission checking
export const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    const userId = req.user.userId;
    const organizationId = req.headers['x-organization-id'];
    const propertyId = req.params.propertyId;
    
    const hasPermission = await checkUserPermission({
      userId,
      organizationId,
      resource,
      action,
      propertyId
    });
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: `${resource}.${action}`
      });
    }
    
    req.userPermissions = await getUserPermissions(userId, organizationId);
    next();
  };
};

// Usage in routes
router.get('/leases', 
  requirePermission('leases', 'read'),
  async (req, res) => {
    // Enhanced filtering based on user assignments
    const accessibleProperties = await getAccessibleProperties(
      req.user.userId, 
      req.organizationId
    );
    
    const leases = await prisma.lease.findMany({
      where: {
        propertyId: { in: accessibleProperties.map(p => p.id) }
      }
    });
    
    res.json({ leases });
  }
);
```

### 🎯 **Phase 4: Audit Trail (Weeks 7-8)**
**Goal**: Add comprehensive audit logging for compliance

#### Database Changes
```sql
-- Create audit_logs table
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Add indexes for performance
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

#### Audit Middleware
```javascript
// audit-middleware.js
export const auditTrail = (entityType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAuditEvent({
          entityType,
          entityId: req.params.id,
          action: getActionFromMethod(req.method),
          userId: req.user.userId,
          organizationId: req.organizationId,
          oldValues: req.originalData,
          newValues: req.body,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};
```

## Implementation Timeline

| Phase | Duration | Key Deliverables | Risk Level |
|-------|----------|------------------|------------|
| Phase 1 | 2 weeks | Organization structure | Low |
| Phase 2 | 2 weeks | Role-based access | Medium |
| Phase 3 | 2 weeks | Property assignments | Medium |
| Phase 4 | 2 weeks | Audit logging | Low |
| **Total** | **8 weeks** | Enterprise-ready system | **Medium** |

## Testing Strategy

### Phase 1 Testing
```javascript
// Test organization migration
describe('Organization Migration', () => {
  it('should create organizations for existing users', async () => {
    // Test migration script
  });
  
  it('should maintain existing functionality', async () => {
    // Test backward compatibility
  });
});
```

### Phase 2 Testing
```javascript
// Test role-based access
describe('Role System', () => {
  it('should enforce role permissions', async () => {
    // Test permission checking
  });
  
  it('should handle role hierarchy', async () => {
    // Test role levels
  });
});
```

## Rollback Strategy

Each phase includes rollback scripts:

```javascript
// rollback-phase2.js
async function rollbackRoleSystem() {
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  // Drop tables if needed
}
```

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Enterprise Onboarding | 100% success | Companies with 10+ users |
| Permission Accuracy | 99.9% | Role-based access tests |
| Performance Impact | <10% degradation | Query execution time |
| Audit Coverage | 100% | All data modifications logged |

## Post-Migration Benefits

### For Individual Users
- ✅ No functionality loss
- ✅ Future upgrade path
- ✅ Better organization

### For Enterprises
- ✅ Multi-user support
- ✅ Role-based security
- ✅ Team collaboration
- ✅ Compliance audit trails
- ✅ Scalable architecture

## Risk Mitigation

1. **Data Loss Prevention**
   - Comprehensive backups before each phase
   - Rollback scripts tested in staging

2. **Performance Monitoring**
   - Query performance benchmarks
   - Database index optimization

3. **User Training**
   - Documentation updates
   - Admin interface enhancements

## Conclusion

This 8-week migration will transform LandlordOS from an individual-focused application to an enterprise-ready multi-user platform. The phased approach minimizes risk while ensuring existing functionality remains intact.

**Recommendation**: Proceed with Phase 1 immediately to begin supporting organizational structures.
