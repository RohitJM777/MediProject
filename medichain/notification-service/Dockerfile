# Use Node.js LTS version as base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Expose port
EXPOSE 5008

# Start the server
CMD ["node", "src/server.js"]
