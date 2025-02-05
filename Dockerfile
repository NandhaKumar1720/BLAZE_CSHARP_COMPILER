# Use official Node.js image
FROM node:18 AS build-env
WORKDIR /app

# Install Mono (mcs compiler)
RUN apt-get update && apt-get install -y mono-mcs

# Copy Node.js files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the app port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
