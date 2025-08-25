# Build stage for React
FROM node:18-alpine as react-build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
RUN npm install -g serve

# Copy built React app
COPY --from=react-build /app/build /app/build

# SET THE WORKING DIRECTORY - THIS IS THE FIX!
WORKDIR /app

EXPOSE 80 

# Serve on port 80 inside container ← Change to 80
CMD ["serve", "-s", "build", "-l", "80"]