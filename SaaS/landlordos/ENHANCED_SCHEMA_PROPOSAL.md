# Enhanced Database Schema for Multi-User Organizations

## Current Schema Limitations

The existing LandlordOS database schema has several critical limitations for enterprise growth:

### 🚨 **Major Issues**

1. **Single-User Model**: Each user is treated as an individual owner
2. **No Organizational Structure**: No concept of companies/organizations
3. **No Role-Based Access Control**: All users have the same permissions
4. **No Team Collaboration**: Multiple employees can't work on the same portfolio
5. **No User Hierarchy**: No managers, admins, or different permission levels
6. **No Delegation**: Property managers can't be assigned to specific properties
7. **No Audit Trail**: No tracking of who made what changes

## Proposed Enhanced Schema

### New Entity Relationships

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  ORGANIZATION   │       │      USER       │       │      ROLE       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────▶│ id (PK)         │◀─────▶│ id (PK)         │
│ name            │   1:N │ email           │  N:M  │ name            │
│ slug            │       │ password        │       │ description     │
│ type            │       │ firstName       │       │ permissions     │
│ settings        │       │ lastName        │       │ level           │
│ subscription    │       │ phone           │       │ createdAt       │
│ ownerId (FK)    │       │ organizationId  │       │ updatedAt       │
│ createdAt       │       │ isActive        │       └─────────────────┘
│ updatedAt       │       │ lastLogin       │               │
└─────────────────┘       │ createdAt       │               │
        │                 │ updatedAt       │               │
        │                 └─────────────────┘               │
        │                         │                         │
        │                         │                         │
        │ 1:N                     │ N:M                     │
        ▼                         ▼                         │
┌─────────────────┐       ┌─────────────────┐               │
│    PROPERTY     │       │   USER_ROLE     │               │
├─────────────────┤       ├─────────────────┤               │
│ id (PK)         │       │ userId (FK)     │──────────────┘
│ address         │       │ roleId (FK)     │
│ city            │       │ organizationId  │
│ state           │       │ assignedAt      │
│ organizationId  │       │ assignedBy      │
│ managerId (FK)  │       │ expiresAt       │
│ createdAt       │       │ isActive        │
│ updatedAt       │       └─────────────────┘
└─────────────────┘               │
        │                         │
        │ 1:N                     │
        ▼                         │
┌─────────────────┐               │
│   ASSIGNMENT    │               │
├─────────────────┤               │
│ id (PK)         │               │
│ userId (FK)     │──────────────┘
│ propertyId (FK) │
│ roleType        │
│ permissions     │
│ assignedAt      │
│ assignedBy      │
└─────────────────┘
```

### Enhanced Schema Models

#### 1. Organization Model
```prisma
model Organization {
  id           String            @id @default(cuid())
  name         String
  slug         String            @unique
  type         OrganizationType  @default(PROPERTY_MANAGEMENT)
  logo         String?
  address      String?
  phone        String?
  email        String?
  website      String?
  settings     Json?             // Organization preferences
  subscription SubscriptionTier @default(BASIC)
  maxUsers     Int               @default(5)
  maxProperties Int              @default(50)
  ownerId      String            // Primary owner/admin
  isActive     Boolean           @default(true)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  // Relations
  users        User[]
  properties   Property[]
  roles        Role[]
  userRoles    UserRole[]
  assignments  Assignment[]
  auditLogs    AuditLog[]

  @@map("organizations")
}

enum OrganizationType {
  INDIVIDUAL_LANDLORD
  PROPERTY_MANAGEMENT
  REAL_ESTATE_COMPANY
  INVESTMENT_FIRM
  OTHER
}

enum SubscriptionTier {
  BASIC
  PROFESSIONAL
  ENTERPRISE
  CUSTOM
}
```

#### 2. Enhanced User Model
```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  password       String
  firstName      String
  lastName       String
  phone          String?
  avatar         String?
  organizationId String?   // Nullable for individual users
  isActive       Boolean   @default(true)
  lastLogin      DateTime?
  preferences    Json?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  organization   Organization? @relation(fields: [organizationId], references: [id])
  userRoles      UserRole[]
  assignments    Assignment[]
  properties     Property[]    // For individual ownership
  createdAuditLogs AuditLog[] @relation("CreatedBy")
  
  @@map("users")
}
```

#### 3. Role-Based Access Control
```prisma
model Role {
  id           String   @id @default(cuid())
  name         String
  description  String?
  permissions  Json     // Detailed permissions object
  level        Int      // Hierarchy level (1=lowest, 10=highest)
  organizationId String?
  isSystemRole Boolean  @default(false) // Built-in vs custom roles
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  organization Organization? @relation(fields: [organizationId], references: [id])
  userRoles    UserRole[]

  @@unique([name, organizationId])
  @@map("roles")
}

