const winston = require('winston');
const morgan = require('morgan');
const { format, transports } = winston;

// Winston 로거 설정
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'logistics-api' },
  transports: [
    // 콘솔 출력
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message} ${info.stack ? '\n' + info.stack : ''}`
        )
      )
    }),
    // 파일 로깅 (운영 환경에서만)
    ...(process.env.NODE_ENV === 'production' 
      ? [
          new transports.File({ filename: 'logs/error.log', level: 'error' }),
          new transports.File({ filename: 'logs/combined.log' })
        ] 
      : [])
  ]
});

// 요청 로깅 미들웨어
const requestLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    stream: {
      write: message => logger.http(message.trim())
    }
  }
);

// 로그 레벨별 함수들
const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

const logError = (message, error = null, meta = {}) => {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`, { ...meta, stack: error.stack });
  } else {
    logger.error(message, meta);
  }
};

const logWarning = (message, meta = {}) => {
  logger.warn(message, meta);
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

module.exports = {
  requestLogger,
  logInfo,
  logError,
  logWarning,
  logDebug
};