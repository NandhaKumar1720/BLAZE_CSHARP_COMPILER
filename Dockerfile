# Use official .NET SDK image with Node.js
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Copy Node.js files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Pre-create the C# console project (cached during build)
RUN dotnet new console -o ConsoleApp --force

# Expose the app port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
