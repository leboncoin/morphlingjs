FROM node:8.2.1
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY ./package.json ./
RUN npm install
RUN npm install pm2 -g --silent
COPY bin/src ./src
RUN mkdir -p /usr/app/src/data

ARG NODE_PORT=8883
ENV NODE_PORT=$NODE_PORT

EXPOSE ${NODE_PORT}
CMD ["pm2-docker", "src/server.js"]
