# Use official Node.js image as base
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy remaining project files
COPY . .

# Expose default port (matches fallback in index.js)
EXPOSE 4000

# Start the application using the defined start script
CMD ["npm", "start"]