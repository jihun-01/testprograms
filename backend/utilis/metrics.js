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
    
    // 응답이 완료되면 메트릭 기록
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const path = req.route ? req.route.path : req.path;
      
      // HTTP 요청 메트릭 기록
      httpRequestCounter.inc({
        method: req.method,
        endpoint: path,
        status_code: res.statusCode
      });
      
      httpRequestDuration.observe(
        {
          method: req.method,
          endpoint: path,
          status_code: res.statusCode
        },
        duration
      );
    });
    
    next();
  });
  
  // Prometheus 메트릭 엔드포인트
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
}

// 데이터베이스 쿼리 측정 함수
function measureDbQuery(operation, table, queryFn) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await queryFn(...args);
      
      // 데이터베이스 쿼리 메트릭 기록
      dbQueryCounter.inc({ operation, table });
      dbQueryDuration.observe(
        { operation, table },
        (Date.now() - start) / 1000
      );
      
      return result;
    } catch (error) {
      dbQueryCounter.inc({ operation, table });
      dbQueryDuration.observe(
        { operation, table },
        (Date.now() - start) / 1000
      );
      throw error;
    }
  };
}

module.exports = {
  register,
  setupPrometheusMetrics,
  measureDbQuery,
  metrics: {
    httpRequestCounter,
    httpRequestDuration,
    dbQueryCounter,
    dbQueryDuration
  }
};