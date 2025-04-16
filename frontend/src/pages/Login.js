import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../services/authService';

const loginSchema = Yup.object().shape({
  username: Yup.string().required('사용자 이름을 입력해주세요.'),
  password: Yup.string().required('비밀번호를 입력해주세요.')
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // 이미 로그인되어 있는지 확인
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      // 하드코딩된 자격 증명 확인 (test/test)
      if (values.username === 'test' && values.password === 'test') {
        console.log("테스트 계정으로 로그인합니다...");
        // 테스트 사용자용 토큰 생성
        const mockToken = 'test-user-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('username', '테스트 사용자');
        
        // 테스트 데이터 초기화 (api.js에서 제공하는 함수)
        try {
          console.log("테스트 데이터를 초기화합니다...");
          authService.generateTestData && authService.generateTestData();
        } catch (e) {
          console.warn("테스트 데이터 초기화 중 오류:", e);
        }
        
        // 로그인 성공 후 대시보드로 이동
        navigate('/');
        return;
      }
      
      // 테스트 사용자가 아닌 경우 실제 로그인 요청
      const response = await authService.login(values.username, values.password);
      
      // 로컬 스토리지에 인증 정보 저장
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.user.name);
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
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
    <Container className="login-container d-flex align-items-center justify-content-center vh-100">
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
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
                initialValues={{ username: 'test', password: 'test' }}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;