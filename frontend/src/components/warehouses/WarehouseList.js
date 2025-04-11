import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { BsPlusCircle, BsSearch, BsPencil, BsTrash, BsBoxSeam } from 'react-icons/bs';
import api from '../../services/api';

const WarehouseList = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      
      const response = await api.get('/warehouses', { params });
      setWarehouses(response.data);
    } catch (error) {
      console.error('창고 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadWarehouses();
  };

  const handleDelete = async (id) => {
    if (window.confirm('이 창고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await api.delete(`/warehouses/${id}`);
        alert('창고가 삭제되었습니다.');
        loadWarehouses();
      } catch (error) {
        alert('창고 삭제에 실패했습니다: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>창고 관리</h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => navigate('/warehouses/new')}
          >
            <BsPlusCircle className="me-2" />
            창고 등록
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={10}>
                <InputGroup>
                  <InputGroup.Text>
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="창고명, 위치 검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
              <th>창고명</th>
              <th>위치</th>
              <th>주소</th>
              <th>담당자</th>
              <th>연락처</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.length > 0 ? (
              warehouses.map(warehouse => (
                <tr key={warehouse.id}>
                  <td>{warehouse.id}</td>
                  <td>{warehouse.name}</td>
                  <td>{warehouse.location}</td>
                  <td>{warehouse.address}</td>
                  <td>{warehouse.contact_person || '-'}</td>
                  <td>{warehouse.contact_phone || '-'}</td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/warehouses/${warehouse.id}`)}
                    >
                      <BsBoxSeam />
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/warehouses/${warehouse.id}/edit`)}
                    >
                      <BsPencil />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(warehouse.id)}
                    >
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">등록된 창고가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default WarehouseList;