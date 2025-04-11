import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
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
      
      // 통계 데이터 가져오기
      const [
        productsRes,
        warehousesRes,
        ordersRes,
        shipmentsRes,
        inventoryRes,
        orderStatsRes,
        warehouseStatsRes
      ] = await Promise.all([
        api.get('/products'),
        api.get('/warehouses'),
        api.get('/orders'),
        api.get('/shipments', { params: { status: '배송준비중' } }),
        api.get('/inventory', { params: { low_stock: true } }),
        api.get('/orders/stats'),
        api.get('/warehouses/stats')
      ]);

      // 통계 데이터 설정
      setStats({
        totalProducts: productsRes.data.length,
        totalWarehouses: warehousesRes.data.length,
        totalOrders: ordersRes.data.length,
        pendingShipments: shipmentsRes.data.length,
        lowStockItems: inventoryRes.data.length
      });

      // 주문 차트 데이터 설정
      const orderStats = orderStatsRes.data;
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
      const warehouseStats = warehouseStatsRes.data;
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
      const inventoryStats = await api.get('/inventory/stats');
      setInventoryData({
        labels: ['적정 재고', '부족 재고', '과잉 재고'],
        datasets: [
          {
            data: [
              inventoryStats.data.normal,
              inventoryStats.data.low,
              inventoryStats.data.excess
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h2 className="my-4">대시보드</h2>
      
      {/* 요약 카드 */}
      <Row className="mb-4">
        <Col md>
          <Card className="h-100 bg-primary text-white">
            <Card.Body>
              <Card.Title>전체 상품</Card.Title>
              <Card.Text className="display-4">{stats.totalProducts}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md>
          <Card className="h-100 bg-success text-white">
            <Card.Body>
              <Card.Title>전체 창고</Card.Title>
              <Card.Text className="display-4">{stats.totalWarehouses}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md>
          <Card className="h-100 bg-info text-white">
            <Card.Body>
              <Card.Title>전체 주문</Card.Title>
              <Card.Text className="display-4">{stats.totalOrders}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md>
          <Card className="h-100 bg-warning text-dark">
            <Card.Body>
              <Card.Title>배송 대기</Card.Title>
              <Card.Text className="display-4">{stats.pendingShipments}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md>
          <Card className="h-100 bg-danger text-white">
            <Card.Body>
              <Card.Title>부족 재고</Card.Title>
              <Card.Text className="display-4">{stats.lowStockItems}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* 차트 */}
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>월별 주문 및 매출 추이</Card.Header>
            <Card.Body>
              <Line
                data={orderData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>재고 상태</Card.Header>
            <Card.Body>
              <Pie
                data={inventoryData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Header>창고별 재고 현황</Card.Header>
            <Card.Body>
              <Bar
                data={warehouseData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;