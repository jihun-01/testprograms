import axios from 'axios';

// API 기본 URL 설정
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 임시 데이터
const mockData = {
  products: [
    { id: 1, name: '상품 1', price: 10000, description: '상품 설명 1' },
    { id: 2, name: '상품 2', price: 20000, description: '상품 설명 2' },
    { id: 3, name: '상품 3', price: 30000, description: '상품 설명 3' }
  ],
  warehouses: [
    { id: 1, name: '서울 창고', location: '서울시 강남구', capacity: 1000 },
    { id: 2, name: '부산 창고', location: '부산시 해운대구', capacity: 2000 }
  ],
  inventory: [
    { id: 1, product_id: 1, warehouse_id: 1, quantity: 100, min_stock_level: 10, max_stock_level: 200 },
    { id: 2, product_id: 2, warehouse_id: 1, quantity: 50, min_stock_level: 5, max_stock_level: 100 },
    { id: 3, product_id: 3, warehouse_id: 2, quantity: 200, min_stock_level: 20, max_stock_level: 300 }
  ],
  orders: [
    { id: 1, customer_name: '홍길동', status: '접수됨', order_date: '2024-04-16', total_amount: 30000 },
    { id: 2, customer_name: '김철수', status: '배송중', order_date: '2024-04-15', total_amount: 50000 }
  ],
  shipments: [
    { id: 1, order_id: 1, warehouse_name: '서울 창고', status: '배송준비중', shipment_date: '2024-04-16' },
    { id: 2, order_id: 2, warehouse_name: '부산 창고', status: '배송중', shipment_date: '2024-04-15' }
  ],
  orderStats: [
    { month: '2024-01', count: 10, revenue: 1000000 },
    { month: '2024-02', count: 15, revenue: 1500000 },
    { month: '2024-03', count: 20, revenue: 2000000 },
    { month: '2024-04', count: 25, revenue: 2500000 }
  ],
  warehouseStats: [
    { name: '서울 창고', itemCount: 150 },
    { name: '부산 창고', itemCount: 200 }
  ],
  inventoryStats: {
    normal: 200,
    low: 50,
    excess: 100
  }
};

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('인증이 필요합니다.'));
    }
    
    let errorMessage = '알 수 없는 에러가 발생했습니다.';
    if (error.response) {
      errorMessage = `서버 에러 (${error.response.status}): ${error.response.data.message || error.message}`;
    } else if (error.request) {
      errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }
    
    console.error('API 에러:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage
    });
    
    return Promise.reject(new Error(errorMessage));
  }
);

// API 요청 함수
const makeRequest = async (method, url, data = null) => {
  try {
    const response = await api({
      method,
      url,
      data,
    });
    return response;
  } catch (error) {
    console.error(`API 요청 실패 (${method.toUpperCase()} ${url}):`, error.message);
    
    // API 요청 실패 시 임시 데이터 반환
    const resource = url.split('/')[0];
    if (mockData[resource]) {
      console.log(`임시 데이터 사용: ${resource}`);
      return { data: mockData[resource] };
    }
    throw error;
  }
};

// API 메서드
export default {
  get: (url) => makeRequest('get', url),
  post: (url, data) => makeRequest('post', url, data),
  put: (url, data) => makeRequest('put', url, data),
  delete: (url) => makeRequest('delete', url)
};