model UserRole {
  id             String    @id @default(cuid())
  userId         String
  roleId         String
  organizationId String
  assignedAt     DateTime  @default(now())
  assignedBy     String    // User who assigned this role
  expiresAt      DateTime? // Optional expiration
  isActive       Boolean   @default(true)

  // Relations
  user         User         @relation(fields: [userId], references: [id])
  role         Role         @relation(fields: [roleId], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])

  @@unique([userId, roleId, organizationId])
  @@map("user_roles")
}
```

#### 4. Property Assignment System
```prisma
model Assignment {
  id          String         @id @default(cuid())
  userId      String
  propertyId  String
  roleType    AssignmentRole @default(MANAGER)
  permissions Json?          // Specific permissions for this assignment
  assignedAt  DateTime       @default(now())
  assignedBy  String         // User who made the assignment
  isActive    Boolean        @default(true)
  
  // Relations
  user         User         @relation(fields: [userId], references: [id])
  property     Property     @relation(fields: [propertyId], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])
  organizationId String

  @@unique([userId, propertyId])
  @@map("assignments")
}

enum AssignmentRole {
  VIEWER
  MANAGER
  COORDINATOR
  OWNER
}
```

#### 5. Enhanced Property Model
```prisma
model Property {
  id             String      @id @default(cuid())
  address        String
  city           String
  state          String
  organizationId String?     // For organization-owned properties
  ownerId        String?     // For individual-owned properties
  managerId      String?     // Assigned property manager
  status         PropertyStatus @default(ACTIVE)
  // ... other property fields
  
  // Relations
  organization   Organization? @relation(fields: [organizationId], references: [id])
  owner          User?         @relation(fields: [ownerId], references: [id])
  assignments    Assignment[]
  // ... other relations
  
  @@map("properties")
}

enum PropertyStatus {
  ACTIVE
  INACTIVE
  UNDER_MANAGEMENT
  FOR_SALE
  MAINTENANCE
}
```

#### 6. Audit Trail System
```prisma
model AuditLog {
  id             String    @id @default(cuid())
  entityType     String    // Property, Lease, Payment, etc.
  entityId       String    // ID of the affected entity
  action         String    // CREATE, UPDATE, DELETE, etc.
  oldValues      Json?     // Previous state
  newValues      Json?     // New state
  userId         String    // Who made the change
  organizationId String
  ipAddress      String?
  userAgent      String?
  timestamp      DateTime  @default(now())

  // Relations
  user         User         @relation("CreatedBy", fields: [userId], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])

  @@map("audit_logs")
}
```

## Permission System Design

### Built-in Roles
```json
{
  "OWNER": {
    "level": 10,
    "permissions": ["*"] // All permissions
  },
  "ADMIN": {
    "level": 9,
    "permissions": [
      "user.create", "user.update", "user.delete",
      "property.*", "lease.*", "payment.*",
      "report.view", "settings.update"
    ]
  },
  "MANAGER": {
    "level": 7,
    "permissions": [
      "property.view", "property.update",
      "lease.create", "lease.update", "lease.view",
      "payment.create", "payment.update", "payment.view",
      "tenant.create", "tenant.update", "tenant.view"
    ]
  },
  "COORDINATOR": {
    "level": 5,
    "permissions": [
      "property.view", "lease.view", "payment.view",
      "maintenance.create", "maintenance.update",
      "reminder.create", "reminder.update"
    ]
  },
  "VIEWER": {
    "level": 1,
    "permissions": [
      "property.view", "lease.view", "payment.view"
    ]
  }
}
```

## Migration Strategy

### Phase 1: Add Organization Support
1. Add Organization, Role, UserRole tables
2. Migrate existing users to individual organizations
3. Implement basic role assignment

### Phase 2: Property Assignment System
1. Add Assignment table
2. Migrate property ownership to assignment model
3. Implement property-level permissions

### Phase 3: Audit Trail
1. Add AuditLog table
2. Implement change tracking middleware
3. Add audit trail UI

### Phase 4: Advanced Features
1. Custom role creation
2. Advanced permission management
3. Team collaboration features

## API Changes Required

### Authentication Middleware Enhancement
```javascript
// Enhanced auth middleware
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;
    const organizationId = req.headers['x-organization-id'];
    
    const hasPermission = await checkUserPermission(
      user.id, 
      organizationId, 
      permission,
      req.params.propertyId // For property-specific permissions
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

### Enhanced Data Filtering
```javascript
// Enhanced lease filtering with organization context
const getAccessibleLeases = async (userId, organizationId) => {
  const userAssignments = await prisma.assignment.findMany({
    where: { userId, organizationId, isActive: true },
    include: { property: true }
  });
  
  const accessiblePropertyIds = userAssignments.map(a => a.propertyId);
  
  return prisma.lease.findMany({
    where: {
      propertyId: { in: accessiblePropertyIds }
    },
    // ... rest of query
  });
};
```

This enhanced schema would support:
- ✅ Multi-user organizations
- ✅ Role-based access control
- ✅ Property-specific assignments
- ✅ Team collaboration
- ✅ Audit trails
- ✅ Scalable permission management
- ✅ Enterprise-grade security
