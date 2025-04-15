const { Sequelize } = require('sequelize');

// 환경 변수에서 데이터베이스 설정 로드
const DB_HOST = process.env.DB_HOST || 'mysql';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'logistics_db';
const DB_USER = process.env.DB_USER || 'logistics_user';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV !== 'production'
});

// 데이터베이스 연결 함수
async function connectToDatabase(retries = 5, delay = 5000) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // 개발 환경에서만 모델 동기화
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync();
        console.log('All models were synchronized successfully.');
      }
      return;
    } catch (error) {
      lastError = error;
      console.error(`Database connection attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt < retries) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to connect to database after ${retries} attempts: ${lastError.message}`);
}

module.exports = {
  sequelize,
  connectToDatabase
};