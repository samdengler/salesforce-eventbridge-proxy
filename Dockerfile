FROM node:8-alpine

WORKDIR /usr/app

COPY index.js .
COPY package.json .

RUN npm i --quiet
RUN npm i pm2 -g --quiet

CMD ["pm2-runtime", "index.js"]
