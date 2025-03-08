#!/bin/bash
# Simple script to deploy RYZE AI frontend from Mac to Ubuntu server

# Server details
SERVER_USER="dane"
SERVER_IP="161.35.96.28"

echo "Building RYZE AI frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed! Aborting deployment."
    exit 1
fi

echo "Deploying to server... (you may be prompted for your password)"

# Use a single SSH connection for all commands
ssh -t ${SERVER_USER}@${SERVER_IP} "sudo chown -R dane:www-data /var/www/html && sudo rm -rf /var/www/html/*"

echo "Copying files to server..."
scp -r build/* ${SERVER_USER}@${SERVER_IP}:/var/www/html/

echo "Setting permissions and restarting nginx..."
ssh -t ${SERVER_USER}@${SERVER_IP} "sudo chown -R www-data:www-data /var/www/html && sudo find /var/www/html/ -type d -exec chmod 755 {} \; && sudo find /var/www/html/ -type f -exec chmod 644 {} \; && sudo systemctl restart nginx"

echo "Deployment complete! The frontend is now live at http://${SERVER_IP}"
