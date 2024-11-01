FROM node:18.19.1-bullseye-slim

ENV NODE_ENV development

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y procps

RUN npm install

COPY . /usr/src/app

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]