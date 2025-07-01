# LandlordOS - Quick Start Guide

This is a condensed version of the setup guide for experienced developers who want to get the project running quickly.

## Prerequisites
- Node.js 18+
- PostgreSQL
- npm/yarn

## Quick Setup

### 1. Project Structure
```bash
mkdir landlordos && cd landlordos
mkdir server client
```

### 2. Backend Setup
```bash
cd server
npm init -y
npm install express cors helmet dotenv bcryptjs jsonwebtoken @prisma/client prisma express-validator express-rate-limit multer
npm install -D nodemon
```

Create `.env`:
```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/landlordos_dev"
JWT_SECRET="landlordos_super_secure_jwt_secret_2025"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Database Setup
```bash
# Copy schema.prisma from main guide
npx prisma generate
npx prisma db push
```

### 4. Frontend Setup
```bash
cd ../client
npm create vite@latest . -- --template react-ts
npm install react-router-dom @tanstack/react-query axios @headlessui/react lucide-react tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Key Files to Create

**Backend:**
- `server/src/index.js` (main server)
- `server/src/middleware/auth.js` (JWT auth)
- `server/src/routes/auth.js` (login/register)
- `server/src/routes/dashboard.js` (dashboard stats)
- `server/src/routes/properties.js` (CRUD operations)

**Frontend:**
- `client/src/contexts/AuthContext.tsx` (auth state)
- `client/src/services/apiService.ts` (API calls)
- `client/src/pages/Dashboard.tsx` (dashboard UI)
- `client/src/pages/Properties.tsx` (property management)

### 6. Run the Application
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

### 7. Test the Application
1. Open http://localhost:5173
2. Register a new account
3. Create a property
4. View dashboard stats

## Key API Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property

## Troubleshooting
- **Database errors**: Check PostgreSQL is running and DATABASE_URL is correct
- **CORS errors**: Verify frontend URL in CORS_ORIGIN
- **Auth errors**: Ensure JWT_SECRET is set and consistent

For complete implementation details, see the full SETUP_GUIDE.md file.

## 🌐 Once Running
- **App**: http://localhost:5173
- **API**: http://localhost:5000
- **Login**: demo@landlordos.com / demo123

## 🛠️ Manual Commands
```bash
# Install everything
npm run install:all

# Start backend (Terminal 1)
npm run dev:server

# Start frontend (Terminal 2)  
npm run dev:client
```

## 📊 Database Tools
```bash
cd server
npx prisma studio    # Visual DB editor
npm run seed        # Add demo data
```

## 🆘 Troubleshooting
1. **Dependencies**: Run `npm run install:all`
2. **Database**: Check `server/.env` file
3. **Ports**: Frontend auto-finds available port
4. **Node**: Ensure v18+ with `node --version`

**📁 Full Guide**: See `HOW_TO_RUN.md` for detailed instructions
