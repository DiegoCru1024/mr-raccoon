FROM node:20-alpine

WORKDIR /usr/src/appRacoon

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
