# Database Setup Guide

## 🗄️ PostgreSQL Database Setup for LandlordOS

### Option 1: Using PostgreSQL Command Line (Recommended)

1. **Open Command Prompt as Administrator** and run:
   ```bash
   # Using the full path to psql
   "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
   ```

2. **Enter your PostgreSQL password** when prompted

3. **Create the database:**
   ```sql
   CREATE DATABASE landlordos_dev;
   \q
   ```

### Option 2: Using pgAdmin (GUI Method)

1. **Open pgAdmin** (installed with PostgreSQL)
2. **Connect to your PostgreSQL server**
3. **Right-click on "Databases"** → **Create** → **Database**
4. **Name**: `landlordos_dev`
5. **Click Save**

### Option 3: Run the SQL Script

1. **Copy the content** from `prisma/setup_database.sql`
2. **Run it in pgAdmin Query Tool** or command line

---

## 🔧 Environment Configuration

1. **Update your `.env` file** with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/landlordos_dev"
   ```

2. **Replace `YOUR_PASSWORD`** with your actual PostgreSQL password

---

## 🚀 Initialize Prisma

After creating the database, run these commands:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Seed the database with sample data
npm run seed
```

---

## ✅ Verification

To verify everything is working:

```bash
# Open Prisma Studio to view your data
npm run prisma:studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit your data.

---

## 🎯 Next Steps

Once the database is set up:
1. ✅ Database created
2. ✅ Prisma schema defined  
3. ✅ Migrations ready
4. ✅ Seed data prepared
5. 🔄 **Ready for Step 3: Project Scaffolding**
