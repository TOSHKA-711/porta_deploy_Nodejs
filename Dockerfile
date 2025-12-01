# Use Node official image
FROM node:20-slim

# Install Python3 & Git
RUN apt-get update && apt-get install -y python3 python3-pip git && apt-get clean

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of project files
COPY . .

# Expose port your app listens to
EXPOSE 4000

# Command to run your app
CMD ["npm", "start"]
