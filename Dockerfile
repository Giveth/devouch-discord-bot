FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

# Build TypeScript code
RUN yarn build

# Remove development dependencies
RUN yarn install --production --frozen-lockfile

# Set environment variables
ENV NODE_ENV=production

# Expose port for health check
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Make sure the start script is executable
RUN chmod +x start.sh

# Run the bot with health check
CMD ["/bin/sh", "./start.sh"]
