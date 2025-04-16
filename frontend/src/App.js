import React, { useState } from 'react';
import { 
  Routes, 
  Route, 
  Link,
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useNavigate
} from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import WarehouseManagement from './pages/WarehouseManagement';
import InventoryManagement from './pages/InventoryManagement';
import OrderManagement from './pages/OrderManagement';
import ShipmentManagement from './pages/ShipmentManagement';
import './App.css';

const { Header, Content, Sider } = Layout;

// 임시 사용자 정보
const userInfo = {
  name: '관리자',
  role: '시스템 관리자'
};

// 사용자 메뉴 항목
const userMenuItems = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: (
      <span>
        {userInfo.name} ({userInfo.role})
      </span>
    )
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '로그아웃',
    onClick: () => {
      console.log('로그아웃');
    }
  }
];

// 메인 메뉴 항목
const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '대시보드',
    component: <Dashboard />
  },
  {
    key: 'products',
    icon: <ShoppingOutlined />,
    label: '상품 관리',
    component: <ProductManagement />
  },
  {
    key: 'warehouses',
    icon: <ShopOutlined />,
    label: '창고 관리',
    component: <WarehouseManagement />
  },
  {
    key: 'inventory',
    icon: <InboxOutlined />,
    label: '재고 관리',
    component: <InventoryManagement />
  },
  {
    key: 'orders',
    icon: <ShoppingCartOutlined />,
    label: '주문 관리',
    component: <OrderManagement />
  },
  {
    key: 'shipments',
    icon: <TruckOutlined />,
    label: '출고 관리',
    component: <ShipmentManagement />
  }
];

// 레이아웃 컴포넌트
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const toggleTab = (tab) => {
    setActiveTab(tab);
    navigate(tab);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 120, height: 31, background: 'rgba(0, 0, 0, 0.2)', marginRight: 24 }} />
          <h1 style={{ margin: 0, fontSize: '18px' }}>물류 관리 시스템</h1>
        </div>
        <div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{userInfo.name}</span>
            </Space>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: () => toggleTab(item.key)
            }))}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

// 라우터 설정
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />
      },
      ...menuItems.map(item => ({
        path: item.key,
        element: item.component
      }))
    ],
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;