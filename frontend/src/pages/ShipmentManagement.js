import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Spin, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

const mockShipments = [
  {
    id: 1,
    tracking_number: 'TRK-001',
    Order: { order_number: 'ORD-001', Customer: { name: '고객1' } },
    Warehouse: { name: '서울 중앙 물류센터' },
    status: '배송준비중',
    created_at: '2024-03-15'
  },
  {
    id: 2,
    tracking_number: 'TRK-002',
    Order: { order_number: 'ORD-002', Customer: { name: '고객2' } },
    Warehouse: { name: '경기 남부 물류센터' },
    status: '배송중',
    created_at: '2024-03-16'
  },
  {
    id: 3,
    tracking_number: 'TRK-003',
    Order: { order_number: 'ORD-003', Customer: { name: '고객3' } },
    Warehouse: { name: '부산 해운대 물류센터' },
    status: '배송완료',
    created_at: '2024-03-17'
  }
];

const ShipmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [shipments, setShipments] = useState([]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shipments');
      
      // 응답 데이터 검증 및 가공
      let processedData;
      if (Array.isArray(response)) {
        processedData = response;
      } else if (Array.isArray(response?.data)) {
        processedData = response.data;
      } else {
        console.warn('API 응답이 예상과 다릅니다. 임시 데이터를 사용합니다.');
        processedData = mockShipments;
      }

      // 데이터 정제
      const cleanData = processedData.map(item => ({
        id: item?.id || 0,
        tracking_number: item?.tracking_number || '-',
        order_number: item?.Order?.order_number || '-',
        customer_name: item?.Order?.Customer?.name || '-',
        warehouse_name: item?.Warehouse?.name || '-',
        status: item?.status || '알 수 없음',
        created_at: item?.created_at ? new Date(item.created_at).toLocaleDateString() : '-'
      }));

      setShipments(cleanData);
    } catch (error) {
      console.error('출고 데이터를 불러오는데 실패했습니다:', error);
      setShipments(mockShipments.map(item => ({
        id: item.id,
        tracking_number: item.tracking_number,
        order_number: item.Order.order_number,
        customer_name: item.Order.Customer.name,
        warehouse_name: item.Warehouse.name,
        status: item.status,
        created_at: new Date(item.created_at).toLocaleDateString()
      })));
      message.warning('서버 연결 실패. 임시 데이터를 표시합니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const getStatusTag = (status) => {
    let color = 'default';
    switch (status) {
      case '배송준비중':
        color = 'blue';
        break;
      case '배송중':
        color = 'orange';
        break;
      case '배송완료':
        color = 'green';
        break;
      case '배송취소':
        color = 'red';
        break;
      default:
        color = 'default';
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const columns = [
    {
      title: '운송장 번호',
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      render: (text) => text || '-',
      sorter: (a, b) => (a.tracking_number || '').localeCompare(b.tracking_number || ''),
    },
    {
      title: '주문 번호',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => text || '-',
      sorter: (a, b) => (a.order_number || '').localeCompare(b.order_number || ''),
    },
    {
      title: '고객명',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (text) => text || '-',
      sorter: (a, b) => (a.customer_name || '').localeCompare(b.customer_name || ''),
    },
    {
      title: '창고',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
      render: (text) => text || '-',
      sorter: (a, b) => (a.warehouse_name || '').localeCompare(b.warehouse_name || ''),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: '생성일',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => text || '-',
      sorter: (a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateA - dateB;
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
            onClick={() => message.info(`출고 ${record.tracking_number} 수정 기능 준비 중입니다.`)}
          />
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => message.info(`출고 ${record.tracking_number} 삭제 기능 준비 중입니다.`)}
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
        <h1 style={{ margin: 0 }}>출고 관리</h1>
        <Button 
          type="primary" 
          onClick={() => message.info('출고 추가 기능 준비 중입니다.')}
        >
          출고 추가
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={shipments} 
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

export default ShipmentManagement; 