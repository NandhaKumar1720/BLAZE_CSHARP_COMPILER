#!/bin/bash

# Install dependencies for .NET and Node.js
echo "Installing dependencies..."

# Install .NET SDK
apt-get update
apt-get install -y dotnet-sdk-6.0 build-essential

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
