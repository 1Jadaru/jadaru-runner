#!/bin/bash

# LandlordOS Development Setup Script
echo "🏠 Setting up LandlordOS development environment..."

# Install root dependencies
echo "📦 Installing workspace dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Install server dependencies  
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Copy environment file
if [ ! -f "server/.env" ]; then
    echo "📋 Creating environment file..."
    cp server/.env.example server/.env
    echo "⚠️  Please update server/.env with your database credentials"
fi

echo "✅ Setup complete! Run 'npm run dev' to start development servers"
echo "📚 See docs/DEVELOPMENT.md for more information"
