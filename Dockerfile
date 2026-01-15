# Stage 1: Build the React Application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (Use npm install for flexibility)
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the App
FROM node:18-alpine

WORKDIR /app

# Install 'serve' package globally to serve static files
RUN npm install -g serve

# Copy build output from Stage 1
COPY --from=build /app/build ./build

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Start the server on port 7860
CMD ["serve", "-s", "build", "-l", "7860"]