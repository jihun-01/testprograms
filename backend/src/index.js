require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { setupPrometheusMetrics } = require('./utils/metrics');
const errorHandler = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const customerRoutes = require('./routes/customerRoutes');

// 데이터베이스 연결
const { connectToDatabase } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 8080;

// 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

// Prometheus 메트릭 설정
setupPrometheusMetrics(app);

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/customers', customerRoutes);

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// 서버 시작
async function startServer() {
  try {
    await connectToDatabase();
    console.log('Database connected successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// 프로세스 종료 처리
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  process.exit(0);
});

module.exports = app;