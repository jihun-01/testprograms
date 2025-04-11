import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { 
  BsSpeedometer2,
  BsBox,
  BsBuilding,
  BsInboxes,
  BsCartCheck,
  BsTruck
} from 'react-icons/bs';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="sidebar bg-dark text-white">
      <div className="sidebar-header d-flex justify-content-center py-4">
        <h3>물류 관리</h3>
      </div>
      
      <Nav className="flex-column">
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/"
            className={`sidebar-link ${isActive('/') && !isActive('/products') && !isActive('/warehouses') && !isActive('/inventory') && !isActive('/orders') && !isActive('/shipments') ? 'active' : ''}`}
          >
            <BsSpeedometer2 className="me-2" />
            대시보드
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/products"
            className={`sidebar-link ${isActive('/products') ? 'active' : ''}`}
          >
            <BsBox className="me-2" />
            상품 관리
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/warehouses"
            className={`sidebar-link ${isActive('/warehouses') ? 'active' : ''}`}
          >
            <BsBuilding className="me-2" />
            창고 관리
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/inventory"
            className={`sidebar-link ${isActive('/inventory') ? 'active' : ''}`}
          >
            <BsInboxes className="me-2" />
            재고 관리
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/orders"
            className={`sidebar-link ${isActive('/orders') ? 'active' : ''}`}
          >
            <BsCartCheck className="me-2" />
            주문 관리
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/shipments"
            className={`sidebar-link ${isActive('/shipments') ? 'active' : ''}`}
          >
            <BsTruck className="me-2" />
            출고 관리
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;