# Use Node.js LTS version
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the app
COPY . .

# Create uploads folder (for prescriptions)
RUN mkdir -p uploads

# Expose port
EXPOSE 5001

# Start the service
CMD ["node", "src/index.js"]
