FROM node:18.19.1-bullseye-slim

ENV NODE_ENV development

WORKDIR /usr/src/app

COPY package*.json ./

COPY . /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

RUN npm install -g @nestjs/cli

RUN npm ci --only=production

RUN npx prisma generate

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

CMD ["dumb-init", "npm", "run", "start:dev"]