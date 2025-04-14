import api from './api';

// 로컬 상품 데이터
const localProducts = [
  { 
    id: 1, 
    name: '스마트폰 케이스', 
    sku: 'CASE-001', 
    price: 15000, 
    weight: 0.1, 
    dimensions: '7x15x1 cm', 
    description: '고급 실리콘 재질의 스마트폰 보호 케이스',
    created_at: new Date().toISOString()
  },
  { 
    id: 2, 
    name: '블루투스 이어폰', 
    sku: 'AUDIO-001', 
    price: 89000, 
    weight: 0.2, 
    dimensions: '5x5x3 cm', 
    description: '고음질 무선 블루투스 이어폰',
    created_at: new Date().toISOString()
  },
  { 
    id: 3, 
    name: '노트북 파우치', 
    sku: 'BAG-001', 
    price: 32000, 
    weight: 0.3, 
    dimensions: '35x25x3 cm', 
    description: '방수 기능을 갖춘 13인치 노트북 파우치',
    created_at: new Date().toISOString()
  },
  { 
    id: 4, 
    name: '보조배터리', 
    sku: 'BATT-001', 
    price: 45000, 
    weight: 0.25, 
    dimensions: '10x6x2 cm', 
    description: '10000mAh 고용량 보조배터리',
    created_at: new Date().toISOString()
  },
  { 
    id: 5, 
    name: '무선 충전기', 
    sku: 'CHRG-001', 
    price: 28000, 
    weight: 0.15, 
    dimensions: '10x10x1 cm', 
    description: '고속 무선 충전 패드',
    created_at: new Date().toISOString()
  }
];

// 로컬 제품 저장소
let products = [...localProducts];

export const productService = {
  getAll: async (params = {}) => {
    try {
      // 서버로 요청 시도
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.warn('상품 정보를 서버에서 가져오지 못했습니다. 로컬 데이터를 사용합니다.', error);
      
      // 검색 파라미터 적용
      let filteredProducts = [...products];
      
      if (params.search) {
        const search = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(search) || 
          product.sku.toLowerCase().includes(search) || 
          (product.description && product.description.toLowerCase().includes(search))
        );
      }
      
      if (params.minPrice) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= parseFloat(params.minPrice)
        );
      }
      
      if (params.maxPrice) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= parseFloat(params.maxPrice)
        );
      }
      
      return filteredProducts;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`상품 ID ${id}를 서버에서 가져오지 못했습니다. 로컬 데이터를 사용합니다.`, error);
      const product = products.find(p => p.id === parseInt(id));
      
      if (!product) {
        throw { response: { status: 404, data: { message: '상품을 찾을 수 없습니다.' } } };
      }
      
      return product;
    }
  },
  
  create: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.warn('상품 생성을 서버에 요청하지 못했습니다. 로컬에서 생성합니다.', error);
      
      // SKU 중복 확인
      const existingSku = products.find(p => p.sku === productData.sku);
      if (existingSku) {
        throw { response: { status: 400, data: { message: '이미 존재하는 SKU입니다.' } } };
      }
      
      // 새 상품 생성
      const newProduct = {
        ...productData,
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 로컬 저장소에 추가
      products.push(newProduct);
      
      return newProduct;
    }
  },
  
  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.warn(`상품 ID ${id} 업데이트를 서버에 요청하지 못했습니다. 로컬에서 업데이트합니다.`, error);
      
      // 상품 존재 확인
      const index = products.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        throw { response: { status: 404, data: { message: '상품을 찾을 수 없습니다.' } } };
      }
      
      // 상품 업데이트
      const updatedProduct = {
        ...products[index],
        ...productData,
        id: parseInt(id), // ID 보존
        sku: products[index].sku, // SKU는 변경 불가
        updated_at: new Date().toISOString()
      };
      
      products[index] = updatedProduct;
      
      return updatedProduct;
    }
  },
  
  remove: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`상품 ID ${id} 삭제를 서버에 요청하지 못했습니다. 로컬에서 삭제합니다.`, error);
      
      // 상품 존재 확인
      const index = products.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        throw { response: { status: 404, data: { message: '상품을 찾을 수 없습니다.' } } };
      }
      
      // 상품 삭제
      products.splice(index, 1);
      
      return { message: '상품이 삭제되었습니다.' };
    }
  },
  
  // 테스트 데이터 재설정
  resetTestData: () => {
    products = [...localProducts];
    return products;
  }
};