// 서버 관련 설정
module.exports = {
    port: process.env.PORT || 3000,
    
    // CORS 설정
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://logistics.example.com' 
        : ['http://localhost:3000', 'http://localhost:8080'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    
    // JWT 설정
    jwt: {
      secret: process.env.JWT_SECRET || 'default_jwt_secret_key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    
    // 로깅 설정
    logging: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: process.env.NODE_ENV === 'production' ? 'json' : 'dev'
    }
  };