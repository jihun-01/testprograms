import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal } from 'react-bootstrap';
import { BsArrowLeft, BsTruck, BsXCircle } from 'react-icons/bs';
import api from '../../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // 모달 상태
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  // 출고 정보
  const [warehouses, setWarehouses] = useState([]);
  const [shipmentData, setShipmentData] = useState({
    warehouse_id: '',
    tracking_number: '',
    carrier: ''
  });

  useEffect(() => {
    Promise.all([
      fetchOrder(),
      loadOrderStatuses(),
      loadWarehouses()
    ]);
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
      setSelectedStatus(response.data.status_id.toString());
    } catch (error) {
      console.error('주문 정보를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
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

  const loadWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
      
      // 첫 번째 창고를 기본값으로 설정
      if (response.data.length > 0) {
        setShipmentData(prev => ({
          ...prev,
          warehouse_id: response.data[0].id
        }));
      }
    } catch (error) {
      console.error('창고 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const updateOrderStatus = async () => {
    try {
      setProcessingAction(true);
      await api.put(`/orders/${id}/status`, { status_id: parseInt(selectedStatus) });
      alert('주문 상태가 업데이트되었습니다.');
      fetchOrder();
      setShowStatusModal(false);
    } catch (error) {
      alert('주문 상태 업데이트에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingAction(false);
    }
  };

  const cancelOrder = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/orders/${id}/cancel`);
      alert('주문이 취소되었습니다.');
      fetchOrder();
      setShowCancelModal(false);
    } catch (error) {
      alert('주문 취소에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingAction(false);
    }
  };

  const createShipment = async () => {
    try {
      setProcessingAction(true);
      await api.post('/shipments', {
        order_id: id,
        warehouse_id: shipmentData.warehouse_id,
        tracking_number: shipmentData.tracking_number || null,
        carrier: shipmentData.carrier || null
      });
      alert('출고 정보가 등록되었습니다.');
      fetchOrder();
      setShowShipmentModal(false);
    } catch (error) {
      alert('출고 등록에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingAction(false);
    }
  };

  const handleShipmentInputChange = (e) => {
    const { name, value } = e.target;
    setShipmentData(prev => ({
      ...prev,
      [name]: value
    }));
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

  if (!order) {
    return (
      <Container>
        <div className="text-center my-5">
          <p>주문 정보를 찾을 수 없습니다.</p>
          <Button variant="primary" onClick={() => navigate('/orders')}>
            주문 목록으로 돌아가기
          </Button>
        </div>
      </Container>
    );
  }

  // 주문 취소 버튼 표시 여부 (배송중 또는 배송완료 상태가 아닌 경우에만)
  const canCancel = order.status_id !== 4 && order.status_id !== 5 && order.status_id !== 6;
  
  // 출고 등록 버튼 표시 여부 (결제완료 상태이고 아직 출고가 없는 경우)
  const canCreateShipment = order.status_id === 2 && (!order.Shipments || order.Shipments.length === 0);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>주문 상세 정보</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2" 
            onClick={() => navigate('/orders')}
          >
            <BsArrowLeft className="me-2" />
            목록으로
          </Button>
          
          {canCreateShipment && (
            <Button 
              variant="success" 
              className="me-2"
              onClick={() => setShowShipmentModal(true)}
            >
              <BsTruck className="me-2" />
              출고 등록
            </Button>
          )}
          
          <Button 
            variant="primary" 
            className="me-2"
            onClick={() => setShowStatusModal(true)}
            disabled={order.status_id === 6} // 취소된 주문은 상태 변경 불가
          >
            상태 변경
          </Button>
          
          {canCancel && (
            <Button 
              variant="danger" 
              onClick={() => setShowCancelModal(true)}
            >
              <BsXCircle className="me-2" />
              주문 취소
            </Button>
          )}
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">주문 정보</h5>
              {getStatusBadge(order.status_id)}
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">주문번호:</Col>
                <Col md={8}>{order.order_number}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">주문일시:</Col>
                <Col md={8}>{new Date(order.order_date).toLocaleString()}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">고객명:</Col>
                <Col md={8}>{order.Customer?.name || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">연락처:</Col>
                <Col md={8}>{order.Customer?.phone || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">이메일:</Col>
                <Col md={8}>{order.Customer?.email || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">배송지:</Col>
                <Col md={8}>{order.shipping_address}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">총 금액:</Col>
                <Col md={8}>{order.total_amount.toLocaleString()} 원</Col>
              </Row>
              {order.notes && (
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">주문 메모:</Col>
                  <Col md={8}>{order.notes}</Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">주문 상품</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>상품명</th>
                    <th>SKU</th>
                    <th>수량</th>
                    <th>단가</th>
                    <th>창고</th>
                    <th>합계</th>
                  </tr>
                </thead>
                <tbody>
                  {order.OrderDetails && order.OrderDetails.length > 0 ? (
                    order.OrderDetails.map((detail, index) => (
                      <tr key={index}>
                        <td>{detail.Product?.name || '-'}</td>
                        <td>{detail.Product?.sku || '-'}</td>
                        <td>{detail.quantity}</td>
                        <td>{detail.unit_price.toLocaleString()} 원</td>
                        <td>{detail.Warehouse?.name || '-'}</td>
                        <td>{(detail.quantity * detail.unit_price).toLocaleString()} 원</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">주문 상품 정보가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">출고 정보</h5>
            </Card.Header>
            <Card.Body>
              {order.Shipments && order.Shipments.length > 0 ? (
                order.Shipments.map((shipment, index) => (
                  <div key={index} className="mb-3">
                    <p><strong>출고 번호:</strong> {shipment.id}</p>
                    <p><strong>창고:</strong> {shipment.Warehouse?.name || '-'}</p>
                    <p><strong>출고일:</strong> {new Date(shipment.shipment_date).toLocaleString()}</p>
                    <p><strong>배송 업체:</strong> {shipment.carrier || '-'}</p>
                    <p><strong>송장 번호:</strong> {shipment.tracking_number || '-'}</p>
                    <p><strong>상태:</strong> <Badge bg={shipment.status === '배송완료' ? 'success' : (shipment.status === '배송중' ? 'warning' : 'primary')}>{shipment.status}</Badge></p>
                    
                    {index < order.Shipments.length - 1 && <hr />}
                  </div>
                ))
              ) : (
                <p className="text-center">등록된 출고 정보가 없습니다.</p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">주문 타임라인</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                {order.created_at && (
                  <div className="timeline-item">
                    <div className="timeline-date">{new Date(order.created_at).toLocaleString()}</div>
                    <div className="timeline-content">
                      <Badge bg="secondary">접수됨</Badge>
                      <p>주문이 접수되었습니다.</p>
                    </div>
                  </div>
                )}
                
                {order.status_id >= 2 && (
                  <div className="timeline-item">
                    <div className="timeline-date">{new Date(order.updated_at).toLocaleString()}</div>
                    <div className="timeline-content">
                      <Badge bg="info">결제완료</Badge>
                      <p>결제가 완료되었습니다.</p>
                    </div>
                  </div>
                )}
                
                {order.status_id >= 3 && (
                  <div className="timeline-item">
                    <div className="timeline-date">{new Date(order.updated_at).toLocaleString()}</div>
                    <div className="timeline-content">
                      <Badge bg="primary">포장완료</Badge>
                      <p>상품 포장이 완료되었습니다.</p>
                    </div>
                  </div>
                )}
                
                {order.status_id >= 4 && (
                  <div className="timeline-item">
                    <div className="timeline-date">{new Date(order.updated_at).toLocaleString()}</div>
                    <div className="timeline-content">
                      <Badge bg="warning">배송중</Badge>
                      <p>상품이 배송중입니다.</p>
                    </div>
                  </div>
                )}
                
                {order.status_id === 5 && (
                  <div className="timeline-item">
                    <div className="timeline-date">{new Date(order.updated_at).toLocaleString()}</div>
                    <div className="timeline-content">
                      <Badge bg="success">배송완료</Badge>
                      <p>배송이 완료되었습니다.</p>
                    </div>
                  </div>
                )}
                
                {order.status_id === 6 && (
                  <div className="timeline-item">
                    <div className="timeline-date">{new Date(order.updated_at).toLocaleString()}</div>
                    <div className="timeline-content">
                      <Badge bg="danger">취소</Badge>
                      <p>주문이 취소되었습니다.</p>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 상태 변경 모달 */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>주문 상태 변경</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>새 상태 선택</Form.Label>
              <Form.Select value={selectedStatus} onChange={handleStatusChange}>
                {orderStatuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={updateOrderStatus} disabled={processingAction}>
            {processingAction ? '처리 중...' : '변경'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 주문 취소 모달 */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>주문 취소</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
          <p>주문번호: {order.order_number}</p>
          <p>고객명: {order.Customer?.name || '-'}</p>
          <p>총 금액: {order.total_amount.toLocaleString()} 원</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            닫기
          </Button>
          <Button variant="danger" onClick={cancelOrder} disabled={processingAction}>
            {processingAction ? '처리 중...' : '주문 취소'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 출고 등록 모달 */}
      <Modal show={showShipmentModal} onHide={() => setShowShipmentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>출고 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>창고 선택</Form.Label>
              <Form.Select
                name="warehouse_id"
                value={shipmentData.warehouse_id}
                onChange={handleShipmentInputChange}
              >
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.location})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>배송 업체</Form.Label>
              <Form.Control
                type="text"
                name="carrier"
                value={shipmentData.carrier}
                onChange={handleShipmentInputChange}
                placeholder="예: CJ대한통운"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>송장 번호</Form.Label>
              <Form.Control
                type="text"
                name="tracking_number"
                value={shipmentData.tracking_number}
                onChange={handleShipmentInputChange}
                placeholder="예: 123456789012"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShipmentModal(false)}>
            취소
          </Button>
          <Button 
            variant="primary" 
            onClick={createShipment} 
            disabled={processingAction || !shipmentData.warehouse_id}
          >
            {processingAction ? '처리 중...' : '출고 등록'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderDetail;