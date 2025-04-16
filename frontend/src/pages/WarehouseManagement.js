import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);

  // 임시 창고 데이터
  const mockWarehouses = [
    { id: 1, name: '서울 창고', location: '서울시 강남구', capacity: 1000, current_usage: 500 },
    { id: 2, name: '부산 창고', location: '부산시 해운대구', capacity: 2000, current_usage: 800 },
    { id: 3, name: '인천 창고', location: '인천시 남동구', capacity: 1500, current_usage: 1200 }
  ];

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = warehouses.filter(warehouse => 
        warehouse.name.toLowerCase().includes(searchText.toLowerCase()) ||
        warehouse.location.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredWarehouses(filtered);
    } else {
      setFilteredWarehouses(warehouses);
    }
  }, [searchText, warehouses]);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      const data = Array.isArray(response) ? response : (response.data || []);
      setWarehouses(data);
    } catch (error) {
      console.error('창고 데이터를 불러오는데 실패했습니다:', error);
      setWarehouses(mockWarehouses);
    } finally {
      setLoading(false);
    }
  };

  const formatCapacity = (capacity) => {
    try {
      if (capacity === null || capacity === undefined) return '0';
      return capacity.toLocaleString();
    } catch (error) {
      console.error('용량 포맷팅 중 오류 발생:', error);
      return '0';
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
      title: '창고명',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '위치',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => a.location.localeCompare(b.location),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="위치 검색"
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
      onFilter: (value, record) => record.location.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '총 용량',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => `${formatCapacity(capacity)}개`,
      sorter: (a, b) => (a.capacity || 0) - (b.capacity || 0),
    },
    {
      title: '현재 사용량',
      dataIndex: 'current_usage',
      key: 'current_usage',
      render: (usage) => `${formatCapacity(usage)}개`,
      sorter: (a, b) => (a.current_usage || 0) - (b.current_usage || 0),
    },
    {
      title: '사용률',
      key: 'usage_rate',
      render: (_, record) => {
        const rate = record.capacity ? Math.round((record.current_usage / record.capacity) * 100) : 0;
        return `${rate}%`;
      },
      sorter: (a, b) => {
        const rateA = a.capacity ? (a.current_usage / a.capacity) : 0;
        const rateB = b.capacity ? (b.current_usage / b.capacity) : 0;
        return rateA - rateB;
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
        <h2>창고 관리</h2>
        <Space>
          <Input
            placeholder="창고명 또는 위치로 검색"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            창고 추가
          </Button>
        </Space>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredWarehouses}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
};

export default WarehouseManagement; 