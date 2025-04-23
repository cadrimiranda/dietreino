FROM node:18-alpine AS development

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and NestJS CLI globally
RUN npm install
RUN npm install -g @nestjs/cli

# Copy source code
COPY . .

# Generate GraphQL schema
RUN npm run build

# For production build
FROM node:18-alpine AS production

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built application from development stage
COPY --from=development /app/dist ./dist

# Command to run the application
CMD ["node", "dist/main"]