import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.' 
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tier: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Access denied. Account is deactivated.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied. Token expired.' 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};

export const requireTier = (requiredTier) => {
  const tierLevels = { FREE: 0, BASIC: 1, PREMIUM: 2 };
  
  return (req, res, next) => {
    const userTierLevel = tierLevels[req.user.tier] || 0;
    const requiredTierLevel = tierLevels[requiredTier] || 0;
    
    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        error: `Access denied. ${requiredTier} tier required.`,
        currentTier: req.user.tier,
        requiredTier,
      });
    }
    
    next();
  };
};
