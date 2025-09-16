FROM node:18-alpine AS builder

WORKDIR /app

# copy deps first
COPY package*.json ./
RUN npm ci --omit=dev

# then copy source
COPY . .

# build
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]