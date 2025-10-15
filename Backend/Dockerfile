FROM node:22-alpine

# Creating a working directory
WORKDIR /usr/src/app

# Copying package.json and package-lock.json
COPY package*.json ./

# Installing dependencies
RUN npm install

# Copy the App source code
COPY . .

# Exposing the port the app runs on
EXPOSE 3000

# Starting the app
CMD ["node", "server.js"]