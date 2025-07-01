// Enhanced Enterprise Authentication & Authorization Middleware

import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Enhanced authentication middleware with organization context
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with organization and roles
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: true,
        userRoles: {
          where: { isActive: true },
          include: {
            role: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    // Attach user data to request
    req.user = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      organization: user.organization,
      roles: user.userRoles.map(ur => ur.role)
    };

    // Set organization context from header or user's organization
    const requestedOrgId = req.headers['x-organization-id'];
    if (requestedOrgId && requestedOrgId !== user.organizationId) {
      return res.status(403).json({ 
        error: 'Access denied to requested organization' 
      });
    }

    req.organizationId = user.organizationId;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Require specific permission middleware
 */
export const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const organizationId = req.organizationId;
      const propertyId = req.params.propertyId || req.body.propertyId;

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
          required: `${resource}.${action}`,
          context: propertyId ? `property:${propertyId}` : 'organization'
        });
      }

      // Attach user permissions to request for further use
      req.userPermissions = await getUserPermissions(userId, organizationId);
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

/**
 * Require specific role level middleware
 */
export const requireRoleLevel = (minLevel) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];
    const maxUserLevel = Math.max(...userRoles.map(role => role.level), 0);

    if (maxUserLevel < minLevel) {
      return res.status(403).json({
        error: 'Insufficient role level',
        required: `Level ${minLevel}+`,
        current: `Level ${maxUserLevel}`
      });
    }

    next();
  };
};

/**
 * Organization membership middleware
 */
export const requireOrganization = () => {
  return (req, res, next) => {
    if (!req.user.organizationId) {
      return res.status(403).json({
        error: 'Organization membership required',
        message: 'This endpoint requires organization membership'
      });
    }
    next();
  };
};

/**
 * Check if user has specific permission
 */
export async function checkUserPermission({
  userId,
  organizationId,
  resource,
  action,
  propertyId = null
}) {
  try {
    // Get user's roles in the organization
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        organizationId,
        isActive: true
      },
      include: {
        role: true
      }
    });

    // Check role-based permissions
    for (const userRole of userRoles) {
      const permissions = userRole.role.permissions;
      
      // Check for all permissions
      if (permissions.all === true) {
        return true;
      }

      // Check specific resource permissions
      if (permissions[resource]) {
        if (permissions[resource].includes(action) || 
            permissions[resource].includes('*')) {
          // If property-specific, check assignment
          if (propertyId) {
            return await checkPropertyAssignment(userId, propertyId, action);
          }
          return true;
        }
      }
    }

    // If property-specific, check direct assignment
    if (propertyId) {
      return await checkPropertyAssignment(userId, propertyId, action);
    }

    return false;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

/**
 * Check property-specific assignment
 */
async function checkPropertyAssignment(userId, propertyId, action) {
  const assignment = await prisma.assignment.findFirst({
    where: {
      userId,
      propertyId,
      isActive: true
    }
  });

  if (!assignment) {
    return false;
  }

  // Check assignment permissions
  const permissions = assignment.permissions;
  if (permissions?.all === true) {
    return true;
  }

  // Role-based assignment check
  const rolePermissions = {
    OWNER: ['*'],
    ADMIN: ['create', 'read', 'update', 'delete'],
    MANAGER: ['create', 'read', 'update'],
    COORDINATOR: ['read', 'update'],
    VIEWER: ['read']
  };

  return rolePermissions[assignment.roleType]?.includes(action) ||
         rolePermissions[assignment.roleType]?.includes('*');
}

/**
 * Get user's accessible properties
 */
export async function getAccessibleProperties(userId, organizationId, requiredPermission = 'read') {
  try {
    // Get properties through assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        userId,
        organizationId,
        isActive: true
      },
      include: {
        property: true
      }
    });

    // Filter based on required permission
    const accessibleProperties = [];
    for (const assignment of assignments) {
      const hasPermission = await checkPropertyAssignment(
        userId, 
        assignment.propertyId, 
        requiredPermission
      );
      
      if (hasPermission) {
        accessibleProperties.push(assignment.property);
      }
    }

    return accessibleProperties;
  } catch (error) {
    console.error('Error getting accessible properties:', error);
    return [];
  }
}

/**
 * Get user's permissions summary
 */
export async function getUserPermissions(userId, organizationId) {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      organizationId,
      isActive: true
    },
    include: {
      role: true
    }
  });

  const assignments = await prisma.assignment.findMany({
    where: {
      userId,
      organizationId,
      isActive: true
    },
    include: {
      property: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true
        }
      }
    }
  });

  return {
    roles: userRoles.map(ur => ({
      name: ur.role.name,
      level: ur.role.level,
      permissions: ur.role.permissions
    })),
    assignments: assignments.map(a => ({
      propertyId: a.propertyId,
      property: a.property,
      roleType: a.roleType,
      permissions: a.permissions
    })),
    maxLevel: Math.max(...userRoles.map(ur => ur.role.level), 0)
  };
}

/**
 * Audit logging middleware
 */
export const auditTrail = (entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Store original data for audit trail
    if (req.method !== 'GET' && req.params.id) {
      try {
        req.originalData = await getEntityData(entityType, req.params.id);
      } catch (error) {
        // Continue if original data fetch fails
      }
    }

    // Override response methods to capture successful operations
    const logAuditEvent = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          await prisma.auditLog.create({
            data: {
              entityType: entityType.toUpperCase(),
              entityId: req.params.id || 'new',
              action: getActionFromMethod(req.method),
              oldValues: req.originalData || null,
              newValues: req.method !== 'GET' ? req.body : null,
              userId: req.user.userId,
              organizationId: req.organizationId,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent'),
              timestamp: new Date()
            }
          });
        } catch (error) {
          console.error('Audit log failed:', error);
        }
      }
    };

    res.send = function(data) {
      logAuditEvent(data);
      originalSend.call(this, data);
    };

    res.json = function(data) {
      logAuditEvent(data);
      originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Helper functions
 */
function getActionFromMethod(method) {
  const actionMap = {
    'POST': 'CREATE',
    'GET': 'READ',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };
  return actionMap[method] || 'UNKNOWN';
}

async function getEntityData(entityType, entityId) {
  const entityMap = {
    'property': () => prisma.property.findUnique({ where: { id: entityId } }),
    'lease': () => prisma.lease.findUnique({ where: { id: entityId } }),
    'payment': () => prisma.payment.findUnique({ where: { id: entityId } }),
    'tenant': () => prisma.tenant.findUnique({ where: { id: entityId } }),
    'user': () => prisma.user.findUnique({ where: { id: entityId } })
  };

  const fetcher = entityMap[entityType.toLowerCase()];
  return fetcher ? await fetcher() : null;
}

/**
 * Log activity to audit trail
 */
export const logActivity = async (userId, organizationId, action, description, metadata = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        organizationId,
        action,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging failures shouldn't break the main operation
  }
};

/**
 * Alias for authenticateToken for backwards compatibility
 */
export const authenticateUser = authenticateToken;
