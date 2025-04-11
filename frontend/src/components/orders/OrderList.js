import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import { BsPlusCircle, BsEye, BsSearch, BsCalendar } from 'react-icons/bs';
import api from '../../services/api';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  
  // 필터링 상태
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    Promise.all([
      loadOrders(),
      loadCustomers(),
      loadOrderStatuses()
    ]);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedCustomer) params.customer_id = selectedCustomer;
      if (selectedStatus) params.status_id = selectedStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/orders', { params });
      setOrders(response.data);
    } catch (error) {
      console.error('주문 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('고객 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const loadOrderStatuses = async () => {
    try {
      const response = await api.get('/orders/statuses');
      setOrderStatuses(response.data);
    } catch (error) {
      console.error('주문 상태 목록을 불러오는데 실패했습니다:', error);
      // 기본 주문 상태 값 설정
      setOrderStatuses([
        { id: 1, name: '접수됨' },
        { id: 2, name: '결제완료' },
        { id: 3, name: '포장완료' },
        { id: 4, name: '배송중' },
        { id: 5, name: '배송완료' },
        { id: 6, name: '취소' }
      ]);
    }
  };

  const handleFilter = () => {
    loadOrders();
  };

  const getStatusBadge = (statusId) => {
    switch (statusId) {
      case 1:
        return <Badge bg="secondary">접수됨</Badge>;
      case 2:
        return <Badge bg="info">결제완료</Badge>;
      case 3:
        return <Badge bg="primary">포장완료</Badge>;
      case 4:
        return <Badge bg="warning">배송중</Badge>;
      case 5:
        return <Badge bg="success">배송완료</Badge>;
      case 6:
        return <Badge bg="danger">취소</Badge>;
      default:
        return <Badge bg="secondary">알 수 없음</Badge>;
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>주문 관리</h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/orders/new')}
          >
            <BsPlusCircle className="me-2" />
            주문 등록
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>고객</Form.Label>
                  <Form.Select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">모든 고객</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>주문 상태</Form.Label>
                  <Form.Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">모든 상태</option>
                    {orderStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>시작일</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsCalendar />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>종료일</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsCalendar />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end mb-3">
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={handleFilter}
                >
                  <BsSearch className="me-2" />
                  검색
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>주문번호</th>
              <th>고객명</th>
              <th>주문일</th>
              <th>배송지</th>
              <th>상태</th>
              <th>총액</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.Customer?.name || '-'}</td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>{order.shipping_address}</td>
                  <td>{order.status ? getStatusBadge(order.status_id) : '-'}</td>
                  <td>{order.total_amount.toLocaleString()} 원</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <BsEye />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">주문 정보가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderList;