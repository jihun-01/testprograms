import axios from 'axios';

// API 기본 URL 설정
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// API 요청 성공/실패 여부 추적
let isBackendAvailable = true;

const api = axios.create({
  baseURL,
  timeout: 30000, // 시간 초과 30초로 늘림
  headers: {
    'Content-Type': 'application/json'
  }
});

// 서버 연결 상태 확인 함수
const checkBackendConnection = async () => {
  try {
    const response = await axios.get(`${baseURL}/health`, { timeout: 3000 });
    isBackendAvailable = response.status === 200;
    console.log('Backend connection available:', isBackendAvailable);
    return isBackendAvailable;
  } catch (error) {
    isBackendAvailable = false;
    console.warn('Backend connection unavailable, will use local data');
    return false;
  }
};

// 로컬 스토라지 데이터 스토어 구현 (백엔드 연결 문제 대비)
const localDataStore = {
  products: [],
  warehouses: [],
  inventory: [],
  orders: [],
  shipments: [],
  customers: [
    { id: 1, name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678', address: '서울시 강남구 역삼동 123-45' },
    { id: 2, name: '김철수', email: 'kim@example.com', phone: '010-8765-4321', address: '서울시 종로구 종로1가 67-89' },
    { id: 3, name: '이영희', email: 'lee@example.com', phone: '010-2345-6789', address: '부산시 해운대구 우동 456-78' },
  ],
  orderStatus: [
    { id: 1, name: '접수됨' },
    { id: 2, name: '결제완료' },
    { id: 3, name: '포장완료' },
    { id: 4, name: '배송중' },
    { id: 5, name: '배송완료' },
    { id: 6, name: '취소' }
  ]
};

// 로컬 저장소에 데이터 저장하는 함수
const saveToLocalStore = (key, data) => {
  localDataStore[key] = data;
  // 필요하면 localStorage에도 저장할 수 있음
  // localStorage.setItem(key, JSON.stringify(data));
};

// 로컬 저장소에서 데이터 로드하는 함수
const loadFromLocalStore = (key) => {
  return localDataStore[key];
};

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // 명확한 토큰 형식 검증 추가
      if (token.startsWith('test-auth-token-')) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (token.length > 10) {  // 실제 JWT 토큰은 보통 길이가 깁니다
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리 및 오프라인 모드 지원
api.interceptors.response.use(
  (response) => {
    // 성공적인 응답 처리
    if (response.config.method === 'get') {
      // URL에서 리소스 타입 추출
      const url = response.config.url;
      const resourceType = url.split('/')[1]; // 예: /products -> products
      
      if (resourceType && response.data) {
        // 데이터 저장
        saveToLocalStore(resourceType, response.data);
      }
    }
    return response;
  },
  (error) => {
    // 서버 연결 오류 또는 인증 오류 처리
    if (!error.response || error.response.status === 0) {
      console.warn('서버 연결 실패, 로컬 데이터 사용');
      
      // URL에서 리소스 타입 추출 시도
      const url = error.config.url;
      if (url) {
        const resourceType = url.split('/')[1];
        
        // 로컬 데이터 반환
        if (resourceType && localDataStore[resourceType]) {
          console.log(`로컬 ${resourceType} 데이터 사용`);
          return Promise.resolve({
            data: localDataStore[resourceType],
            status: 200,
            statusText: 'OK (Local)',
            headers: {},
            config: error.config
          });
        }
      }
    }
    
    // 인증 에러 처리 (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // 현재 URL이 로그인 페이지가 아닌 경우에만 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// 애플리케이션 초기화 시 백엔드 연결 확인
checkBackendConnection();

// API 요청 함수 (백엔드 연결 실패 시 로컬 데이터 사용)
const makeRequest = async (method, url, data = null, config = {}) => {
  try {
    if (!isBackendAvailable) {
      // 백엔드 연결 없을 때 로컬 데이터 반환
      const resourceType = url.split('/')[0];
      if (resourceType && localDataStore[resourceType]) {
        console.log(`로컬 ${resourceType} 데이터 사용`);
        return localDataStore[resourceType];
      }
    }
    
    const response = await api[method](url, data, config);
    return response.data;
  } catch (error) {
    if (!error.response || error.response.status === 0) {
      // 서버 연결 실패 시 로컬 데이터 반환
      const resourceType = url.split('/')[0];
      if (resourceType && localDataStore[resourceType]) {
        console.log(`로컬 ${resourceType} 데이터 사용`);
        return localDataStore[resourceType];
      }
    }
    throw error;
  }
};

// 향상된 API 객체
const enhancedApi = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  
  // 직접 API 요청 (로컬 데이터 폴백 포함)
  request: makeRequest,
  
  // 백엔드 연결 상태 확인
  checkConnection: checkBackendConnection,
  
  // 로컬 데이터 액세스 메서드
  getLocalData: (key) => loadFromLocalStore(key),
  setLocalData: (key, data) => saveToLocalStore(key, data),
  
  // 백엔드 상태 확인
  isBackendAvailable: () => isBackendAvailable,
  
  // 데이터베이스에서 직접 데이터 가져오기 시도
  fetchFromDb: async (endpoint) => {
    try {
      // 백엔드 연결 다시 확인
      await checkBackendConnection();
      
      if (isBackendAvailable) {
        const response = await api.get(`/${endpoint}`, { 
          headers: { 'X-Source': 'direct-db' } 
        });
        return response.data;
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.error(`Failed to fetch ${endpoint} from database:`, error);
      return loadFromLocalStore(endpoint) || [];
    }
  }
};

export default enhancedApi;