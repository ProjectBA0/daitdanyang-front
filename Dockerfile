# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine
# Create non-root user
RUN adduser -D -u 1000 user
USER user
ENV HOME=/home/user
WORKDIR $HOME/app

# Install 'serve' globally in user space
RUN npm install -g serve

# Copy build from Stage 1
COPY --from=build --chown=user /app/build ./build

EXPOSE 7860
CMD ["serve", "-s", "build", "-l", "7860"]
