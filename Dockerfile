# Frontend Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY client/package.json ./
COPY client/yarn.lock ./
RUN yarn install
COPY client/ ./
RUN yarn build

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package.json ./
COPY server/yarn.lock ./
RUN yarn install
COPY server/ ./
COPY --from=build /app/dist ./client/dist

EXPOSE 8080
CMD ["node", "index.js"]
