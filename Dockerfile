# Use a Node.js base image for building
FROM node:20-alpine AS builder

WORKDIR /app

# Install necessary packages for SWC (Speedy Web Compiler) on alpine
# This resolves "Error loading shared library ld-linux-x86-64.so.2"
RUN apk add --no-cache libc6-compat libstdc++

# Copy package.json and package-lock.json
# to install dependencies first for better caching with npm
COPY package.json package-lock.json ./

# Install dependencies using npm ci (for production builds)
RUN npm ci

# Copy the rest of your application code
COPY . .

# Build the Next.js application
# Ensure NEXTAUTH_URL is available during build if it affects build-time logic
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL} 

# This runs the Next.js build and handles the missing-suspense error
RUN npm run build

# Use a lean base image for the final production server
FROM node:20-alpine AS runner

WORKDIR /app

# Set Node.js production environment
ENV NODE_ENV=production

# Copy necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Command to run the Next.js application
CMD ["npm", "start"]
