# LandlordOS Database Entity Relationship Diagram (ERD)

## Database Schema Overview

This document provides a comprehensive Entity Relationship Diagram (ERD) for the LandlordOS database schema.

## ERD Diagram (Text Format)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      USER       │       │    PROPERTY     │       │     TENANT      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────▶│ id (PK)         │       │ id (PK)         │
│ email           │   1:N │ address         │       │ firstName       │
│ password        │       │ city            │       │ lastName        │
│ firstName       │       │ state           │       │ email           │
│ lastName        │       │ zipCode         │       │ phone           │
│ phone           │       │ type            │       │ emergencyContact│
│ avatar          │       │ bedrooms        │       │ emergencyPhone  │
│ tier            │       │ bathrooms       │       │ createdAt       │
│ isActive        │       │ squareFeet      │       │ updatedAt       │
│ lastLogin       │       │ purchasePrice   │       └─────────────────┘
│ preferences     │       │ currentValue    │               │
│ createdAt       │       │ mortgage        │               │
│ updatedAt       │       │ ownerId (FK)    │               │
└─────────────────┘       │ createdAt       │               │
        │                 │ updatedAt       │               │
        └─────────────────┘               │
                         │                         │
                         │ 1:N                     │
                         ▼                         │
                 ┌─────────────────┐               │
                 │      LEASE      │               │
                 ├─────────────────┤               │
                 │ id (PK)         │               │
                 │ startDate       │               │
                 │ endDate         │               │
                 │ monthlyRent     │               │
                 │ securityDeposit │               │
                 │ status          │               │
                 │ terms           │               │
                 │ propertyId (FK) │──────────────┘
                 │ tenantId (FK)   │──────────────┐
                 │ createdAt       │              │
                 │ updatedAt       │              │ N:1
                 └─────────────────┘              │
                         │                        │
                         │ 1:N                    │
                         ▼                        │
                 ┌─────────────────┐              │
                 │     PAYMENT     │              │
                 ├─────────────────┤              │
                 │ id (PK)         │              │
                 │ amount          │              │
                 │ dueDate         │              │
                 │ paidDate        │              │
                 │ status          │              │
                 │ method          │              │
                 │ reference       │              │
                 │ notes           │              │
                 │ leaseId (FK)    │              │
                 │ createdAt       │              │
                 │ updatedAt       │              │
                 └─────────────────┘              │
                                                  │
                                                  │
                         1:N                      │
                         ▼                        │
                 ┌─────────────────┐             │
                 │    REMINDER     │             │
                 ├─────────────────┤             │
                 │ id (PK)         │             │
                 │ title           │             │
                 │ description     │             │
                 │ dueDate         │             │
                 │ priority        │             │
                 │ isCompleted     │             │
                 │ completedAt     │             │
                 │ ownerId (FK)    │             │
                 │ leaseId (FK)    │─────────────┘
                 │ createdAt       │
                 │ updatedAt       │
                 └─────────────────┘
