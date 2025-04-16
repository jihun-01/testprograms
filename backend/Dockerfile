FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Prometheus 메트릭용 포트
EXPOSE 9090

# 개발 모드로 실행
CMD ["npm", "run", "dev"]