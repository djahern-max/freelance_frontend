#!/bin/bash
# Frontend Deployment Script (Production Version)
# This script deploys a React frontend to the server's web root directory

# Exit immediately if a command exits with a non-zero status
set -e

# Check if frontend directory path is provided as an argument
if [ $# -eq 0 ]; then
  echo "Error: Please provide the path to your React frontend project directory."
  echo "Usage: $0 /path/to/your/frontend/project"
  exit 1
fi

# Navigate to the frontend project directory
FRONTEND_DIR="$1"
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Error: The specified directory does not exist: $FRONTEND_DIR"
  exit 1
fi

cd "$FRONTEND_DIR"
echo "Changed directory to: $(pwd)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "Error: No package.json found in $FRONTEND_DIR"
  echo "Make sure you've provided the correct path to your React project."
  exit 1
fi

# Configuration - modify these variables as needed
LOCAL_BUILD_DIR="./build"
REMOTE_USER="dane"
REMOTE_HOST="161.35.96.28"
REMOTE_DIR="/var/www/html"  # Updated to use the standard web root

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting frontend deployment...${NC}"

# Step 1: Build the React application
echo -e "${YELLOW}Building React application...${NC}"
npm run build

# Step 2: Check if build directory exists
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
  echo "Error: Build directory not found. Make sure the build process completed successfully."
  exit 1
fi

# Step 3: Create a backup of current deployment
echo -e "${YELLOW}Creating backup of current deployment...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "sudo tar -czf ~/frontend-backup-\$(date +%Y%m%d%H%M%S).tar.gz -C $REMOTE_DIR . 2>/dev/null || echo 'No files to backup'"

# Step 4: Clear the remote directory
echo -e "${YELLOW}Clearing remote directory...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "sudo rm -rf $REMOTE_DIR/*"

# Step 5: Transfer the build files
echo -e "${YELLOW}Transferring build files...${NC}"
rsync -avz --progress $LOCAL_BUILD_DIR/ $REMOTE_USER@$REMOTE_HOST:~/temp-deploy/
ssh $REMOTE_USER@$REMOTE_HOST "sudo cp -r ~/temp-deploy/* $REMOTE_DIR/ && rm -rf ~/temp-deploy"

# Step 6: Set permissions
echo -e "${YELLOW}Setting permissions...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "sudo chown -R www-data:www-data $REMOTE_DIR && sudo chmod -R 755 $REMOTE_DIR"

# Step 7: Verify the deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
ssh $REMOTE_USER@$REMOTE_HOST "ls -la $REMOTE_DIR"

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your files are deployed to: $REMOTE_DIR${NC}"
