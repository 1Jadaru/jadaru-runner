-- LandlordOS Database Setup Script
-- Run this in PostgreSQL command line or pgAdmin

-- Create the development database
CREATE DATABASE landlordos_dev;

-- Create a dedicated user for the application (optional but recommended)
CREATE USER landlordos_user WITH PASSWORD 'secure_password_2025';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE landlordos_dev TO landlordos_user;

-- Connect to the database and grant schema privileges
\c landlordos_dev;
GRANT ALL ON SCHEMA public TO landlordos_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO landlordos_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO landlordos_user;
