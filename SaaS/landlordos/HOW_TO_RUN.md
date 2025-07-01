# 🚀 How to Run LandlordOS Locally

*Updated: December 19, 2024 - Post-Modernization*

## ⚡ **Quick Start (Recommended)**

### **Option 1: Automated Startup (Windows)**
```bash
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos
.\START.bat
```
*This script automatically starts both backend and frontend servers*

### **Option 2: Manual Development**
```bash
# Terminal 1: Backend Server
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos\server
npm run dev

# Terminal 2: Frontend Server  
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos\client
npm run dev
```

---

## 📋 **Prerequisites**

### **System Requirements**
- **Node.js**: v18+ (check with `node --version`)
- **npm**: Latest version (check with `npm --version`) 
- **PostgreSQL**: v13+ running locally or accessible remotely
- **Git**: For version control and updates

### **Recommended Setup**
- **VS Code**: With Prettier, ESLint, Tailwind CSS IntelliSense
- **Chrome DevTools**: For debugging and performance monitoring
- **PostgreSQL GUI**: pgAdmin or similar for database management

---

## 🔧 **First-Time Setup**

### **1. Clone & Navigate**
```bash
# If not already cloned
git clone https://github.com/your-username/landlordos.git
cd landlordos

# Or navigate to existing project
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos
```

### **2. Install All Dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies  
cd ../client
npm install
```

### **3. Database Configuration**
Create a `.env` file in the `server/` folder:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/landlordos_dev"

# Authentication
JWT_SECRET="your_super_secure_jwt_secret_here"

# Environment
NODE_ENV="development"

# Optional: AdSense (Production only)
ADSENSE_CLIENT_ID="ca-pub-xxxxxxxxxxxxxxxx"
```

### **4. Database Initialization**
```bash
cd server

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed
```

## 🚀 **Running the Application**

### **Development Servers**

#### **Option A: Automated Start (Windows)**
```bash
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos
.\START.bat
```
*This automatically opens both backend and frontend in separate terminals*

#### **Option B: Manual Start**
```bash
# Terminal 1: Backend Server
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos\server
npm run dev

# Terminal 2: Frontend Server
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos\client
npm run dev
```

### **Access Points**
Once both servers are running:
- **Frontend**: http://localhost:5173 (Modern UI with DashboardModern)
- **Backend API**: http://localhost:5000 
- **Health Check**: http://localhost:5000/health
- **Database Studio**: `npx prisma studio` (in server directory)

### **Demo Login**
- **Email**: demo@landlordos.co
- **Password**: password123
- **Tier**: FREE (includes AdSense placeholders in dev mode)

---

## 🔍 **Verification Steps**

### **1. Backend Health Check**
```bash
# Test API connection
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","message":"LandlordOS API is running"}
```

### **2. Frontend Loading**
- Navigate to http://localhost:5173
- Should see modern landing page with gradients and animations
- Login should redirect to premium dashboard with metrics

### **3. Database Connection**
```bash
cd server
npx prisma studio
# Opens database browser at http://localhost:5555
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Port Conflicts**
```bash
# If ports are in use
# Frontend: Vite auto-assigns new port (5174, 5175, etc.)
# Backend: Change PORT in server/.env or kill process

# Kill Node processes if needed
taskkill /F /IM node.exe
```

#### **Database Connection Issues**
```bash
# Reset database if needed
cd server
npx prisma migrate reset --force
npx prisma db seed
```

#### **Module Installation Issues**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd server && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```

#### **Console Errors (Should be clean now)**
- All major console errors have been resolved
- AdSense disabled in development mode
- Proper CSP and font loading implemented

### **Environment-Specific Issues**

#### **Windows-Specific**
```bash
# If PowerShell execution policy issues
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Use Command Prompt as alternative
cmd
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos
START.bat
```

#### **Font Loading Issues**
- Google Fonts have comprehensive fallbacks
- System fonts (Inter, system-ui, etc.) will load if Google Fonts fail
- See browser Network tab if fonts aren't loading

---

## 🛠️ **Development Tools**

### **Database Management**
```bash
# Visual database editor
cd server
npx prisma studio

# Generate client after schema changes  
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (destructive)
npx prisma migrate reset --force
```

### **Code Quality**
```bash
# Frontend linting and formatting
cd client
npm run lint
npm run lint:fix

# TypeScript type checking
npm run build
```

### **API Testing**
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@landlordos.co", "password": "password123"}'

