# 2. For Nginx setup
FROM mirror.gcr.io/library/node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
  npm ci --prefer-offline --no-audit

COPY . .

# Build the application
RUN npm run build

FROM nginx:alpine

# Copy nginx config first
COPY ngnix.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage (Vite builds to 'dist' by default)
COPY --from=builder /app/dist .

# Create empty .env file (entrypoint script handles missing/empty .env gracefully)
# Environment variables can be provided via:
#   1. Docker -e flags: docker run -e VAR=value ...
#   2. Docker Compose env_file or environment section
#   3. Mounting a .env file as volume: -v /path/to/.env:/usr/share/nginx/html/.env
# The entrypoint script prioritizes Docker env vars over .env file values
RUN touch .env

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

ENTRYPOINT ["/docker-entrypoint.sh"]

