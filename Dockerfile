# Simple Node.js deployment for Next.js
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["dumb-init", "npm", "start"]