# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine

# Use existing 'node' user (UID 1000) instead of creating new one
USER node
ENV HOME=/home/node
WORKDIR $HOME/app

# Install 'serve' globally in user space
# Need to adjust PATH for global modules installed by non-root user
ENV NPM_CONFIG_PREFIX=$HOME/.npm-global
ENV PATH=$HOME/.npm-global/bin:$PATH

RUN npm install -g serve

# Copy build from Stage 1
COPY --from=build --chown=node /app/build ./build

EXPOSE 7860
CMD ["serve", "-s", "build", "-l", "7860"]
