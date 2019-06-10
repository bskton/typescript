FROM node:12.3.1-alpine

RUN apk add yarn \
&& rm -rf /var/cache/apk/*

WORKDIR /app

CMD ["yarn", "dev"]
