# LandlordOS Enterprise

LandlordOS is a **modern, enterprise-ready SaaS application** designed to help landlords, property management companies, and real estate organizations manage residential rentals at scale. It features a beautiful, professional UI with advanced animations, **role-based access control**, **multi-organization support**, and comprehensive property management capabilities.

---

## 🏢 **Enterprise Features (June 2025)**

The application has been completely upgraded to enterprise-level with:

### 👥 **Multi-Organization Support**
- **Organization isolation** with strict data separation
- **INDIVIDUAL, BUSINESS, and ENTERPRISE** organization types
- **Scalable architecture** supporting unlimited organizations
- **Organization-scoped data** for complete privacy and security

### 🛡️ **Role-Based Access Control (RBAC)**
- **4 hierarchical roles**: ADMIN (100), MANAGER (50), AGENT (25), VIEWER (10)
- **24 granular permissions** across all application modules
- **Permission inheritance** with role hierarchy
- **Real-time permission validation** on all operations

### 🏠 **Property Assignment System**
- **Flexible property assignments** for individual users
- **Assignment-based filtering** and access control
- **Manager-level assignment** management
- **Full access** for admin and management roles

### 📋 **Comprehensive Audit Trail**
- **Complete action logging** with user attribution
- **Timestamp tracking** for all operations
- **Resource-specific** audit logs
- **Compliance-ready** audit trail for enterprise requirements

### 🔐 **Enterprise Security**
- **JWT-based authentication** with organization context
- **Middleware-level permission** validation
- **Secure API endpoints** with role verification
- **Data isolation** between organizations

---

## ✨ **UI/UX Modernization (December 2024)**

### 🎨 **Premium UI/UX Design**
- **Modern glassmorphism effects** and gradient backgrounds
- **Advanced metric cards** with progress rings and animations
- **Professional dashboard** with enhanced visualizations
- **Responsive design** optimized for all devices
- **Framer Motion animations** for smooth interactions
- **Tailwind CSS v3** for consistent, beautiful styling

### 🔧 **Enhanced Functionality**
- **Permission-based UI rendering** with role awareness
- **Organization information display** in navigation
- **Advanced authentication** with enterprise context
- **Real-time dashboard metrics** and performance tracking
- **Enhanced property management** with assignment filtering
- **Professional navigation** with role-based menu items

---

## 🚀 **Current Features**

### 📊 **Enterprise Dashboard**
- Real-time metrics with animated progress rings
- **Organization-scoped** financial overview
- Property performance analytics with **assignment filtering**
- Recent activity tracking with **audit integration**
- Quick action buttons with **permission-based** visibility

### 🏠 **Property Management**
- Add, edit, and delete properties with **role-based permissions**
- **Property assignment** management for team members
- **Organization-scoped** property filtering
- Search and filter functionality with **access control**
- Visual property cards with **assignment indicators**

### 👥 **Tenant Management**
- Tenant profiles and contact information
- Lease management and tracking
- Rent payment history
- Maintenance request handling

### 💰 **Financial Tracking**
- Income and expense logging
- Monthly financial summaries
- Profit/loss calculations
- Expense categorization

### 🔧 **Maintenance**
- Task creation and tracking
- Priority management
- Vendor management
- Maintenance history

### 📱 **Modern Features**
- **Tier System**: FREE, BASIC, PREMIUM
- **AdSense Integration**: Revenue generation for free tier
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live data synchronization
- **Advanced UI Components**: Cards, skeletons, modals

---

## 🧰 **Prerequisites**

### **System Requirements**
- **Node.js** (v18+)
- **npm** or yarn
- **PostgreSQL** (v13+)
- **Git**
- **VS Code** or other IDE

### **Recommended VS Code Extensions**
- Prettier - Code formatter
- ESLint - Code linting
- Tailwind CSS IntelliSense - CSS autocomplete
- Prisma - Database schema support
- GitHub Copilot - AI pair programming
- REST Client - API testing

---

## 🛠️ **Quick Start**

### **Option 1: Use Start Scripts (Recommended)**
```bash
# Clone the repository
git clone https://github.com/your-username/landlordos.git
cd landlordos

# Use the automated start script
./START.bat    # Windows
# or
npm run setup  # Cross-platform
```

### **Option 2: Manual Setup**

#### **1. Database Setup**
```bash
# Ensure PostgreSQL is running
createdb landlordos_dev
```

#### **2. Backend Setup**
```bash
cd server
npm install

# Create .env file with:
# DATABASE_URL="postgresql://user:password@localhost:5432/landlordos_dev"
# JWT_SECRET="your_jwt_secret_here"
# NODE_ENV="development"

# Initialize database
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

#### **3. Frontend Setup**
```bash
cd ../client
npm install
```

#### **4. Run Both Servers**
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend  
cd client
npm run dev
```

#### **5. Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Default Login**: demo@landlordos.co / password123

---

## 📦 **Tech Stack**

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI Framework |
| **TypeScript** | 5.8.3 | Type Safety |
| **Tailwind CSS** | 3.4.17 | Styling Framework |
| **Framer Motion** | 12.18.1 | Animations |
| **React Query** | 5.80.7 | Data Fetching |
| **React Router** | 7.6.2 | Navigation |
| **Recharts** | 2.15.3 | Data Visualization |
| **Lucide React** | 0.515.0 | Icons |
| **Vite** | 6.3.5 | Build Tool |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **Express** | Latest | Web Framework |
| **Prisma** | Latest | ORM & Database |
| **PostgreSQL** | 13+ | Database |
| **JWT** | Latest | Authentication |
| **bcryptjs** | Latest | Password Hashing |

