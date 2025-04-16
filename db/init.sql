-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS logistics_db;

-- 데이터베이스 선택
USE logistics_db;

-- 테이블 생성 전 기존 테이블 삭제 (개발 환경용)
DROP TABLE IF EXISTS shipments;
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_status;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

-- 고객 테이블
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 사용자 테이블
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 창고 테이블
CREATE TABLE warehouses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  contact_person VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 상품 테이블
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  weight DECIMAL(8, 2),
  dimensions VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 재고 테이블
CREATE TABLE inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  min_stock_level INT NOT NULL DEFAULT 0,
  max_stock_level INT,
  location_in_warehouse VARCHAR(50),
  last_restock_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  UNIQUE KEY (product_id, warehouse_id)
);

-- 주문 상태 테이블
CREATE TABLE order_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

-- 주문 테이블
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shipping_address TEXT NOT NULL,
  status_id INT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (status_id) REFERENCES order_status(id)
);

-- 주문 상세 테이블
CREATE TABLE order_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- 출고 테이블
CREATE TABLE shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  shipment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- 기본 데이터 추가

-- 주문 상태 추가
INSERT INTO order_status (id, name, description) VALUES
(1, '접수됨', '주문이 접수되었습니다.'),
(2, '결제완료', '결제가 완료되었습니다.'),
(3, '포장완료', '주문 상품이 포장 완료되었습니다.'),
(4, '배송중', '주문 상품이 배송 중입니다.'),
(5, '배송완료', '주문 상품이 배송 완료되었습니다.'),
(6, '취소', '주문이 취소되었습니다.');

-- 관리자 계정 추가 (비밀번호: password)
INSERT INTO users (username, password, name, email, is_admin) VALUES
('admin', '$2a$10$HxOIDn9Ovwf8Q9OcFdYeUeb7tJf3S4aFEFTlKrM8SAVn1BRZSBsxe', '관리자', 'admin@example.com', true);

-- 샘플 고객 데이터
INSERT INTO customers (name, email, phone, address) VALUES
('홍길동', 'hong@example.com', '010-1234-5678', '서울시 강남구 역삼동 123-45'),
('김철수', 'kim@example.com', '010-8765-4321', '서울시 종로구 종로1가 67-89'),
('이영희', 'lee@example.com', '010-2345-6789', '부산시 해운대구 우동 456-78');

-- 샘플 창고 데이터
INSERT INTO warehouses (name, location, address, contact_person, contact_email, contact_phone) VALUES
('서울 중앙 물류센터', '서울', '서울시 강서구 마곡동 123-45', '박창고', 'park@example.com', '02-123-4567'),
('경기 남부 물류센터', '경기', '경기도 용인시 처인구 포곡읍 456-78', '김창고', 'kim@example.com', '031-234-5678'),
('부산 해운대 물류센터', '부산', '부산시 해운대구 우동 789-12', '최창고', 'choi@example.com', '051-345-6789');

-- 샘플 상품 데이터
INSERT INTO products (name, description, sku, price, weight, dimensions) VALUES
('스마트폰 케이스', '고급 실리콘 재질의 스마트폰 보호 케이스', 'CASE-001', 15000, 0.1, '7x15x1 cm'),
('블루투스 이어폰', '고음질 무선 블루투스 이어폰', 'AUDIO-001', 89000, 0.2, '5x5x3 cm'),
('노트북 파우치', '방수 기능을 갖춘 13인치 노트북 파우치', 'BAG-001', 32000, 0.3, '35x25x3 cm'),
('보조배터리', '10000mAh 고용량 보조배터리', 'BATT-001', 45000, 0.25, '10x6x2 cm'),
('무선 충전기', '고속 무선 충전 패드', 'CHRG-001', 28000, 0.15, '10x10x1 cm');

-- 샘플 재고 데이터
INSERT INTO inventory (product_id, warehouse_id, quantity, min_stock_level, max_stock_level, location_in_warehouse) VALUES
(1, 1, 100, 20, 200, 'A-1-1'),
(1, 2, 50, 10, 100, 'B-2-3'),
(2, 1, 30, 10, 50, 'A-2-4'),
(3, 1, 45, 15, 60, 'C-1-2'),
(3, 3, 60, 20, 80, 'A-3-1'),
(4, 2, 75, 25, 100, 'D-1-5'),
(5, 1, 55, 20, 80, 'B-4-2'),
(5, 3, 40, 15, 60, 'C-2-3');

-- 샘플 주문 데이터
INSERT INTO orders (order_number, customer_id, shipping_address, status_id, total_amount, notes) VALUES
('ORD-2023-001', 1, '서울시 강남구 역삼동 123-45', 5, 104000, '문 앞에 놓아주세요'),
('ORD-2023-002', 2, '서울시 종로구 종로1가 67-89', 4, 89000, '부재시 경비실에 맡겨주세요'),
('ORD-2023-003', 3, '부산시 해운대구 우동 456-78', 2, 60000, '전화 부탁드립니다');

-- 샘플 주문 상세 데이터
INSERT INTO order_details (order_id, product_id, warehouse_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 15000),
(1, 2, 1, 1, 89000),
(2, 2, 1, 1, 89000),
(3, 4, 2, 1, 45000),
(3, 5, 1, 1, 15000);

-- 샘플 출고 데이터
INSERT INTO shipments (order_id, warehouse_id, tracking_number, carrier, status) VALUES
(1, 1, 'TRK12345678', '대한통운', '배송완료'),
(2, 1, 'TRK23456789', '한진택배', '배송중');