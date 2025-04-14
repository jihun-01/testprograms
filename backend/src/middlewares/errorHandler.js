const { metrics } = require('../../utils/metrics');

// 에러 처리 미들웨어
const errorHandler = (err, req, res, next) => {
  // 에러 로깅
  console.error('Error:', err);
  
  // 에러 유형에 따른 응답
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    // Sequelize 유효성 검증 에러
    return res.status(400).json({
      message: '입력 데이터가 유효하지 않습니다.',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  if (err.name === 'SequelizeDatabaseError') {
    // 데이터베이스 에러
    return res.status(500).json({
      message: '데이터베이스 오류가 발생했습니다.',
    });
  }
  
  // 에러 메트릭 기록
  metrics.httpRequestCounter.inc({
    method: req.method,
    endpoint: req.path,
    status_code: 500
  });
  
  // 기본 서버 에러 응답
  return res.status(500).json({
    message: '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;