import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import { BsEye, BsSearch, BsCalendar } from 'react-icons/bs';
import api from '../../services/api';

const ShipmentList = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  
  // 필터링 상태
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    Promise.all([
      loadShipments(),
      loadWarehouses()
    ]);
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedWarehouse) params.warehouse_id = selectedWarehouse;
      if (selectedStatus) params.status = selectedStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/shipments', { params });
      setShipments(response.data);
    } catch (error) {
      console.error('출고 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('창고 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const handleFilter = () => {
    loadShipments();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case '배송준비중':
        return <Badge bg="primary">배송준비중</Badge>;
      case '배송중':
        return <Badge bg="warning">배송중</Badge>;
      case '배송완료':
        return <Badge bg="success">배송완료</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>출고 관리</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>창고</Form.Label>
                  <Form.Select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                  >
                    <option value="">모든 창고</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>출고 상태</Form.Label>
                  <Form.Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">모든 상태</option>
                    <option value="배송준비중">배송준비중</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
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
              <th>ID</th>
              <th>주문번호</th>
              <th>창고</th>
              <th>출고일</th>
              <th>배송업체</th>
              <th>송장번호</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length > 0 ? (
              shipments.map(shipment => (
                <tr key={shipment.id}>
                  <td>{shipment.id}</td>
                  <td>{shipment.Order?.order_number || '-'}</td>
                  <td>{shipment.Warehouse?.name || '-'}</td>
                  <td>{new Date(shipment.shipment_date).toLocaleDateString()}</td>
                  <td>{shipment.carrier || '-'}</td>
                  <td>{shipment.tracking_number || '-'}</td>
                  <td>{getStatusBadge(shipment.status)}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/shipments/${shipment.id}`)}
                    >
                      <BsEye />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">출고 정보가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ShipmentList;