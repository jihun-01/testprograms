FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Prometheus 메트릭용 포트
EXPOSE 9090

CMD ["npm", "start"]