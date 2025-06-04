FROM node:16-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .  
EXPOSE 3000
CMD ["node", "src/index.js"]