### **Development**
| Technology | Purpose |
|------------|---------|
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **Nodemon** | Development Server |
| **GitHub Actions** | CI/CD Pipeline |

---

## 🔧 **Architecture Overview**

### **Frontend Architecture**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (Button, Card, etc.)
│   ├── layout/          # Layout components (Navbar, Sidebar)
│   └── ads/             # AdSense integration
├── pages/               # Route components
├── contexts/            # React Context providers
├── services/            # API services
├── hooks/               # Custom React hooks
└── types/               # TypeScript definitions
```

### **Backend Architecture**
```
src/
├── routes/              # API route handlers
├── middleware/          # Express middleware
├── services/            # Business logic
├── utils/               # Utility functions
└── index.js             # Server entry point
```

### **Key Features Implementation**

#### **🎨 Modern UI Components**
- **EnhancedCards**: Animated metric cards with progress rings
- **GlassMorphism**: Glass effect components with backdrop blur
- **DashboardModern**: Premium dashboard with comprehensive metrics
- **NotificationSystem**: Toast notifications for user feedback
- **SidebarEnhanced**: Professional navigation with icons

#### **🔐 Authentication & Security**
- JWT-based authentication
- Content Security Policy (CSP) configured
- CORS properly set up
- Password hashing with bcrypt
- Protected routes and middleware

#### **💳 Tier-Based Features**
- **FREE**: Basic features + AdSense ads
- **BASIC**: No ads + extended limits
- **PREMIUM**: Full features + priority support

---

## 🔐 **Environment Variables**

### **Server (.env)**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/landlordos_dev"

# Authentication
JWT_SECRET="your_super_secure_jwt_secret_here"

# Environment
NODE_ENV="development"

# Optional: AdSense (Production)
ADSENSE_CLIENT_ID="ca-pub-xxxxxxxxxxxxxxxx"
```

### **Client (Environment-based)**
- Development mode automatically disables AdSense
- Production mode enables full AdSense functionality
- CSP configured for both environments

---

## 🚦 **Current Status**

### **✅ Completed Features**
- ✅ Modern, premium UI/UX design
- ✅ Complete authentication system
- ✅ Dashboard with real-time metrics
- ✅ Property management (CRUD)
- ✅ Tenant management
- ✅ Financial tracking
- ✅ Maintenance task management
- ✅ Tier-based AdSense integration
- ✅ Responsive design
- ✅ Console error resolution
- ✅ TypeScript improvements
- ✅ CSP and security configuration

### **🔄 In Progress**
- Enhanced property analytics
- Advanced reporting features
- Mobile app considerations
- Additional integrations

### **📋 Future Roadmap**
- Payment processing integration
- Document management
- Automated rent reminders
- Bulk property operations
- Advanced analytics dashboard
- Mobile application
- Third-party integrations (QuickBooks, etc.)

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Database Connection**
```bash
# Check PostgreSQL is running
pg_ctl status

# Recreate database if needed
dropdb landlordos_dev
createdb landlordos_dev
npm run db:reset
```

#### **Port Conflicts**
- Frontend: Default port 5173 (Vite auto-assigns if busy)
- Backend: Default port 5000
- Update .env if ports need to change

#### **Console Errors**
- All major console errors resolved
- AdSense disabled in development mode
- CSP properly configured for production

#### **Styling Issues**
- Tailwind CSS v3 properly configured
- All gradients and animations working
- Responsive design tested

---

## 📱 **Mobile Support**

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Responsive layout with collapsible sidebar
- **Mobile**: Touch-optimized interface with mobile navigation

---

## 🔒 **Security Features**

- **Content Security Policy**: Strict CSP headers
- **CORS Configuration**: Proper cross-origin settings
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation
- **SQL Injection Protection**: Prisma ORM protection

---

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Use Prettier for formatting
- Follow ESLint rules
- Write descriptive commit messages
- Test all new features

---

## � **Documentation**

### **Additional Documentation**
- [`FRONTEND_ENHANCEMENT_ROADMAP.md`](./FRONTEND_ENHANCEMENT_ROADMAP.md) - UI/UX improvement suggestions
- [`HOW_TO_RUN.md`](./HOW_TO_RUN.md) - Detailed setup instructions
- [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) - Comprehensive setup guide
- [`CURRENT_STATUS.md`](./CURRENT_STATUS.md) - Project status and progress

### **API Documentation**
- RESTful API endpoints
- Authentication flows
- Error handling
- Response formats

---

## �📝 **License**

MIT License - see [LICENSE](./LICENSE) file for details

---

## � **Support & Contact**

### **Getting Help**
- 📧 **Email**: hello@landlordos.co
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/landlordos/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/landlordos/discussions)

### **Development Team**
- **Lead Developer**: [Your Name]
- **UI/UX Modernization**: Completed December 2024
- **Technical Architecture**: Modern React/Node.js stack

---

## 🎯 **Project Vision**

LandlordOS aims to be the **premier SaaS solution** for small-to-medium property investors, providing:

- **Professional Grade**: Enterprise-quality features with beautiful design
- **User Focused**: Intuitive interface that landlords actually want to use
- **Scalable**: Architecture that grows with your property portfolio
- **Modern**: Cutting-edge technology and design patterns
- **Affordable**: Tier-based pricing for every business size

---

**🚀 Ready to transform your property management experience? Get started today!**
