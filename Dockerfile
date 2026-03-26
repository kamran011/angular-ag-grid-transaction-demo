# Multi-stage Docker build:
# 1) Build the Angular app (npm ci + ng build)
# 2) Serve the compiled SPA from Nginx with client-side routing fallback

FROM node:24-alpine AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

# Remove default config and add SPA-friendly routing
RUN rm -f /etc/nginx/conf.d/default.conf && \
    printf '%s\n' \
    'server {' \
    '  listen 80;' \
    '  root /usr/share/nginx/html;' \
    '  index index.html;' \
    '  include /etc/nginx/mime.types;' \
    '  location / {' \
    '    try_files $uri $uri/ /index.html;' \
    '  }' \
    '}' \
    > /etc/nginx/conf.d/default.conf

# Copy Angular build output (application builder outputs: dist/<project>/browser)
COPY --from=builder /app/dist/angular-dashboard/browser/ /usr/share/nginx/html/

EXPOSE 80

