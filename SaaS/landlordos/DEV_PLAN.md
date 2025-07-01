# RoofBoard – MVP Development Plan

## 🎯 Purpose

Build a modern, modular SaaS web application to help landlords and small-scale real estate investors manage all aspects of single-family residential property ownership and rental management.

---

## 👤 Target Users

- Independent landlords (1–20 properties)
- DIY investors and homeowners renting ADUs or short-term rentals
- Small-scale property managers

---

## 🛠️ MVP Feature Scope

### 🏠 Property Management
- Add, edit, and view properties
- Store address, purchase price, loan info, insurance details, and notes

### 👥 Tenant & Lease Tracking
- Tenant contact info
- Lease start/end dates
- Rent amount and payment schedule
- Lease expiration reminders

### 💸 Finance Management
- Log income and expenses
- Attach receipts (file upload)
- Monthly and year-to-date reports (basic P&L)

### 🛠️ Maintenance Tracking
- Create tasks for repairs/inspections
- Assign vendor
- Add photo uploads, due dates, status

### 📅 Reminders & Notifications
- Auto-reminders for rent, lease renewals, insurance dates
- Dashboard alert panel or email (future feature)

---

## 💰 Pricing Model

| Plan        | Features                                      | Price  | Monetization        |
|-------------|-----------------------------------------------|--------|---------------------|
| Free        | 1–2 properties, limited features               | $0     | **AdSense-supported** |
| Starter     | Up to 5 properties, no ads, reports, reminders| $10/mo | Subscription        |
| Pro         | Unlimited properties, CSV export, tax tools   | $25/mo | Subscription        |
| Enterprise  | Multi-user access, white-label, vendor access | Custom | Subscription        |

---

## 📊 AdSense Integration (Free Plan Only)

### Ad Placement Guidelines:
- **Sidebar (desktop)** – 300x600 responsive display
- **Footer (all views)** – 728x90 or responsive
- **Mobile Bottom Bar** – sticky but minimal
- ⚠️ Avoid ad placement near forms or sensitive tenant data

---

## 🧱 Tech Stack

### Frontend
- Framework: React
- Styling: Tailwind CSS
- State Management: Context API (or Redux Toolkit if needed)
- Build Tool: Vite

### Backend
- Runtime: Node.js with Express
- Authentication: JWT-based or external (e.g., Auth0)
- ORM: Prisma

### Database
- PostgreSQL

### Hosting
- Frontend: Namecheap (initial) or Vercel (recommended)
- Backend/API: Railway or Render
- Database: Supabase or Railway

### DevOps
- CI/CD: GitHub Actions
- Git repo: GitHub (`jadaru-runner` or new repo)

---

## 📦 Data Models (Initial Draft)

### Property
- id
- user_id
- address
- purchase_price
- loan_balance
- insurance_expiry
- notes

### Tenant
- id
- property_id
- name
- phone
- email
- lease_start
- lease_end
- monthly_rent

### Payment
- id
- tenant_id
- date
- amount
- method
- notes

### MaintenanceTask
- id
- property_id
- title
- description
- due_date
- status
- vendor
- attachments

---

## 🧪 Initial Dev Tasks

1. Scaffold React project with Tailwind and routing
2. Set up Express backend and PostgreSQL connection via Prisma
3. Define and seed database schema
4. Implement secure login/auth (JWT or Auth0)
5. Build property + tenant CRUD pages
6. Integrate AdSense placeholders for Free users
7. Deploy frontend and backend
8. Create onboarding flow for new users

---

## 🗂️ Future Features (Post-MVP)

- Document vault for leases, receipts, policies
- Mobile app via React Native
- SMS/email notifications
- CPA-ready tax export tool
- Invite collaborators (co-owners/accountants)
- Tenant communication logs
- Market analytics dashboard (cash flow, ROI, appreciation)

---

## 📍 Notes

- Start with single-user architecture; multi-user roles added in v2
- MVP must prioritize simplicity, speed, and clean UX
- Emphasis on data privacy, security, and auditability
