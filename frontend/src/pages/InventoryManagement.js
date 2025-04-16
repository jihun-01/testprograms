import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Spin, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);

  // 임시 재고 데이터
  const mockInventory = [
    { id: 1, product_name: '상품 1', warehouse_name: '서울 창고', quantity: 100, min_stock_level: 10, max_stock_level: 200 },
    { id: 2, product_name: '상품 2', warehouse_name: '부산 창고', quantity: 50, min_stock_level: 5, max_stock_level: 100 },
    { id: 3, product_name: '상품 3', warehouse_name: '인천 창고', quantity: 200, min_stock_level: 20, max_stock_level: 300 }
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = inventory.filter(item => 
        item.product_name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.warehouse_name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(inventory);
    }
  }, [searchText, inventory]);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      const data = Array.isArray(response) ? response : (response.data || []);
      setInventory(data);
    } catch (error) {
      console.error('재고 데이터를 불러오는데 실패했습니다:', error);
      setInventory(mockInventory);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity, min, max) => {
    if (quantity <= min) return { text: '재고 부족', color: 'red' };
    if (quantity >= max) return { text: '재고 과다', color: 'orange' };
    return { text: '정상', color: 'green' };
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
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
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
      onFilter: (value, record) => record.product_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '창고명',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
      sorter: (a, b) => a.warehouse_name.localeCompare(b.warehouse_name),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="창고명 검색"
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
      onFilter: (value, record) => record.warehouse_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '현재 재고',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: '최소 재고',
      dataIndex: 'min_stock_level',
      key: 'min_stock_level',
      sorter: (a, b) => (a.min_stock_level || 0) - (b.min_stock_level || 0),
    },
    {
      title: '최대 재고',
      dataIndex: 'max_stock_level',
      key: 'max_stock_level',
      sorter: (a, b) => (a.max_stock_level || 0) - (b.max_stock_level || 0),
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => {
        const status = getStockStatus(record.quantity, record.min_stock_level, record.max_stock_level);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
      filters: [
        { text: '정상', value: '정상' },
        { text: '재고 부족', value: '재고 부족' },
        { text: '재고 과다', value: '재고 과다' },
      ],
      onFilter: (value, record) => {
        const status = getStockStatus(record.quantity, record.min_stock_level, record.max_stock_level);
        return status.text === value;
      },
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => message.info('수정 기능은 준비 중입니다.')}
          >
            수정
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => message.info('삭제 기능은 준비 중입니다.')}
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
        <h2>재고 관리</h2>
        <Space>
          <Input
            placeholder="상품명 또는 창고명으로 검색"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            재고 추가
          </Button>
        </Space>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredInventory}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
};

export default InventoryManagement; 