const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./utils/database');
const routes = require('./routes');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 라우터 설정
app.use('/api', routes);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// 데이터베이스 연결
connectToDatabase()
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((error) => {
    console.error('데이터베이스 연결 실패:', error);
  });

module.exports = app; 