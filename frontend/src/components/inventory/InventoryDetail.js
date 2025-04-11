import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { BsPencil, BsArrowLeft } from 'react-icons/bs';
import api from '../../services/api';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, [id]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/inventory/${id}`);
      setInventory(response.data);
    } catch (error) {
      console.error('재고 정보를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity <= item.min_stock_level) {
      return { variant: 'danger', text: '부족 재고' };
    } else if (item.max_stock_level && item.quantity >= item.max_stock_level) {
      return { variant: 'warning', text: '과잉 재고' };
    } else {
      return { variant: 'success', text: '적정 재고' };
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

  if (!inventory) {
    return (
      <Container>
        <div className="text-center my-5">
          <p>재고 정보를 찾을 수 없습니다.</p>
          <Button variant="primary" onClick={() => navigate('/inventory')}>
            재고 목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  const stockStatus = getStockStatus(inventory);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>재고 상세 정보</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2" 
            onClick={() => navigate('/inventory')}
          >
            <BsArrowLeft className="me-2" />
            목록으로
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate(`/inventory/${id}/edit`)}
          >
            <BsPencil className="me-2" />
            수정
          </Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">재고 기본 정보</h5>
              <Badge bg={stockStatus.variant}>{stockStatus.text}</Badge>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">상품명:</Col>
                <Col md={8}>{inventory.Product?.name || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">SKU:</Col>
                <Col md={8}>{inventory.Product?.sku || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">창고:</Col>
                <Col md={8}>{inventory.Warehouse?.name || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">창고 위치:</Col>
                <Col md={8}>{inventory.Warehouse?.location || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">창고 내 위치:</Col>
                <Col md={8}>{inventory.location_in_warehouse || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">현재 수량:</Col>
                <Col md={8}>{inventory.quantity}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">최소 재고량:</Col>
                <Col md={8}>{inventory.min_stock_level}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">최대 재고량:</Col>
                <Col md={8}>{inventory.max_stock_level || '-'}</Col>
              </Row>
              <Row>
                <Col md={4} className="fw-bold">마지막 입고일:</Col>
                <Col md={8}>
                  {inventory.last_restock_date 
                    ? new Date(inventory.last_restock_date).toLocaleString() 
                    : '입고 기록 없음'}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">상품 정보</h5>
            </Card.Header>
            <Card.Body>
              {inventory.Product ? (
                <>
                  <div className="mb-3">
                    <strong>상품명:</strong> {inventory.Product.name}
                  </div>
                  <div className="mb-3">
                    <strong>SKU:</strong> {inventory.Product.sku}
                  </div>
                  <div className="mb-3">
                    <strong>가격:</strong> {inventory.Product.price.toLocaleString()} 원
                  </div>
                  {inventory.Product.weight && (
                    <div className="mb-3">
                      <strong>무게:</strong> {inventory.Product.weight} kg
                    </div>
                  )}
                  {inventory.Product.dimensions && (
                    <div className="mb-3">
                      <strong>치수:</strong> {inventory.Product.dimensions}
                    </div>
                  )}
                  <div className="d-grid mt-4">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => navigate(`/products/${inventory.Product.id}`)}
                    >
                      상품 상세 정보 보기
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-center">상품 정보를 불러올 수 없습니다.</p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">창고 정보</h5>
            </Card.Header>
            <Card.Body>
              {inventory.Warehouse ? (
                <>
                  <div className="mb-3">
                    <strong>창고명:</strong> {inventory.Warehouse.name}
                  </div>
                  <div className="mb-3">
                    <strong>위치:</strong> {inventory.Warehouse.location}
                  </div>
                  <div className="mb-3">
                    <strong>주소:</strong> {inventory.Warehouse.address}
                  </div>
                  {inventory.Warehouse.contact_person && (
                    <div className="mb-3">
                      <strong>담당자:</strong> {inventory.Warehouse.contact_person}
                    </div>
                  )}
                  {inventory.Warehouse.contact_phone && (
                    <div className="mb-3">
                      <strong>연락처:</strong> {inventory.Warehouse.contact_phone}
                    </div>
                  )}
                  <div className="d-grid mt-4">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => navigate(`/warehouses/${inventory.Warehouse.id}`)}
                    >
                      창고 상세 정보 보기
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-center">창고 정보를 불러올 수 없습니다.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InventoryDetail;