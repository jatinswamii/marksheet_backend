FROM node:18.12.0

WORKDIR /app

COPY  package.json /app/package.json 

RUN npm install

CMD npm run db && npm run build && npm run start
