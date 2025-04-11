import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Table } from 'react-bootstrap';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import { BsPlus, BsTrash } from 'react-icons/bs';
import api from '../../services/api';

// 유효성 검증 스키마
const orderSchema = Yup.object().shape({
  customer_id: Yup.number()
    .required('고객을 선택해주세요.'),
  shipping_address: Yup.string()
    .required('배송지 주소는 필수 입력 항목입니다.'),
  notes: Yup.string(),
  items: Yup.array()
    .of(
      Yup.object().shape({
        product_id: Yup.number()
          .required('상품을 선택해주세요.'),
        warehouse_id: Yup.number()
          .required('창고를 선택해주세요.'),
        quantity: Yup.number()
          .min(1, '수량은 1 이상이어야 합니다.')
          .required('수량은 필수 입력 항목입니다.')
      })
    )
    .min(1, '최소 1개 이상의 상품을 추가해주세요.')
});

const OrderForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      loadCustomers(),
      loadProducts(),
      loadWarehouses(),
      loadInventories()
    ]).finally(() => setLoading(false));
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('고객 목록을 불러오는데 실패했습니다:', error);
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

  const loadWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('창고 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const loadInventories = async () => {
    try {
      const response = await api.get('/inventory');
      setInventories(response.data);
    } catch (error) {
      console.error('재고 정보를 불러오는데 실패했습니다:', error);
    }
  };

  // 상품과 창고 선택에 따른 재고 정보 가져오기
  const getInventoryInfo = (productId, warehouseId) => {
    if (!productId || !warehouseId) return null;
    
    return inventories.find(
      inv => inv.product_id === parseInt(productId) && inv.warehouse_id === parseInt(warehouseId)
    );
  };

  // 상품 정보 가져오기
  const getProductInfo = (productId) => {
    if (!productId) return null;
    return products.find(product => product.id === parseInt(productId));
  };

  // 주문 항목의 가격 계산
  const calculateItemPrice = (productId, quantity) => {
    if (!productId || !quantity) return 0;
    
    const product = getProductInfo(productId);
    if (!product) return 0;
    
    return product.price * quantity;
  };

  // 총 주문 금액 계산
  const calculateTotalAmount = (items) => {
    if (!items || items.length === 0) return 0;
    
    return items.reduce((total, item) => {
      return total + calculateItemPrice(item.product_id, item.quantity);
    }, 0);
  };

  const handleSubmit = async (values, { setErrors }) => {
    try {
      setSubmitting(true);
      
      // 재고 유효성 검증
      for (const item of values.items) {
        const inventory = getInventoryInfo(item.product_id, item.warehouse_id);
        
        if (!inventory) {
          setErrors({ 
            items: '선택한 창고에 해당 상품의 재고 정보가 없습니다.' 
          });
          setSubmitting(false);
          return;
        }
        
        if (inventory.quantity < item.quantity) {
          setErrors({ 
            items: `상품 '${getProductInfo(item.product_id)?.name}'의 재고가 부족합니다. 현재 재고: ${inventory.quantity}, 요청 수량: ${item.quantity}` 
          });
          setSubmitting(false);
          return;
        }
      }
      
      await api.post('/orders', values);
      alert('주문이 등록되었습니다.');
      navigate('/orders');
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('주문 등록에 실패했습니다.');
        }
      } else {
        alert('주문 등록에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    customer_id: '',
    shipping_address: '',
    notes: '',
    items: [
      {
        product_id: '',
        warehouse_id: '',
        quantity: 1
      }
    ]
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
          <h2>주문 등록</h2>
        </Col>
      </Row>

      <Formik
        initialValues={initialValues}
        validationSchema={orderSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue
        }) => (
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">주문 정보</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>고객 *</Form.Label>
                          <Form.Select
                            name="customer_id"
                            value={values.customer_id}
                            onChange={(e) => {
                              handleChange(e);
                              // 고객 선택 시 기본 배송지 설정
                              const selectedCustomer = customers.find(
                                c => c.id === parseInt(e.target.value)
                              );
                              if (selectedCustomer && selectedCustomer.address) {
                                setFieldValue('shipping_address', selectedCustomer.address);
                              }
                            }}
                            onBlur={handleBlur}
                            isInvalid={touched.customer_id && errors.customer_id}
                          >
                            <option value="">고객 선택</option>
                            {customers.map(customer => (
                              <option key={customer.id} value={customer.id}>
                                {customer.name} ({customer.phone || '연락처 없음'})
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.customer_id}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      {values.customer_id && (
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>고객 정보</Form.Label>
                            <div className="customer-info p-3 border rounded">
                              {(() => {
                                const customer = customers.find(
                                  c => c.id === parseInt(values.customer_id)
                                );
                                if (!customer) return null;
                                
                                return (
                                  <>
                                    <p className="mb-1"><strong>이름:</strong> {customer.name}</p>
                                    <p className="mb-1"><strong>이메일:</strong> {customer.email || '없음'}</p>
                                    <p className="mb-1"><strong>연락처:</strong> {customer.phone || '없음'}</p>
                                    <p className="mb-0"><strong>주소:</strong> {customer.address || '없음'}</p>
                                  </>
                                );
                              })()}
                            </div>
                          </Form.Group>
                        </Col>
                      )}
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>배송지 주소 *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="shipping_address"
                        value={values.shipping_address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.shipping_address && errors.shipping_address}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.shipping_address}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>주문 메모</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="배송 요청사항 등"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">주문 상품</h5>
                  </Card.Header>
                  <Card.Body>
                    <FieldArray name="items">
                      {({ remove, push }) => (
                        <>
                          <Table responsive>
                            <thead>
                              <tr>
                                <th>상품</th>
                                <th>창고</th>
                                <th>수량</th>
                                <th>재고</th>
                                <th>단가</th>
                                <th>합계</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {values.items.map((item, index) => {
                                const product = getProductInfo(item.product_id);
                                const inventory = getInventoryInfo(item.product_id, item.warehouse_id);
                                const itemPrice = calculateItemPrice(item.product_id, item.quantity);
                                
                                return (
                                  <tr key={index}>
                                    <td>
                                      <Form.Select
                                        name={`items.${index}.product_id`}
                                        value={item.product_id}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={
                                          touched.items?.[index]?.product_id && 
                                          errors.items?.[index]?.product_id
                                        }
                                      >
                                        <option value="">상품 선택</option>
                                        {products.map(product => (
                                          <option key={product.id} value={product.id}>
                                            {product.name} ({product.sku})
                                          </option>
                                        ))}
                                      </Form.Select>
                                    </td>
                                    <td>
                                      <Form.Select
                                        name={`items.${index}.warehouse_id`}
                                        value={item.warehouse_id}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={
                                          touched.items?.[index]?.warehouse_id && 
                                          errors.items?.[index]?.warehouse_id
                                        }
                                      >
                                        <option value="">창고 선택</option>
                                        {warehouses.map(warehouse => (
                                          <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                          </option>
                                        ))}
                                      </Form.Select>
                                    </td>
                                    <td style={{ width: '100px' }}>
                                      <Form.Control
                                        type="number"
                                        name={`items.${index}.quantity`}
                                        value={item.quantity}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        min={1}
                                        isInvalid={
                                          touched.items?.[index]?.quantity && 
                                          errors.items?.[index]?.quantity
                                        }
                                      />
                                    </td>
                                    <td>
                                      {inventory ? (
                                        <span className={inventory.quantity < item.quantity ? 'text-danger' : ''}>
                                          {inventory.quantity}
                                        </span>
                                      ) : (
                                        '재고없음'
                                      )}
                                    </td>
                                    <td>
                                      {product ? `${product.price.toLocaleString()} 원` : '-'}
                                    </td>
                                    <td>
                                      {itemPrice > 0 ? `${itemPrice.toLocaleString()} 원` : '-'}
                                    </td>
                                    <td>
                                      {values.items.length > 1 && (
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => remove(index)}
                                        >
                                          <BsTrash />
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                          
                          {typeof errors.items === 'string' && (
                            <div className="text-danger mb-3">{errors.items}</div>
                          )}

                          <div className="d-flex justify-content-between">
                            <Button
                              variant="outline-primary"
                              onClick={() => push({
                                product_id: '',
                                warehouse_id: '',
                                quantity: 1
                              })}
                            >
                              <BsPlus className="me-2" />
                              상품 추가
                            </Button>
                            
                            <h5>
                              총 금액: {calculateTotalAmount(values.items).toLocaleString()} 원
                            </h5>
                          </div>
                        </>
                      )}
                    </FieldArray>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="sticky-top" style={{ top: '20px' }}>
                  <Card.Header>
                    <h5 className="mb-0">주문 요약</h5>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>상품 종류:</strong> {values.items.length}개</p>
                    <p><strong>총 상품 수량:</strong> {values.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}개</p>
                    <p className="fs-5"><strong>총 주문 금액:</strong> {calculateTotalAmount(values.items).toLocaleString()} 원</p>
                    
                    <hr />
                    
                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        size="lg"
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            주문 처리 중...
                          </>
                        ) : (
                          '주문 등록'
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/orders')}
                        disabled={submitting}
                      >
                        취소
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default OrderForm;