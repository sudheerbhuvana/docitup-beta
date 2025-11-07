# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application source
COPY . .

# Expose port
EXPOSE 5001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/index.js"]