# Test protected route (replace {token} with actual JWT)
curl -H "Authorization: Bearer {token}" http://localhost:5000/api/dashboard
```

---

## 📱 **Testing the Modernized UI**

### **Key Features to Test**
1. **Landing Page**: Modern hero section with gradients
2. **Authentication**: Enhanced login/register with error handling
3. **Dashboard**: Premium dashboard with animated metrics and charts
4. **Properties**: Modern property cards with search/filter
5. **Responsive Design**: Test on mobile, tablet, desktop
6. **Animations**: Smooth transitions and hover effects

### **Browser Testing**
- **Chrome**: Primary development browser
- **Firefox**: Cross-browser compatibility
- **Safari**: WebKit testing
- **Edge**: Microsoft compatibility

### **Mobile Testing**
- **Chrome DevTools**: Device simulation
- **Real Devices**: iOS Safari, Android Chrome
- **Responsive Breakpoints**: 320px, 768px, 1024px, 1440px+

---

## 🔒 **Security Considerations**

### **Development Environment**
- CSP configured for development with necessary allowlists
- AdSense disabled in development mode
- CORS configured for localhost
- JWT secrets should be secure in production

### **Production Preparation**
- Update environment variables for production
- Enable AdSense for revenue generation
- Configure production database
- Set up proper SSL certificates

---

## 📊 **Performance Monitoring**

### **Development Metrics**
```bash
# Frontend bundle analysis
cd client
npm run build
# Check dist/ folder size

# Backend performance
# Check terminal for API response times
# Monitor memory usage in Task Manager
```

### **Browser Performance**
- **Lighthouse**: Run audit for performance metrics
- **Chrome DevTools**: Monitor Network, Performance tabs
- **React DevTools**: Component render performance

---

**🎉 The modernized LandlordOS is now ready for development! Enjoy the premium UI/UX experience.**

# Terminal 2: Start Frontend (React App)
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos
npm run dev:client
```

#### Option B: Individual Commands
```bash
# Backend only (Port 5000)
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos\server
npm run dev

# Frontend only (Port 5173+)
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos\client
npm run dev
```

## 🌐 Access Your Application

Once both servers are running:

- **🎨 Frontend (React App)**: http://localhost:5173 (or next available port)
- **🔧 Backend API**: http://localhost:5000
- **✅ Health Check**: http://localhost:5000/health
- **📊 Database Admin**: Run `npx prisma studio` in server folder

## 🔑 Demo Login Credentials

```
Email: demo@landlordos.com
Password: demo123
```

## ⚠️ Troubleshooting

### Port Already in Use
If you see "port in use" errors:
- **Frontend**: Vite will automatically try ports 5174, 5175, 5176, etc.
- **Backend**: Change port in `server/.env` file: `PORT=5001`

### Database Connection Issues
```bash
# Check database status
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos\server

# Reset database (if needed)
npx prisma migrate reset

# Apply schema
npx prisma db push

# Seed with demo data
npm run seed
```

### Missing Dependencies
```bash
# Reinstall everything
cd c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos
npm run install:all

# Or install individually
cd client && npm install
cd ../server && npm install
```

### Node Version Issues
Make sure you're using Node.js v18 or higher:
```bash
node --version
# If too old, visit https://nodejs.org and update
```

## 🛠️ Development Commands

### Frontend (React)
```bash
cd client
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code style
npm run test         # Run tests
```

### Backend (Express)
```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start           # Start production server
npx prisma studio   # Open database admin UI
npx prisma generate # Regenerate Prisma client
```

### Database Management
```bash
cd server
npx prisma studio           # Visual database editor
npx prisma db push          # Apply schema changes
npx prisma migrate dev      # Create new migration
npx prisma migrate reset    # Reset database (dev only)
npm run seed               # Populate with demo data
```

## 📁 Project Structure
```
landlordos/
├── client/          # React frontend
├── server/          # Express backend
├── scripts/         # Convenience scripts
├── docs/           # Documentation
└── package.json    # Root package file
```

## 🔧 Environment Variables

### Server (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/landlordos_dev"
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Next Steps

1. **First Time**: Use the demo credentials to log in
2. **Add Properties**: Start by creating your first property
3. **Explore Features**: Navigate through all the sections
4. **Customize**: Modify the code to fit your needs

## 📞 Need Help?

If you encounter any issues:

1. **Check Logs**: Look at the terminal output for error messages
2. **Database**: Use `npx prisma studio` to verify data
3. **Network**: Ensure both servers are running and accessible
4. **Browser**: Try refreshing or opening in incognito mode

---

**✅ Ready to Go!** Your LandlordOS application should now be running successfully on your local machine.
