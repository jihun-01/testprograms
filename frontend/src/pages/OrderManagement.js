import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';

const mockOrders = [
  { 
    id: 1, 
    order_number: 'ORD-001',
    Customer: { name: '고객1' },
    order_date: '2024-03-15',
    status_id: 1,
    total_amount: 150000
  },
  { 
    id: 2, 
    order_number: 'ORD-002',
    Customer: { name: '고객2' },
    order_date: '2024-03-16',
    status_id: 2,
    total_amount: 250000
  },
  { 
    id: 3, 
    order_number: 'ORD-003',
    Customer: { name: '고객3' },
    order_date: '2024-03-17',
    status_id: 3,
    total_amount: 350000
  }
];

const OrderManagement = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = orders.filter(order => 
        order.order_number.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchText, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      
      // 응답 데이터 검증 및 가공
      let processedData;
      if (Array.isArray(response)) {
        processedData = response;
      } else if (Array.isArray(response?.data)) {
        processedData = response.data;
      } else {
        console.warn('API 응답이 예상과 다릅니다. 임시 데이터를 사용합니다.');
        processedData = mockOrders;
      }

      // 데이터 정제
      const cleanData = processedData.map(item => ({
        id: item?.id || 0,
        order_number: item?.order_number || '-',
        customer_name: item?.Customer?.name || '-',
        order_date: item?.order_date ? new Date(item.order_date).toLocaleDateString() : '-',
        status: getStatusText(item?.status_id),
        total_amount: item?.total_amount ? parseFloat(item.total_amount) : 0
      }));

      setOrders(cleanData);
    } catch (error) {
      console.error('주문 데이터를 불러오는데 실패했습니다:', error);
      setOrders(mockOrders.map(item => ({
        id: item.id,
        order_number: item.order_number,
        customer_name: item.Customer.name,
        order_date: new Date(item.order_date).toLocaleDateString(),
        status: getStatusText(item.status_id),
        total_amount: item.total_amount
      })));
      message.warning('서버 연결 실패. 임시 데이터를 표시합니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1: return '접수됨';
      case 2: return '결제완료';
      case 3: return '포장완료';
      case 4: return '배송중';
      case 5: return '배송완료';
      case 6: return '취소';
      default: return '알 수 없음';
    }
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0원';
    }
    try {
      return `${value.toLocaleString('ko-KR')}원`;
    } catch (error) {
      console.error('금액 포맷팅 오류:', error);
      return `${value}원`;
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
      title: '주문 번호',
      dataIndex: 'order_number',
      key: 'order_number',
      sorter: (a, b) => a.order_number.localeCompare(b.order_number),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="주문 번호 검색"
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
      onFilter: (value, record) => record.order_number.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '고객명',
      dataIndex: 'customer_name',
      key: 'customer_name',
      sorter: (a, b) => a.customer_name.localeCompare(b.customer_name),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="고객명 검색"
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
      onFilter: (value, record) => record.customer_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '주문일',
      dataIndex: 'order_date',
      key: 'order_date',
      sorter: (a, b) => {
        const dateA = a.order_date ? new Date(a.order_date) : new Date(0);
        const dateB = b.order_date ? new Date(b.order_date) : new Date(0);
        return dateA - dateB;
      },
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusText(status),
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: '총 금액',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => formatAmount(amount),
      sorter: (a, b) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => message.info(`주문 ${record.order_number} 수정 기능 준비 중입니다.`)}
          />
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => message.info(`주문 ${record.order_number} 삭제 기능 준비 중입니다.`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px' 
      }}>
        <h1 style={{ margin: 0 }}>주문 관리</h1>
        <Space>
          <Input
            placeholder="주문 번호 또는 고객명으로 검색"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => message.info('주문 추가 기능 준비 중입니다.')}
          >
            주문 추가
          </Button>
        </Space>
      </div>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개 항목`
          }}
        />
      </Spin>
    </div>
  );
};

export default OrderManagement; 