```

## Entity Descriptions

### 1. USER
- **Purpose**: Stores landlord/property manager account information
- **Key Relationships**: 
  - Owns multiple Properties (1:N)
  - Creates multiple Reminders (1:N)

### 2. PROPERTY
- **Purpose**: Stores property details and ownership information
- **Key Relationships**: 
  - Belongs to one User/Owner (N:1)
  - Has multiple Leases (1:N)

### 3. TENANT
- **Purpose**: Stores tenant contact and emergency information
- **Key Relationships**: 
  - Can have multiple Leases (1:N)
- **Note**: Tenants are not owned by users directly, only through lease relationships

### 4. LEASE
- **Purpose**: Core entity linking properties and tenants with rental terms
- **Key Relationships**: 
  - Belongs to one Property (N:1)
  - Belongs to one Tenant (N:1)
  - Has multiple Payments (1:N)
  - Can have multiple Reminders (1:N)

### 5. PAYMENT
- **Purpose**: Tracks rent payments and payment history
- **Key Relationships**: 
  - Belongs to one Lease (N:1)

### 6. REMINDER
- **Purpose**: Task and reminder management for landlords
- **Key Relationships**: 
  - Belongs to one User/Owner (N:1)
  - Optionally linked to one Lease (N:1)

## Data Segregation Security

### 🔒 Security Model
The application implements **user-based data segregation** through the following mechanisms:

1. **Property Ownership**: All properties have an `ownerId` that links to the authenticated user
2. **Lease Filtering**: Leases are filtered through property ownership: `property: { ownerId: userId }`
3. **Payment Access**: Payments are accessed through lease relationships, maintaining segregation
4. **Reminder Ownership**: Reminders are directly owned by users through `ownerId`

### ✅ Verified Security
- **Users can only see leases for properties they own**
- **No direct cross-user data access possible**
- **Proper foreign key relationships maintain data integrity**

## Database Constraints and Indexes

### Primary Keys
- All entities use `cuid()` as primary key format
- Format: Collision-resistant unique identifiers

### Foreign Key Relationships
- `property.ownerId` → `user.id`
- `lease.propertyId` → `property.id`
- `lease.tenantId` → `tenant.id`
- `payment.leaseId` → `lease.id`
- `reminder.ownerId` → `user.id`
- `reminder.leaseId` → `lease.id` (optional)

### Enums
- `property.type`: SINGLE_FAMILY, MULTI_FAMILY, APARTMENT, CONDO, TOWNHOUSE, OTHER
- `lease.status`: ACTIVE, EXPIRED, TERMINATED, PENDING
- `payment.status`: PENDING, PAID, LATE, FAILED
- `payment.method`: CASH, CHECK, BANK_TRANSFER, CREDIT_CARD, OTHER
- `reminder.priority`: LOW, MEDIUM, HIGH, URGENT
- `user.tier`: FREE, BASIC, PREMIUM, ENTERPRISE

## ⚠️ **SCALABILITY CONCERNS FOR ENTERPRISE GROWTH**

### Current Schema Limitations

The existing database schema has **significant limitations** for enterprise-level growth and multi-user organizations:

#### 🚨 **Critical Issues**

1. **Single-User Ownership Model**
   - Each property can only have one owner (`ownerId`)
   - No support for corporate/organizational ownership
   - No team-based property management

2. **No Role-Based Access Control (RBAC)**
   - All users have identical permissions
   - No concept of managers, coordinators, viewers
   - No hierarchical access levels

3. **No Multi-Tenant Organization Support**
   - Cannot onboard companies with multiple employees
   - No organizational boundaries or data isolation
   - No team collaboration features

4. **Missing Enterprise Features**
   - No user assignments to specific properties
   - No delegation of management responsibilities
   - No audit trails for compliance
   - No permission granularity

#### 📊 **Impact Analysis**

| Scenario | Current Support | Issues |
|----------|----------------|---------|
| Individual Landlord | ✅ Full | None |
| Small Property Management (2-5 users) | ❌ Limited | No role separation |
| Medium Company (10-50 users) | ❌ None | Cannot onboard |
| Enterprise (50+ users) | ❌ None | Completely inadequate |
| Multi-location Teams | ❌ None | No geographic assignment |

### Required Enhancements for Enterprise Readiness

#### 1. **Organization Layer**
```prisma
model Organization {
  id           String @id @default(cuid())
  name         String
  subscription String
  maxUsers     Int
  users        User[]
  properties   Property[]
}
```

#### 2. **Role-Based Access Control**
```prisma
model Role {
  id          String @id @default(cuid())
  name        String // OWNER, ADMIN, MANAGER, COORDINATOR, VIEWER
  permissions Json   // Granular permissions
  level       Int    // Hierarchy level
}

model UserRole {
  userId   String
  roleId   String
  orgId    String
  isActive Boolean
}
```

#### 3. **Property Assignment System**
```prisma
model Assignment {
  userId     String
  propertyId String
  roleType   String // MANAGER, COORDINATOR, VIEWER
  permissions Json?
}
```

#### 4. **Audit Trail**
```prisma
model AuditLog {
  entityType String  // Property, Lease, Payment
  action     String  // CREATE, UPDATE, DELETE
  userId     String
  timestamp  DateTime
  oldValues  Json?
  newValues  Json?
}
```

### Migration Path to Enterprise Schema

1. **Phase 1**: Add Organization and Role tables
2. **Phase 2**: Implement property assignments
3. **Phase 3**: Add audit logging
4. **Phase 4**: Enhance UI for team management

### Recommended Action

🎯 **For enterprise readiness, the schema requires significant enhancement.**

See `ENHANCED_SCHEMA_PROPOSAL.md` for detailed technical specifications.

---

## Generated: June 20, 2025
**Status**: Data segregation verified and working correctly
**Database Engine**: PostgreSQL with Prisma ORM
