import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6} className="text-center">
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">페이지를 찾을 수 없습니다</h2>
          <p className="lead mb-5">
            요청하신 페이지가 삭제되었거나, 이름이 변경되었거나, 일시적으로 사용할 수 없습니다.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            홈으로 돌아가기
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;