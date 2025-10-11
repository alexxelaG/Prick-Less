#!/bin/bash

# Prick-Less Database Setup Script
echo "🏥 Setting up Prick-Less Database..."

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH"
    echo "Please install MySQL first:"
    echo "  macOS: brew install mysql"
    echo "  Ubuntu: sudo apt-get install mysql-server"
    exit 1
fi

# Load environment variables
if [ -f "./software/glucose-monitor-backend/.env" ]; then
    source ./software/glucose-monitor-backend/.env
    echo "✅ Loaded environment variables"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Create database if it doesn't exist
echo "📊 Creating database if it doesn't exist..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' ready"
else
    echo "❌ Failed to create database"
    exit 1
fi

# Run schema
echo "🔧 Setting up database schema..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < ./database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully"
else
    echo "❌ Failed to create schema"
    exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo "📊 Database: $DB_NAME"
echo "🔗 Host: $DB_HOST"
echo "👤 User: $DB_USER"
echo ""
echo "Next steps:"
echo "1. cd software/glucose-monitor-backend"
echo "2. npm install"
echo "3. npm start"