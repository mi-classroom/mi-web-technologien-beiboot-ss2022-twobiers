FROM node:lts-alpine as builder
ENV NODE_ENV=production
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm ci --include=dev
RUN npm run build:prod


FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]