const jwt = require('jsonwebtoken');

// JWT 인증 미들웨어
exports.authenticate = (req, res, next) => {
  try {
    // 개발 환경에서는 인증 우회 가능
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      return next();
    }
    
    // Authorization 헤더 확인
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    
    // Bearer 토큰 형식 확인
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: '잘못된 인증 형식입니다.' });
    }
    
    const token = parts[1];
    
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 요청 객체에 사용자 정보 추가
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '인증이 만료되었습니다. 다시 로그인해주세요.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
    next(error);
  }
};

// 관리자 권한 확인 미들웨어
exports.isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
};