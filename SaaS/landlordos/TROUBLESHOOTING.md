# LandlordOS - Troubleshooting Guide

This guide covers common issues and their solutions when setting up and running the LandlordOS application.

## Common Setup Issues

### 1. Database Connection Problems

**Error:** `PrismaClient initialization failed`
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solutions:**
1. **Check PostgreSQL Service:**
   ```bash
   # Windows
   services.msc
   # Look for PostgreSQL service and ensure it's running
   
   # macOS
   brew services list | grep postgres
   brew services start postgresql
   
   # Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Verify Database Exists:**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   \l
   -- Should show landlordos_dev database
   ```

3. **Check DATABASE_URL:**
   ```env
   # Correct format
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   
   # Common mistakes:
   # Wrong port (5432 is default for PostgreSQL)
   # Wrong credentials
   # Database name doesn't exist
   ```

**Error:** `P2002: Unique constraint failed`
```
Error: Unique constraint failed on the fields: (`email`)
```

**Solution:** User with that email already exists. Use a different email or delete the existing user.

### 2. Authentication Issues

**Error:** `Access denied. Invalid token.`

**Possible Causes & Solutions:**

1. **JWT_SECRET Mismatch:**
   ```bash
   # Check if JWT_SECRET is set
   echo $JWT_SECRET  # Linux/Mac
   echo %JWT_SECRET% # Windows
   
   # Ensure it's the same across all instances
   ```

2. **Token Format Issues:**
   ```javascript
   // Frontend should send token as:
   headers: {
     'Authorization': 'Bearer ' + token
   }
   
   // Common mistakes:
   // Missing 'Bearer ' prefix
   // Extra spaces
   // Token truncation
   ```

3. **Token Expiration:**
   ```javascript
   // Check token expiration in browser dev tools
   // Application -> Local Storage -> token
   // Decode JWT at jwt.io to check exp field
   ```

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions:**
1. **Backend CORS Configuration:**
   ```javascript
   // In server/src/index.js
   app.use(cors({
     origin: [
       'http://localhost:5173',
       'http://localhost:5174',
       // Add your frontend URL
     ],
     credentials: true,
   }));
   ```

2. **Environment Variables:**
   ```env
   # server/.env
   CORS_ORIGIN="http://localhost:5173"
   ```

### 3. Frontend Build Issues

**Error:** `Module not found: Can't resolve 'axios'`

**Solution:**
```bash
cd client
npm install axios
# or
yarn add axios
```

**Error:** `Property 'type' does not exist on type`

**Solution:** Update TypeScript interfaces to match backend schema:
```typescript
interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'SINGLE_FAMILY' | 'DUPLEX' | 'CONDO' | 'TOWNHOUSE' | 'APARTMENT' | 'OTHER';
  // ... other fields
}
```

### 4. API Request Failures

**Error:** `400 Bad Request - Validation failed`

**Common Issues:**
1. **Missing Required Fields:**
   ```javascript
   // Properties require: address, city, state, zipCode, type
   const propertyData = {
     address: "123 Main St",
     city: "Los Angeles",
     state: "CA",           // Must be 2 characters
     zipCode: "90210",      // Must be at least 5 characters
     type: "SINGLE_FAMILY"  // Must be valid enum value
   };
   ```

2. **Field Validation:**
   ```javascript
   // State must be exactly 2 characters
   state: "CA" // ✓ Correct
   state: "California" // ✗ Too long
   
   // Numeric fields must be numbers, not strings
   bedrooms: 3 // ✓ Correct
   bedrooms: "3" // ✗ String
   ```

**Error:** `500 Internal Server Error`

**Debugging Steps:**
1. **Check Server Logs:**
   ```bash
   cd server
   npm run dev
   # Watch for error messages in console
   ```

2. **Enable Debug Logging:**
   ```javascript
   // Add to route handlers
   console.log('Request body:', req.body);
   console.log('User:', req.user);
   ```

3. **Database Query Issues:**
   ```javascript
   // Check Prisma queries
   console.log('Prisma query result:', result);
   ```

### 5. Port Conflicts

**Error:** `EADDRINUSE: address already in use`

**Solutions:**
1. **Find Process Using Port:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   
   # macOS/Linux
   lsof -i :5000
   kill -9 <process_id>
   ```

2. **Change Port:**
   ```env
   # server/.env
   PORT=5001
   
   # client/.env
   VITE_API_URL=http://localhost:5001/api
   ```

### 6. Environment Variable Issues

**Error:** `process.env.JWT_SECRET is undefined`

**Solutions:**
1. **Check .env File Location:**
   ```
   server/.env          # ✓ Correct
   server/src/.env      # ✗ Wrong location
   .env                 # ✗ Wrong location
   ```

2. **Verify .env Content:**
   ```env
   # No spaces around = sign
   JWT_SECRET="your_secret_here"  # ✓ Correct
   JWT_SECRET = "your_secret_here" # ✗ Wrong
   ```

3. **Restart Server:**
   ```bash
   # Environment variables are loaded at startup
   # Must restart server after changing .env
   ```

### 7. Frontend State Management Issues

**Error:** User data not persisting across page refresh

**Solution:**
```javascript
// AuthContext should persist token in localStorage
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // Verify token and restore user state
    authService.getProfile().then(setUser);
  }
}, []);
```

**Error:** API calls not including authentication token

**Solution:**
```javascript
// apiService.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Development Tools & Debugging

### 1. Database Inspection
```bash
# Prisma Studio
cd server
npx prisma studio
# Opens at http://localhost:5555
```

### 2. API Testing
```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Using PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```

### 3. Frontend Debugging
```javascript
// Browser DevTools
// Console -> Network tab to see API requests
// Application -> Local Storage to check stored data
// Console to check for JavaScript errors
```

## Performance Issues

### 1. Slow Database Queries

**Solutions:**
1. **Add Database Indexes:**
   ```prisma
   model Property {
     ownerId String
     owner   User @relation(fields: [ownerId], references: [id])
     
     @@index([ownerId])  // Add index for faster queries
   }
   ```

2. **Optimize Prisma Queries:**
   ```javascript
   // Use select to limit fields
   const properties = await prisma.property.findMany({
     select: {
       id: true,
       address: true,
       // Only select needed fields
     }
   });
   ```

### 2. Large Bundle Size

**Solutions:**
```javascript
// Code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Tree shaking - import only what you need
import { Building } from 'lucide-react'; // ✓ Good
import * as Icons from 'lucide-react';   // ✗ Imports everything
```

## Production Deployment Issues

### 1. Environment Variables
```env
# Production .env should have:
NODE_ENV="production"
DATABASE_URL="your_production_db_url"
JWT_SECRET="your_production_secret"  # Different from development
```

### 2. CORS Configuration
```javascript
// Allow production domain
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];
```

### 3. Database Migrations
```bash
# For production deployment
npx prisma migrate deploy
```

## Getting Help

1. **Check Logs:** Always check server and browser console logs first
2. **Isolate Issues:** Test API endpoints independently with curl/Postman
3. **Environment:** Verify all environment variables are set correctly
4. **Dependencies:** Ensure all npm packages are installed
5. **Database:** Verify database schema matches Prisma schema

## Useful Commands

```bash
# Reset database
cd server
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate

# Clear npm cache
npm cache clean --force

# Check running processes
ps aux | grep node    # macOS/Linux
tasklist | findstr node  # Windows

# View environment variables
printenv              # macOS/Linux
set                   # Windows
```
