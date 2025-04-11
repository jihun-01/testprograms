import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

// 유효성 검증 스키마
const warehouseSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, '창고명은 2자 이상이어야 합니다.')
    .max(255, '창고명은 255자 이하여야 합니다.')
    .required('창고명은 필수 입력 항목입니다.'),
  location: Yup.string()
    .max(255, '위치는 255자 이하여야 합니다.')
    .required('위치는 필수 입력 항목입니다.'),
  address: Yup.string()
    .required('주소는 필수 입력 항목입니다.'),
  contact_person: Yup.string()
    .max(100, '담당자 이름은 최대 100자까지 입력 가능합니다.')
    .nullable(),
  contact_email: Yup.string()
    .email('유효한 이메일 주소를 입력해주세요.')
    .max(100, '이메일은 최대 100자까지 입력 가능합니다.')
    .nullable(),
  contact_phone: Yup.string()
    .max(20, '전화번호는 최대 20자까지 입력 가능합니다.')
    .nullable()
});

const WarehouseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      fetchWarehouse();
    }
  }, [id]);

  const fetchWarehouse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/warehouses/${id}`);
      setWarehouse(response.data);
    } catch (error) {
      console.error('창고 정보를 불러오는데 실패했습니다:', error);
      navigate('/warehouses');
    } finally {
      setLoading(false);
    }
  };

  const initialValues = isEditMode && warehouse
    ? {
        name: warehouse.name || '',
        location: warehouse.location || '',
        address: warehouse.address || '',
        contact_person: warehouse.contact_person || '',
        contact_email: warehouse.contact_email || '',
        contact_phone: warehouse.contact_phone || ''
      }
    : {
        name: '',
        location: '',
        address: '',
        contact_person: '',
        contact_email: '',
        contact_phone: ''
      };

  const handleSubmit = async (values, { setErrors }) => {
    try {
      setSubmitting(true);
      
      if (isEditMode) {
        await api.put(`/warehouses/${id}`, values);
        alert('창고 정보가 수정되었습니다.');
      } else {
        await api.post('/warehouses', values);
        alert('창고가 등록되었습니다.');
      }
      
      navigate('/warehouses');
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
          <h2>{isEditMode ? '창고 정보 수정' : '창고 등록'}</h2>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={warehouseSchema}
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
                      <Form.Label>창고명 *</Form.Label>
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
                      <Form.Label>위치 *</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={values.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.location && errors.location}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.location}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>주소 *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.address && errors.address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>담당자</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_person"
                        value={values.contact_person}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.contact_person && errors.contact_person}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contact_person}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>이메일</Form.Label>
                      <Form.Control
                        type="email"
                        name="contact_email"
                        value={values.contact_email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.contact_email && errors.contact_email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contact_email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>전화번호</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_phone"
                        value={values.contact_phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.contact_phone && errors.contact_phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contact_phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/warehouses')}
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

export default WarehouseForm;