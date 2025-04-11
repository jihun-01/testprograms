import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { BsPlusCircle, BsSearch, BsPencil, BsTrash, BsEye } from 'react-icons/bs';
import api from '../../services/api';

const InventoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  
  // 필터링 상태
  const [selectedWarehouse, setSelectedWarehouse] = useState(
    location.state?.warehouseId || ''
  );
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    Promise.all([
      loadInventory(),
      loadWarehouses(),
      loadProducts()
    ]);
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedWarehouse) params.warehouse_id = selectedWarehouse;
      if (selectedProduct) params.product_id = selectedProduct;
      if (showLowStock) params.low_stock = true;
      
      const response = await api.get('/inventory', { params });
      setInventory(response.data);
    } catch (error) {
      console.error('재고 목록을 불러오는데 실패했습니다:', error);
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

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('상품 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const handleFilter = () => {
    loadInventory();
  };

  const handleDelete = async (id) => {
    if (window.confirm('이 재고 항목을 삭제하시겠습니까?')) {
      try {
        await api.delete(`/inventory/${id}`);
        alert('재고 항목이 삭제되었습니다.');
        loadInventory();
      } catch (error) {
        alert('재고 항목 삭제에 실패했습니다: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity <= item.min_stock_level) {
      return <Badge bg="danger">부족</Badge>;
    } else if (item.max_stock_level && item.quantity >= item.max_stock_level) {
      return <Badge bg="warning">과잉</Badge>;
    } else {
      return <Badge bg="success">적정</Badge>;
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>재고 관리</h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/inventory/new')}
          >
            <BsPlusCircle className="me-2" />
            재고 등록
          </Button>
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
                  <Form.Label>상품</Form.Label>
                  <Form.Select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">모든 상품</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 mt-4">
                  <Form.Check
                    type="checkbox"
                    label="부족 재고만 표시"
                    checked={showLowStock}
                    onChange={(e) => setShowLowStock(e.target.checked)}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end mb-3">
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={handleFilter}
                >
                  필터 적용
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
              <th>상품</th>
              <th>창고</th>
              <th>수량</th>
              <th>최소 재고</th>
              <th>최대 재고</th>
              <th>상태</th>
              <th>위치</th>
              <th>마지막 입고일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length > 0 ? (
              inventory.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.Product?.name || '-'}</td>
                  <td>{item.Warehouse?.name || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.min_stock_level}</td>
                  <td>{item.max_stock_level || '-'}</td>
                  <td>{getStockStatus(item)}</td>
                  <td>{item.location_in_warehouse || '-'}</td>
                  <td>{item.last_restock_date ? new Date(item.last_restock_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/inventory/${item.id}`)}
                    >
                      <BsEye />
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/inventory/${item.id}/edit`)}
                    >
                      <BsPencil />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">등록된 재고가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default InventoryList;