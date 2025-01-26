#!/bin/bash

# Install dependencies for Node.js and .NET SDK
echo "Installing dependencies..."

# Install .NET SDK
apt-get update
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
apt-get install -y apt-transport-https
apt-get install -y dotnet-sdk-6.0
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Node.js and npm are required but not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt-get install -y nodejs
fi
# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."
# Run the server
echo "Starting the server..."
npm start
