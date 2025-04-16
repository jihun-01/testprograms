// 데이터베이스 관련 설정
module.exports = {
  username: process.env.DB_USER || 'logistics_user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'logistics_db',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
};