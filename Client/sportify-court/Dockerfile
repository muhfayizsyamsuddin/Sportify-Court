FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL=http://localhost:3000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy konfigurasi nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80