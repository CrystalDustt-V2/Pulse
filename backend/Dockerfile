# Use official Node.js image as base
FROM node:20-alpine

# Set working directory in the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN apk add --no-cache openssl
RUN npm install

# Copy remaining project files
COPY . .
RUN npx prisma generate --schema=./prisma/schema.prisma

# Expose default port (matches fallback in index.js)
EXPOSE 4000

# Start the application using the defined start script
CMD ["npm", "start"]