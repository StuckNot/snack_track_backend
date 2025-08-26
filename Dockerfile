# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy rest of the application code
COPY . .

# Install curl for healthcheck (must run as root)
RUN apk add --no-cache curl

# Create and use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose application port
EXPOSE 5000

# Healthcheck (Render uses this to auto-restart if unhealthy)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the server
CMD ["npm", "start"]
