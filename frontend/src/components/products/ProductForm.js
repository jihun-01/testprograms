import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { fetchProduct, createProduct, updateProduct } from '../../redux/actions/productActions';

// 유효성 검증 스키마
const productSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, '상품명은 2자 이상이어야 합니다.')
    .max(100, '상품명은 100자 이하여야 합니다.')
    .required('상품명은 필수 입력 항목입니다.'),
  sku: Yup.string()
    .matches(/^[A-Za-z0-9-]+$/, 'SKU는 영문자, 숫자, 하이픈(-)만 사용 가능합니다.')
    .max(50, 'SKU는 최대 50자까지 입력 가능합니다.')
    .required('SKU는 필수 입력 항목입니다.'),
  price: Yup.number()
    .positive('가격은 0보다 커야 합니다.')
    .required('가격은 필수 입력 항목입니다.'),
  weight: Yup.number()
    .positive('무게는 0보다 커야 합니다.')
    .nullable(),
  dimensions: Yup.string()
    .max(50, '크기는 최대 50자까지 입력 가능합니다.')
    .nullable(),
  description: Yup.string()
    .nullable()
});

const ProductForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(state => state.products);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchProduct(id));
    }
  }, [dispatch, id, isEditMode]);

  const initialValues = isEditMode && product
    ? {
        name: product.name || '',
        sku: product.sku || '',
        price: product.price || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        description: product.description || ''
      }
    : {
        name: '',
        sku: '',
        price: '',
        weight: '',
        dimensions: '',
        description: ''
      };

      const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
          setIsSubmitting(true);
          
          // 데이터 형변환 추가
          const formattedValues = {
            ...values,
            price: parseFloat(values.price),
            weight: values.weight ? parseFloat(values.weight) : null,
            dimensions: values.dimensions || null,
            description: values.description || null
          };
          
          if (isEditMode) {
            await dispatch(updateProduct(id, formattedValues));
            alert('상품이 수정되었습니다.');
          } else {
            await dispatch(createProduct(formattedValues));
            alert('상품이 등록되었습니다.');
          }
          
          navigate('/products');
        } catch (error) {
          if (error.response && error.response.data && error.response.data.errors) {
            // 서버 측 유효성 검증 오류 처리
            const serverErrors = {};
            error.response.data.errors.forEach(err => {
              serverErrors[err.field] = err.message;
            });
            setErrors(serverErrors);
          } else {
            alert(error.response?.data?.message || '오류가 발생했습니다.');
          }
        } finally {
          setIsSubmitting(false);
          setSubmitting(false);
        }
      };

  if (isEditMode && loading) {
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
          <h2>{isEditMode ? '상품 수정' : '상품 등록'}</h2>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={productSchema}
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
                      <Form.Label>상품명 *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SKU *</Form.Label>
                      <Form.Control
                        type="text"
                        name="sku"
                        value={values.sku}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.sku && errors.sku}
                        disabled={isEditMode} // SKU는 수정 불가
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.sku}
                      </Form.Control.Feedback>
                      {isEditMode && (
                        <Form.Text className="text-muted">
                          SKU는 수정할 수 없습니다.
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>가격 (원) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={values.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.price && errors.price}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>무게 (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="weight"
                        value={values.weight}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.weight && errors.weight}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.weight}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>치수</Form.Label>
                      <Form.Control
                        type="text"
                        name="dimensions"
                        value={values.dimensions}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.dimensions && errors.dimensions}
                        placeholder="예: 10x20x30 cm"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dimensions}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>상품 설명</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/products')}
                    disabled={isSubmitting}
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
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

export default ProductForm;