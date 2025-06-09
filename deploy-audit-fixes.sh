#!/bin/bash

# 🚀 Deploy Audit System Fixes to Production
# This script commits and pushes all audit system fixes for Railway deployment

echo "🔧 Deploying Audit System Fixes to Production..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the correct directory. Please run from project root."
    exit 1
fi

# Add all changes
echo "📦 Adding all changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️ No changes to commit."
    exit 0
fi

# Show what will be committed
echo ""
echo "📋 Changes to be committed:"
git diff --staged --name-only

echo ""
echo "🔍 Detailed changes:"
git diff --staged --stat

echo ""
read -p "🤔 Do you want to proceed with the commit? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

# Commit with detailed message
echo ""
echo "💾 Committing changes..."
git commit -m "🔧 Fix audit system for production deployment

🎯 FIXES IMPLEMENTED:

✅ System Health Status:
- Fix system health status logic to use backend health_level
- Enhanced response time consideration in health calculation
- Proper fallback when backend health_level not available

✅ SQL Query Compatibility:
- Fix PostgreSQL INTERVAL syntax for production environment
- Change 'CURRENT_DATE - INTERVAL \$1 || ' days'' to 'NOW() - INTERVAL '1 day' * \$1'
- Ensure compatibility with Railway PostgreSQL

✅ Cleanup Operations:
- Add fallback error handling for cleanup operations
- Graceful error handling without system crash
- Enhanced logging for production debugging

✅ Error Handling:
- Robust error handling with fallbacks
- Enhanced logging for debugging in production
- Prevent 500 errors from crashing the system

🐛 ISSUES RESOLVED:
- System status showing 'Perhatian' instead of proper health status
- Cleanup operation error 500 due to SQL syntax incompatibility
- Health status not properly using backend response
- SQL queries failing in production PostgreSQL environment

🧪 TESTING REQUIRED AFTER DEPLOYMENT:
- Verify System Monitoring shows 'Sangat Baik' or 'Baik' status
- Test all cleanup operations (30/90/365 days) work without errors
- Confirm audit trail statistics display correctly
- Validate system health metrics are accurate

Files changed:
- src/api/supervisorAPI.js (system health logic)
- models/system/auditLogModel.js (SQL query fixes)
- controllers/admin/auditLogController.js (error handling)
- PRODUCTION_DEPLOYMENT_FIXES.md (documentation)

Ready for Railway production deployment 🚀"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful!"
    echo ""
    echo "🚀 Pushing to GitHub for Railway deployment..."
    
    # Push to origin
    git push origin master
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Changes pushed to GitHub."
        echo ""
        echo "📡 Railway Deployment Status:"
        echo "   - Railway will automatically deploy from GitHub"
        echo "   - Deployment usually takes 2-5 minutes"
        echo "   - Check Railway dashboard for deployment progress"
        echo ""
        echo "🧪 After deployment, please test:"
        echo "   1. System Monitoring tab - status should show 'Sangat Baik' or 'Baik'"
        echo "   2. Database & Maintenance tab - cleanup operations should work"
        echo "   3. Audit Trail tab - statistics should be accurate"
        echo ""
        echo "🔗 Production URL: https://booking-futsal-production.up.railway.app"
        echo "📊 API Docs: https://booking-futsal-production.up.railway.app/api-docs"
        echo ""
        echo "✨ Audit system fixes deployed successfully!"
    else
        echo "❌ Error: Failed to push to GitHub."
        echo "Please check your internet connection and try again."
        exit 1
    fi
else
    echo "❌ Error: Commit failed."
    exit 1
fi
