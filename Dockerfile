# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Stage 2: Run
FROM node:18-alpine

WORKDIR /app

# Copy only built files and node_modules from build stage
COPY --from=build /app /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port your app runs on
EXPOSE 10000

# Add healthcheck (optional, if your app has /health endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/health', res => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the app
CMD ["npm", "start"]
