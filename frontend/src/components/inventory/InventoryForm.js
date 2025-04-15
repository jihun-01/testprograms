import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

// 유효성 검증 스키마
const inventorySchema = Yup.object().shape({
  product_id: Yup.number()
    .required('상품을 선택해주세요.'),
  warehouse_id: Yup.number()
    .required('창고를 선택해주세요.'),
  quantity: Yup.number()
    .min(0, '재고량은 0 이상이어야 합니다.')
    .required('재고량은 필수 입력 항목입니다.'),
  min_stock_level: Yup.number()
    .min(0, '최소 재고량은 0 이상이어야 합니다.')
    .required('최소 재고량은 필수 입력 항목입니다.'),
  max_stock_level: Yup.number()
    .nullable()
    .min(0, '최대 재고량은 0 이상이어야 합니다.')
    .test(
      'is-greater-than-min',
      '최대 재고량은 최소 재고량보다 커야 합니다.',
      function(value) {
        const { min_stock_level } = this.parent;
        return !value || value > min_stock_level;
      }
    ),
  location_in_warehouse: Yup.string()
    .max(50, '창고 내 위치는 최대 50자까지 입력 가능합니다.')
    .nullable()
});

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = Boolean(id);

  useEffect(() => {
    Promise.all([
      loadWarehouses(),
      loadProducts(),
      isEditMode ? fetchInventory() : Promise.resolve()
    ]).finally(() => setLoading(false));
  }, [id]);

  const fetchInventory = async () => {
    try {
      const response = await api.get(`/inventory/${id}`);
      setInventory(response.data);
    } catch (error) {
      console.error('재고 정보를 불러오는데 실패했습니다:', error);
      navigate('/inventory');
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

  const initialValues = isEditMode && inventory
    ? {
        product_id: inventory.product_id || '',
        warehouse_id: inventory.warehouse_id || '',
        quantity: inventory.quantity || 0,
        min_stock_level: inventory.min_stock_level || 0,
        max_stock_level: inventory.max_stock_level || '',
        location_in_warehouse: inventory.location_in_warehouse || ''
      }
    : {
        product_id: '',
        warehouse_id: '',
        quantity: 0,
        min_stock_level: 0,
        max_stock_level: '',
        location_in_warehouse: ''
      };

  const handleSubmit = async (values, { setErrors }) => {
  try {
    setSubmitting(true);
    
    // 데이터 형변환 추가
    const formattedValues = {
      ...values,
      product_id: parseInt(values.product_id, 10),
      warehouse_id: parseInt(values.warehouse_id, 10),
      quantity: parseInt(values.quantity, 10),
      min_stock_level: parseInt(values.min_stock_level, 10),
      max_stock_level: values.max_stock_level ? parseInt(values.max_stock_level, 10) : null,
      location_in_warehouse: values.location_in_warehouse || null
    };
    
    if (isEditMode) {
      await api.put(`/inventory/${id}`, formattedValues);
      alert('재고 정보가 수정되었습니다.');
    } else {
      await api.post('/inventory', formattedValues);
      alert('재고가 등록되었습니다.');
    }
    
    navigate('/inventory');
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.errors) {
        // 서버 측 유효성 검증 오류 처리
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
      } else if (error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('오류가 발생했습니다.');
      }
    } else {
      alert('오류가 발생했습니다.');
    }
  } finally {
    setSubmitting(false);
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
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>{isEditMode ? '재고 정보 수정' : '재고 등록'}</h2>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={inventorySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting
            }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>상품 *</Form.Label>
                      <Form.Select
                        name="product_id"
                        value={values.product_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.product_id && errors.product_id}
                        disabled={isEditMode} // 수정 시 상품 변경 불가
                      >
                        <option value="">상품 선택</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.product_id}
                      </Form.Control.Feedback>
                      {isEditMode && (
                        <Form.Text className="text-muted">
                          재고 수정 시 상품은 변경할 수 없습니다.
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>창고 *</Form.Label>
                      <Form.Select
                        name="warehouse_id"
                        value={values.warehouse_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.warehouse_id && errors.warehouse_id}
                        disabled={isEditMode} // 수정 시 창고 변경 불가
                      >
                        <option value="">창고 선택</option>
                        {warehouses.map(warehouse => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.location})
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.warehouse_id}
                      </Form.Control.Feedback>
                      {isEditMode && (
                        <Form.Text className="text-muted">
                          재고 수정 시 창고는 변경할 수 없습니다.
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>수량 *</Form.Label>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={values.quantity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.quantity && errors.quantity}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.quantity}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>최소 재고량 *</Form.Label>
                      <Form.Control
                        type="number"
                        name="min_stock_level"
                        value={values.min_stock_level}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.min_stock_level && errors.min_stock_level}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.min_stock_level}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        이 수준 이하로 떨어지면 부족 재고로 표시됩니다.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>최대 재고량</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_stock_level"
                        value={values.max_stock_level}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.max_stock_level && errors.max_stock_level}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.max_stock_level}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        이 수준 이상이면 과잉 재고로 표시됩니다.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>창고 내 위치</Form.Label>
                  <Form.Control
                    type="text"
                    name="location_in_warehouse"
                    value={values.location_in_warehouse}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.location_in_warehouse && errors.location_in_warehouse}
                    placeholder="예: A-1-2 (구역-선반-칸)"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location_in_warehouse}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/inventory')}
                    disabled={submitting}
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        저장 중...
                      </>
                    ) : (
                      '저장'
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InventoryForm;