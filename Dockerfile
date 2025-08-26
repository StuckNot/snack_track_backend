# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy rest of the application
COPY . .

# Expose app port
EXPOSE 5000

# Run the server
CMD ["npm", "start"]
