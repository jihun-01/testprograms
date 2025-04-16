const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool
  }
);

// 데이터베이스 연결 함수
async function connectToDatabase(retries = 5, delay = 5000) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // 개발 환경에서만 모델 동기화
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
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
  
  throw lastError;
}

module.exports = { sequelize, connectToDatabase };