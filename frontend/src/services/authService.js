import api from './api';

// 테스트 사용자 데이터
const TEST_USER = {
  username: 'test',
  password: 'test',
  id: 999,
  name: '테스트 사용자',
  email: 'test@example.com',
  isAdmin: true
};

export const authService = {
  login: async (username, password) => {
    try {
      // 테스트 계정 확인
      if (username === TEST_USER.username && password === TEST_USER.password) {
        // 테스트 계정 로그인 성공
        console.log('테스트 계정으로 로그인 성공');
        return {
          token: `test-auth-token-${Date.now()}`,
          user: {
            id: TEST_USER.id,
            username: TEST_USER.username,
            name: TEST_USER.name,
            email: TEST_USER.email,
            isAdmin: TEST_USER.isAdmin
          }
        };
      }
      
      // 실제 API 로그인 시도
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      // 서버 연결 오류 시 테스트 계정 확인
      if (!error.response && (username === TEST_USER.username && password === TEST_USER.password)) {
        console.log('서버 연결 실패, 테스트 계정으로 로그인');
        return {
          token: `test-auth-token-${Date.now()}`,
          user: {
            id: TEST_USER.id,
            username: TEST_USER.username,
            name: TEST_USER.name,
            email: TEST_USER.email,
            isAdmin: TEST_USER.isAdmin
          }
        };
      }
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      // 테스트 사용자 확인
      const token = localStorage.getItem('token');
      if (token && token.startsWith('test-auth-token-')) {
        return {
          id: TEST_USER.id,
          username: TEST_USER.username,
          name: TEST_USER.name,
          email: TEST_USER.email,
          isAdmin: TEST_USER.isAdmin
        };
      }
      
      // 실제 API 요청
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      // 서버 연결 오류시 테스트 토큰 확인
      const token = localStorage.getItem('token');
      if (!error.response && token && token.startsWith('test-auth-token-')) {
        return {
          id: TEST_USER.id,
          username: TEST_USER.username,
          name: TEST_USER.name,
          email: TEST_USER.email,
          isAdmin: TEST_USER.isAdmin
        };
      }
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // 테스트 데이터 생성 함수 추가
  generateTestData: () => {
    // 기본 테스트 데이터 생성
    const products = [
      { id: 1, name: '스마트폰 케이스', sku: 'CASE-001', price: 15000, weight: 0.1, dimensions: '7x15x1 cm', description: '고급 실리콘 재질의 스마트폰 보호 케이스' },
      { id: 2, name: '블루투스 이어폰', sku: 'AUDIO-001', price: 89000, weight: 0.2, dimensions: '5x5x3 cm', description: '고음질 무선 블루투스 이어폰' },
      { id: 3, name: '노트북 파우치', sku: 'BAG-001', price: 32000, weight: 0.3, dimensions: '35x25x3 cm', description: '방수 기능을 갖춘 13인치 노트북 파우치' }
    ];
    
    const warehouses = [
      { id: 1, name: '서울 중앙 물류센터', location: '서울', address: '서울시 강서구 마곡동 123-45', contact_person: '박창고', contact_email: 'park@example.com', contact_phone: '02-123-4567' },
      { id: 2, name: '경기 남부 물류센터', location: '경기', address: '경기도 용인시 처인구 포곡읍 456-78', contact_person: '김창고', contact_email: 'kim@example.com', contact_phone: '031-234-5678' }
    ];
    
    // 로컬 데이터 저장
    api.setLocalData('products', products);
    api.setLocalData('warehouses', warehouses);
    
    return { products, warehouses };
  }
};