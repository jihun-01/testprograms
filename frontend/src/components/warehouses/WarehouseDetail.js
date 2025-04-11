import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { BsPencil, BsArrowLeft } from 'react-icons/bs';
import api from '../../services/api';

const WarehouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouseData();
  }, [id]);

  const fetchWarehouseData = async () => {
    try {
      setLoading(true);
      const [warehouseRes, summaryRes] = await Promise.all([
        api.get(`/warehouses/${id}`),
        api.get(`/warehouses/${id}/inventory-summary`)
      ]);
      setWarehouse(warehouseRes.data);
      setInventorySummary(summaryRes.data);
    } catch (error) {
      console.error('창고 정보를 불러오는데 실패했습니다:', error);
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

  if (!warehouse) {
    return (
      <Container>
        <div className="text-center my-5">
          <p>창고 정보를 찾을 수 없습니다.</p>
          <Button variant="primary" onClick={() => navigate('/warehouses')}>
            창고 목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>창고 상세 정보</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2" 
            onClick={() => navigate('/warehouses')}
          >
            <BsArrowLeft className="me-2" />
            목록으로
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate(`/warehouses/${id}/edit`)}
          >
            <BsPencil className="me-2" />
            수정
          </Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">기본 정보</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="fw-bold">창고명:</Col>
                <Col md={9}>{warehouse.name}</Col>
              </Row>
              <hr />
              <Row>
                <Col md={3} className="fw-bold">위치:</Col>
                <Col md={9}>{warehouse.location}</Col>
              </Row>
              <hr />
              <Row>
                <Col md={3} className="fw-bold">주소:</Col>
                <Col md={9}>{warehouse.address}</Col>
              </Row>
              <hr />
              <Row>
                <Col md={3} className="fw-bold">담당자:</Col>
                <Col md={9}>{warehouse.contact_person || '-'}</Col>
              </Row>
              <hr />
              <Row>
                <Col md={3} className="fw-bold">이메일:</Col>
                <Col md={9}>{warehouse.contact_email || '-'}</Col>
              </Row>
              <hr />
              <Row>
                <Col md={3} className="fw-bold">전화번호:</Col>
                <Col md={9}>{warehouse.contact_phone || '-'}</Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">재고 요약</h5>
            </Card.Header>
            <Card.Body>
              {inventorySummary ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>총 품목 수:</span>
                    <h4>{inventorySummary.total_items || 0}</h4>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>총 재고량:</span>
                    <h4>{inventorySummary.total_quantity || 0}</h4>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>부족 재고 품목:</span>
                    <h4>
                      <Badge bg="danger">{inventorySummary.low_stock_items || 0}</Badge>
                    </h4>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>과잉 재고 품목:</span>
                    <h4>
                      <Badge bg="warning">{inventorySummary.over_stock_items || 0}</Badge>
                    </h4>
                  </div>
                  
                  <div className="d-grid gap-2 mt-4">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => navigate('/inventory', { state: { warehouseId: id } })}
                    >
                      재고 관리로 이동
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-center">재고 정보를 불러오는데 실패했습니다.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WarehouseDetail;