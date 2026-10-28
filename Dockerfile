# Build stage
FROM node:24.22.1-bookworm-slim AS build

WORKDIR /app
ARG VITE_GA_MEASUREMENT_ID
ARG VITE_APP_VERSION
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID
ENV VITE_APP_VERSION=$VITE_APP_VERSION
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
# Use Debian-based image for compatibility
FROM nginx/nginx-unprivileged:1.30.6-bookworm

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Validate nginx config without retaining the root-owned PID file
RUN nginx -t && rm -f /tmp/nginx.pid

# Copy built files
COPY --from=build /app/dist/ /usr/share/nginx/html/gene2phenotype/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
