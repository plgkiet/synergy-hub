# STAGE 1: Build the React App
# Use a specific node version to ensure stability
FROM mirror.gcr.io/library/node:22-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
# 'npm ci' is faster and more reliable than 'npm install' for CI/CD
RUN npm ci 

# Copy the rest of the source code
COPY . .

# Build the project (creates the 'dist' or 'build' folder)
RUN npm run build

# STAGE 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output from the builder stage
# Note: Vite uses 'dist', Create-React-App uses 'build'. Check your folder!
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Internal container port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]