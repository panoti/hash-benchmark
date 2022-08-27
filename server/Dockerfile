FROM node:16-alpine3.14

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY . .

ENV NEW_RELIC_LICENSE_KEY=
ENV NEW_RELIC_APP_NAME=hash-benchmark

CMD [ "node", "app" ]
