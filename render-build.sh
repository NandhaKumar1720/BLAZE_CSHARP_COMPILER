#!/bin/bash

# Install dependencies for Node.js and .NET SDK
echo "Installing dependencies..."

# Install .NET SDK
apt-get update
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
apt-get update
apt-get install -y apt-transport-https
apt-get install -y dotnet-sdk-6.0

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
