import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Button } from 'antd';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';
import { ShoppingCartOutlined, ShopOutlined, InboxOutlined, TruckOutlined } from '@ant-design/icons';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    totalOrders: 0,
    pendingShipments: 0,
    lowStockItems: 0
  });
  const [orderData, setOrderData] = useState({
    labels: [],
    datasets: []
  });
  const [inventoryData, setInventoryData] = useState({
    labels: [],
    datasets: []
  });
  const [warehouseData, setWarehouseData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 통계 데이터 가져오기
      const [
        productsRes,
        warehousesRes,
        ordersRes,
        shipmentsRes,
        inventoryRes,
        orderStatsRes,
        warehouseStatsRes,
        inventoryStatsRes
      ] = await Promise.all([
        api.get('/products'),
        api.get('/warehouses'),
        api.get('/orders'),
        api.get('/shipments?status=배송준비중'),
        api.get('/inventory?low_stock=true'),
        api.get('/orders/stats'),
        api.get('/warehouses/stats'),
        api.get('/inventory/stats')
      ]);

      // 통계 데이터 설정 (기본값 추가)
      setStats({
        totalProducts: productsRes?.data?.length || 0,
        totalWarehouses: warehousesRes?.data?.length || 0,
        totalOrders: ordersRes?.data?.length || 0,
        pendingShipments: shipmentsRes?.data?.length || 0,
        lowStockItems: inventoryRes?.data?.length || 0
      });

      // 주문 차트 데이터 설정
      const orderStats = orderStatsRes?.data || [];
      setOrderData({
        labels: orderStats.map(item => item.month),
        datasets: [
          {
            label: '주문 수',
            data: orderStats.map(item => item.count),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: '매출액 (만원)',
            data: orderStats.map(item => item.revenue / 10000),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          }
        ]
      });

      // 창고별 재고 데이터
      const warehouseStats = warehouseStatsRes?.data || [];
      setWarehouseData({
        labels: warehouseStats.map(item => item.name),
        datasets: [
          {
            label: '재고 항목 수',
            data: warehouseStats.map(item => item.itemCount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderWidth: 1,
          }
        ]
      });

      // 재고 상태 데이터
      const inventoryStats = inventoryStatsRes?.data || { normal: 0, low: 0, excess: 0 };
      setInventoryData({
        labels: ['적정 재고', '부족 재고', '과잉 재고'],
        datasets: [
          {
            data: [
              inventoryStats.normal || 0,
              inventoryStats.low || 0,
              inventoryStats.excess || 0
            ],
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 206, 86, 0.6)'
            ],
            borderWidth: 1,
          }
        ]
      });

    } catch (error) {
      console.error('대시보드 데이터를 불러오는데 실패했습니다:', error);
      setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      // 기본 데이터 설정
      setStats({
        totalProducts: 0,
        totalWarehouses: 0,
        totalOrders: 0,
        pendingShipments: 0,
        lowStockItems: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large">
          <div style={{ padding: '50px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px' }}>
            데이터를 불러오는 중...
          </div>
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>오류 발생</h2>
        <p>{error}</p>
        <Button onClick={fetchDashboardData}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div>
      <h1>대시보드</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 주문 수"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 창고 수"
              value={stats.totalWarehouses}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 재고 수"
              value={stats.totalProducts}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="배송 준비중"
              value={stats.pendingShipments}
              prefix={<TruckOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={16}>
          <Card title="월별 주문 및 매출 추이">
            <Line
              data={orderData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="재고 상태">
            <Pie
              data={inventoryData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                }
              }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="창고별 재고 현황">
            <Bar
              data={warehouseData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;