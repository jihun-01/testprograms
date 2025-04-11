import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, Modal } from 'react-bootstrap';
import { BsArrowLeft, BsBox, BsGeoAlt, BsTruck } from 'react-icons/bs';
import api from '../../services/api';

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 모달 상태
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    tracking_number: '',
    carrier: ''
  });
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/shipments/${id}`);
      setShipment(response.data);
      setSelectedStatus(response.data.status);
      setTrackingInfo({
        tracking_number: response.data.tracking_number || '',
        carrier: response.data.carrier || ''
      });
    } catch (error) {
      console.error('출고 정보를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleTrackingChange = (e) => {
    const { name, value } = e.target;
    setTrackingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateShipmentStatus = async () => {
    try {
      setProcessingAction(true);
      await api.put(`/shipments/${id}/status`, {
        status: selectedStatus,
        tracking_number: trackingInfo.tracking_number || undefined,
        carrier: trackingInfo.carrier || undefined
      });
      alert('출고 상태가 업데이트되었습니다.');
      fetchShipment();
      setShowStatusModal(false);
    } catch (error) {
      alert('출고 상태 업데이트에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingAction(false);
    }
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

  if (!shipment) {
    return (
      <Container>
        <div className="text-center my-5">
          <p>출고 정보를 찾을 수 없습니다.</p>
          <Button variant="primary" onClick={() => navigate('/shipments')}>
            출고 목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>출고 상세 정보</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2" 
            onClick={() => navigate('/shipments')}
          >
            <BsArrowLeft className="me-2" />
            목록으로
          </Button>
          
          <Button 
            variant="primary" 
            onClick={() => setShowStatusModal(true)}
          >
            상태 변경
          </Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">출고 정보</h5>
              {getStatusBadge(shipment.status)}
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">출고 ID:</Col>
                <Col md={8}>{shipment.id}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">주문번호:</Col>
                <Col md={8}>
                  {shipment.Order ? (
                    <Button 
                      variant="link" 
                      className="p-0"
                      onClick={() => navigate(`/orders/${shipment.order_id}`)}
                    >
                      {shipment.Order.order_number}
                    </Button>
                  ) : (
                    shipment.order_id
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">출고일시:</Col>
                <Col md={8}>{new Date(shipment.shipment_date).toLocaleString()}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">창고:</Col>
                <Col md={8}>
                  {shipment.Warehouse ? (
                    <Button 
                      variant="link" 
                      className="p-0"
                      onClick={() => navigate(`/warehouses/${shipment.warehouse_id}`)}
                    >
                      {shipment.Warehouse.name}
                    </Button>
                  ) : (
                    shipment.warehouse_id
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">배송 업체:</Col>
                <Col md={8}>{shipment.carrier || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">송장 번호:</Col>
                <Col md={8}>{shipment.tracking_number || '-'}</Col>
              </Row>
              <Row>
                <Col md={4} className="fw-bold">상태:</Col>
                <Col md={8}>{getStatusBadge(shipment.status)}</Col>
              </Row>
            </Card.Body>
          </Card>

          {shipment.Order && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">주문 정보</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">주문번호:</Col>
                  <Col md={8}>{shipment.Order.order_number}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">주문일시:</Col>
                  <Col md={8}>{new Date(shipment.Order.order_date).toLocaleString()}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">고객명:</Col>
                  <Col md={8}>{shipment.Order.Customer?.name || '-'}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">배송지:</Col>
                  <Col md={8}>{shipment.Order.shipping_address}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">주문 상태:</Col>
                  <Col md={8}>
                    {shipment.Order.status && (
                      <Badge bg={
                        shipment.Order.status_id === 5 ? 'success' :
                        shipment.Order.status_id === 4 ? 'warning' :
                        shipment.Order.status_id === 6 ? 'danger' : 'info'
                      }>
                        {shipment.Order.status.name}
                      </Badge>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col md={4} className="fw-bold">총 금액:</Col>
                  <Col md={8}>{shipment.Order.total_amount.toLocaleString()} 원</Col>
                </Row>
                
                <div className="mt-4">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate(`/orders/${shipment.order_id}`)}
                  >
                    주문 상세보기
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <BsGeoAlt className="me-2" />
                배송 정보
              </h5>
            </Card.Header>
            <Card.Body>
              {shipment.Order ? (
                <>
                  <p className="mb-3"><strong>받는 분:</strong> {shipment.Order.Customer?.name || '-'}</p>
                  <p className="mb-3"><strong>연락처:</strong> {shipment.Order.Customer?.phone || '-'}</p>
                  <p className="mb-3"><strong>배송지:</strong> {shipment.Order.shipping_address}</p>
                  
                  {shipment.carrier && (
                    <p className="mb-3"><strong>배송업체:</strong> {shipment.carrier}</p>
                  )}
                  
                  {shipment.tracking_number && (
                    <p className="mb-0"><strong>송장번호:</strong> {shipment.tracking_number}</p>
                  )}
                </>
              ) : (
                <p className="text-center">주문 정보를 불러올 수 없습니다.</p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <BsBox className="me-2" />
                창고 정보
              </h5>
            </Card.Header>
            <Card.Body>
              {shipment.Warehouse ? (
                <>
                  <p className="mb-3"><strong>창고명:</strong> {shipment.Warehouse.name}</p>
                  <p className="mb-3"><strong>위치:</strong> {shipment.Warehouse.location}</p>
                  <p className="mb-3"><strong>주소:</strong> {shipment.Warehouse.address}</p>
                  
                  {shipment.Warehouse.contact_person && (
                    <p className="mb-3"><strong>담당자:</strong> {shipment.Warehouse.contact_person}</p>
                  )}
                  
                  {shipment.Warehouse.contact_phone && (
                    <p className="mb-0"><strong>연락처:</strong> {shipment.Warehouse.contact_phone}</p>
                  )}
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => navigate(`/warehouses/${shipment.warehouse_id}`)}
                    >
                      창고 상세보기
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

      {/* 상태 변경 모달 */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>출고 상태 변경</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>배송 업체</Form.Label>
              <Form.Control
                type="text"
                name="carrier"
                value={trackingInfo.carrier}
                onChange={handleTrackingChange}
                placeholder="예: CJ대한통운"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>송장 번호</Form.Label>
              <Form.Control
                type="text"
                name="tracking_number"
                value={trackingInfo.tracking_number}
                onChange={handleTrackingChange}
                placeholder="예: 123456789012"
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>새 상태 선택</Form.Label>
              <Form.Select value={selectedStatus} onChange={handleStatusChange}>
                <option value="배송준비중">배송준비중</option>
                <option value="배송중">배송중</option>
                <option value="배송완료">배송완료</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={updateShipmentStatus} disabled={processingAction}>
            {processingAction ? '처리 중...' : '변경'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ShipmentDetail;