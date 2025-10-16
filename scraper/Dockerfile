# Use the official Node.js 20 image.
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Build the typescript code
RUN npm run build

# Run the web service on container startup.
CMD ["npm", "start"]
