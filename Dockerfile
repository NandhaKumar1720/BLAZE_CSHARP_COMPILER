# Use the official Node.js image as the base
FROM node:16

# Install necessary tools and dependencies
RUN apt-get update && apt-get install -y wget apt-transport-https software-properties-common

# Add Microsoft package signing key
RUN wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb

# Install .NET SDK and build tools
RUN apt-get update && apt-get install -y dotnet-sdk-6.0 build-essential

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
