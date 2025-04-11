import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { BsPersonCircle, BsBell } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '사용자';
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };
  
  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm py-2">
      <div className="d-flex justify-content-between align-items-center w-100 px-4">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <div className="d-flex align-items-center">
          <Dropdown align="end" className="me-3">
            <Dropdown.Toggle variant="light" id="notification-dropdown" className="border-0 position-relative">
              <BsBell size={22} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </Dropdown.Toggle>
            
            <Dropdown.Menu>
              <Dropdown.Header>알림</Dropdown.Header>
              <Dropdown.Item>
                <div className="small text-muted">15분 전</div>
                <div>재고 부족: 상품 SKU-1234</div>
              </Dropdown.Item>
              <Dropdown.Item>
                <div className="small text-muted">1시간 전</div>
                <div>신규 주문: ORD-5678</div>
              </Dropdown.Item>
              <Dropdown.Item>
                <div className="small text-muted">2시간 전</div>
                <div>배송 완료: ORD-9012</div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-center">모든 알림 보기</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="user-dropdown" className="border-0 d-flex align-items-center">
              <BsPersonCircle size={22} className="me-2" />
              <span>{username}</span>
            </Dropdown.Toggle>
            
            <Dropdown.Menu>
              <Dropdown.Item>프로필</Dropdown.Item>
              <Dropdown.Item>설정</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
};

export default Header;