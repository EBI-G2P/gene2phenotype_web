# Build stage
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_GA_MEASUREMENT_ID
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginxinc/nginx-unprivileged:stable-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/dist/ /usr/share/nginx/html/gene2phenotype/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
