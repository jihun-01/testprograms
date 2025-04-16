import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';

const mockProducts = [
  { id: 1, name: '상품 1', sku: 'SKU001', price: 10000, description: '상품 설명 1', category: '카테고리 1' },
  { id: 2, name: '상품 2', sku: 'SKU002', price: 20000, description: '상품 설명 2', category: '카테고리 2' },
  { id: 3, name: '상품 3', sku: 'SKU003', price: 30000, description: '상품 설명 3', category: '카테고리 3' }
];

const ProductManagement = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchText, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      
      // 응답 데이터 검증 및 가공
      let processedData;
      if (Array.isArray(response)) {
        processedData = response;
      } else if (Array.isArray(response?.data)) {
        processedData = response.data;
      } else {
        console.warn('API 응답이 예상과 다릅니다. 임시 데이터를 사용합니다.');
        processedData = mockProducts;
      }

      // 데이터 정제
      const cleanData = processedData.map(item => ({
        id: item?.id || 0,
        name: item?.name || '-',
        sku: item?.sku || '-',
        price: item?.price ? parseFloat(item.price) : 0,
        description: item?.description || '-',
        category: item?.category || '-'
      }));

      setProducts(cleanData);
    } catch (error) {
      console.error('상품 데이터를 불러오는데 실패했습니다:', error);
      setProducts(mockProducts);
      message.warning('서버 연결 실패. 임시 데이터를 표시합니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) => {
    // 가격이 없거나 유효하지 않은 경우
    if (value === null || value === undefined || isNaN(value)) {
      return '0원';
    }

    // 숫자로 변환 시도
    const price = parseFloat(value);
    if (isNaN(price)) {
      return '0원';
    }

    // 천 단위 구분자 추가
    try {
      return `${price.toLocaleString('ko-KR')}원`;
    } catch (error) {
      console.error('가격 포맷팅 오류:', error);
      return `${price}원`;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend',
    },
    {
      title: '상품명',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="상품명 검색"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              검색
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              초기화
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatPrice(price),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="설명 검색"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              검색
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              초기화
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.description.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => message.info(`상품 ${record.id} 수정 기능 준비 중입니다.`)}
          >
            수정
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => message.info(`상품 ${record.id} 삭제 기능 준비 중입니다.`)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>상품 관리</h2>
        <Space>
          <Input
            placeholder="상품명 또는 설명으로 검색"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            상품 추가
          </Button>
        </Space>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
};

export default ProductManagement; 