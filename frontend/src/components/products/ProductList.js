import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { BsPlusCircle, BsSearch, BsPencil, BsTrash } from 'react-icons/bs';
import { fetchProducts, deleteProduct } from '../../redux/actions/productActions';

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector(state => state.products);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const params = {};
    if (search) params.search = search;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    
    dispatch(fetchProducts(params));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('이 상품을 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteProduct(id));
        alert('상품이 삭제되었습니다.');
      } catch (error) {
        alert('상품 삭제에 실패했습니다: ' + error.message);
      }
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>상품 관리</h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/products/new')}
          >
            <BsPlusCircle className="me-2" />
            상품 등록
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="상품명, SKU 검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text>최소 가격</InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="최소 가격"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text>최대 가격</InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="최대 가격"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={2}>
                <Button variant="outline-primary" type="submit" className="w-100">
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
              <th>상품명</th>
              <th>SKU</th>
              <th>가격</th>
              <th>무게</th>
              <th>치수</th>
              <th>등록일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.price.toLocaleString()} 원</td>
                  <td>{product.weight ? `${product.weight} kg` : '-'}</td>
                  <td>{product.dimensions || '-'}</td>
                  <td>{new Date(product.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      <BsPencil />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">등록된 상품이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ProductList;