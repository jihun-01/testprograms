import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const loginSchema = Yup.object().shape({
  username: Yup.string().required('사용자 이름을 입력해주세요.'),
  password: Yup.string().required('비밀번호를 입력해주세요.')
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // 이미 로그인되어 있는지 확인
  const isAuthenticated = localStorage.getItem('token');
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        username: values.username,
        password: values.password
      });
      
      const { token, user } = response.data;
      
      // 로컬 스토리지에 인증 정보 저장
      localStorage.setItem('token', token);
      localStorage.setItem('username', user.name);
      
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || '로그인에 실패했습니다.');
      } else {
        setError('서버 연결에 실패했습니다. 나중에 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container fluid className="login-container vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">물류 관리 시스템</h2>
                <p className="text-muted">로그인하여 시작하세요</p>
              </div>
              
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}
              
              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
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
                    <Form.Group className="mb-3">
                      <Form.Label>사용자 이름</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.username && errors.username}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>비밀번호</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            로그인 중...
                          </>
                        ) : (
                          '로그인'
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
              
              {/* 개발 환경용 안내 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 text-center text-muted small">
                  <p>개발 환경에서는 다음 계정을 사용할 수 있습니다:</p>
                  <p>사용자명: admin, 비밀번호: password</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;