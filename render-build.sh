#!/bin/bash

# Install dependencies for Mono and Node.js
echo "Installing dependencies..."

# Install Mono (mcs compiler)
apt-get update
apt-get install -y mono-mcs build-essential

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
