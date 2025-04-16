const promClient = require('prom-client');

// Prometheus 레지스트리 생성
const register = new promClient.Registry();

// 기본 메트릭 수집
promClient.collectDefaultMetrics({ register });

// HTTP 요청 카운터
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'endpoint', 'status_code']
});

// HTTP 요청 지연 시간 히스토그램
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'endpoint', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// 데이터베이스 쿼리 카운터
const dbQueryCounter = new promClient.Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table']
});

// 데이터베이스 쿼리 지연 시간 히스토그램
const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

// 메트릭 등록
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);
register.registerMetric(dbQueryCounter);
register.registerMetric(dbQueryDuration);

// Express 애플리케이션에 Prometheus 메트릭 설정
function setupPrometheusMetrics(app) {
  // 메트릭 수집 미들웨어
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      
      httpRequestCounter.inc({
        method: req.method,
        endpoint: req.path,
        status_code: res.statusCode
      });
      
      httpRequestDuration.observe({
        method: req.method,
        endpoint: req.path,
        status_code: res.statusCode
      }, duration);
    });
    
    next();
  });
  
  // 메트릭 엔드포인트
  app.get('/api/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
}

// 데이터베이스 쿼리 측정 함수
async function measureDbQuery(operation, table, queryFn) {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    
    const duration = (Date.now() - start) / 1000;
    dbQueryCounter.inc({ operation, table });
    dbQueryDuration.observe({ operation, table }, duration);
    
    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    dbQueryCounter.inc({ operation, table });
    dbQueryDuration.observe({ operation, table }, duration);
    
    throw error;
  }
}

module.exports = {
  setupPrometheusMetrics,
  measureDbQuery,
  httpRequestCounter,
  httpRequestDuration,
  dbQueryCounter,
  dbQueryDuration,
  register
};