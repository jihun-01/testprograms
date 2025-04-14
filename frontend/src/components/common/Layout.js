import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './Header';
import Sidebar from './Sidebar';
import './assets/styles/layout.css';
import { authService } from '../../services/authService';
import { productService } from '../../services/productService';

const Layout = () => {
  // 로그인 상태 확인
  const isAuthenticated = localStorage.getItem('token');
  
  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      // 필요한 초기 데이터 로드
      try {
        // 테스트 데이터 초기화
        authService.generateTestData && authService.generateTestData();
        productService.resetTestData && productService.resetTestData();
      } catch (error) {
        console.warn('초기 데이터 로드 중 오류:', error);
      }
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="layout-container">
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">
          <Container fluid className="px-4 py-3">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
};

export default Layout;