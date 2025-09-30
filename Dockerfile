FROM node:22-slim

# Create app directory
WORKDIR /usr/src/app

# Set yarn network timeout to avoid issues with slow connections
RUN echo "network-timeout 600000" > .yarnrc

# Install app dependencies - split this step for better layer caching
COPY package.json yarn.lock ./

# Install dependencies with caching
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy only TypeScript configuration first
COPY tsconfig.json ./

# Copy source code separately - improves caching when only source changes
COPY src/ ./src/

# Copy health check and startup scripts
COPY health-check.js start.sh ./
RUN chmod +x start.sh

# Build TypeScript code - do this BEFORE removing dev dependencies
RUN yarn build

# Remove development dependencies AFTER building
RUN yarn install --production --frozen-lockfile --network-timeout 600000

# Set environment variables
ENV NODE_ENV=production

# Expose port for health check
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the bot with health check
CMD ["/bin/sh", "./start.sh"]
