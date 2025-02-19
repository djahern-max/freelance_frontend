#!/bin/bash

# Exit on error
set -e

# Configuration
SERVER="dane@161.35.96.28"
DEPLOY_PATH="/var/www/html"
BUILD_FOLDER="build"

echo "🚀 Starting deployment process..."

# Build the React application
echo "📦 Building React application..."
npm run build

# Check if build was successful
if [ ! -d "$BUILD_FOLDER" ]; then
    echo "❌ Build failed - build folder not found"
    exit 1
fi

# Deploy to server
echo "📤 Uploading build files..."
scp -r $BUILD_FOLDER/* $SERVER:~/temp-deploy

# Move files to deployment location and set permissions
echo "📋 Moving files and setting permissions..."
ssh -t $SERVER "sudo -S rm -rf $DEPLOY_PATH/* && \
                sudo -S mv ~/temp-deploy/* $DEPLOY_PATH/ && \
                sudo -S chown -R www-data:www-data $DEPLOY_PATH && \
                sudo -S chmod -R 755 $DEPLOY_PATH && \
                sudo -S systemctl restart nginx"

echo "✅ Deployment completed successfully!"
