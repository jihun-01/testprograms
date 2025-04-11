const { Order, OrderStatus } = require('../models/order');
const OrderDetail = require('../models/orderDetail');
const Customer = require('../models/customer');
const Product = require('../models/product');
const Inventory = require('../models/inventory');
const { sequelize } = require('../utils/database');
const { measureDbQuery } = require('../utils/metrics');
const { Op } = require('sequelize');

// 모든 주문 조회
exports.getAllOrders = async (req, res, next) => {
  try {
    // 쿼리 파라미터로 필터링 조건 받기
    const { customer_id, status_id, start_date, end_date } = req.query;
    
    // 필터링 조건 구성
    const whereCondition = {};
    
    if (customer_id) {
      whereCondition.customer_id = customer_id;
    }
    
    if (status_id) {
      whereCondition.status_id = status_id;
    }
    
    if (start_date || end_date) {
      whereCondition.order_date = {};
      
      if (start_date) {
        whereCondition.order_date[Op.gte] = new Date(start_date);
      }
      
      if (end_date) {
        whereCondition.order_date[Op.lte] = new Date(end_date);
      }
    }
    
    // 메트릭 측정과 함께 쿼리 실행
    const orders = await measureDbQuery(
      'findAll',
      'orders',
      () => Order.findAll({
        where: whereCondition,
        include: [
          { model: Customer },
          { model: OrderStatus, as: 'status' }
        ],
        order: [['order_date', 'DESC']]
      })
    );
    
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// 특정 주문 조회
exports.getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    
    const order = await measureDbQuery(
      'findByPk',
      'orders',
      () => Order.findByPk(orderId, {
        include: [
          { model: Customer },
          { model: OrderStatus, as: 'status' },
          {
            model: OrderDetail,
            include: [
              { model: Product },
              { model: Warehouse }
            ]
          }
        ]
      })
    );
    
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// 주문 생성
exports.createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      customer_id,
      shipping_address,
      notes,
      items // [{product_id, warehouse_id, quantity}]
    } = req.body;
    
    // 고객 정보 확인
    const customer = await measureDbQuery(
      'findByPk',
      'customers',
      () => Customer.findByPk(customer_id, { transaction })
    );
    
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ message: '고객을 찾을 수 없습니다.' });
    }
    
    // 주문 번호 생성 (현재 날짜 + 랜덤 숫자)
    const orderNumber = `ORD-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
    
    // 주문 항목 유효성 검증 및 총액 계산
    const orderItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      const { product_id, warehouse_id, quantity } = item;
      
      // 상품 정보 확인
      const product = await measureDbQuery(
        'findByPk',
        'products',
        () => Product.findByPk(product_id, { transaction })
      );
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: `상품 ID ${product_id}를 찾을 수 없습니다.` 
        });
      }
      
      // 창고 재고 확인
      const inventory = await measureDbQuery(
        'findOne',
        'inventory',
        () => Inventory.findOne({
          where: {
            product_id,
            warehouse_id
          },
          transaction
        })
      );
      
      if (!inventory) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: `창고 ID ${warehouse_id}에 상품 ID ${product_id}의 재고가 없습니다.` 
        });
      }
      
      if (inventory.quantity < quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `창고 ID ${warehouse_id}의 상품 ID ${product_id} 재고가 부족합니다. 현재 재고: ${inventory.quantity}, 요청 수량: ${quantity}` 
        });
      }
      
      // 재고 업데이트
      await measureDbQuery(
        'update',
        'inventory',
        () => inventory.update({
          quantity: inventory.quantity - quantity
        }, { transaction })
      );
      
      // 주문 항목 추가
      orderItems.push({
        product_id,
        warehouse_id,
        quantity,
        unit_price: product.price
      });
      
      // 총액 계산
      totalAmount += product.price * quantity;
    }
    
    // 주문 생성
    const order = await measureDbQuery(
      'create',
      'orders',
      () => Order.create({
        order_number: orderNumber,
        customer_id,
        shipping_address,
        status_id: 1, // 기본 상태: 접수됨
        total_amount: totalAmount,
        notes
      }, { transaction })
    );
    
    // 주문 상세 생성
    for (const item of orderItems) {
      await measureDbQuery(
        'create',
        'order_details',
        () => OrderDetail.create({
          order_id: order.id,
          ...item
        }, { transaction })
      );
    }
    
    await transaction.commit();
    
    // 생성된 주문 조회
    const createdOrder = await measureDbQuery(
      'findByPk',
      'orders',
      () => Order.findByPk(order.id, {
        include: [
          { model: Customer },
          { model: OrderStatus, as: 'status' },
          {
            model: OrderDetail,
            include: [
              { model: Product },
              { model: Warehouse }
            ]
          }
        ]
      })
    );
    
    res.status(201).json(createdOrder);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 주문 상태 업데이트
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status_id } = req.body;
    
    // 주문 존재 여부 확인
    const order = await measureDbQuery(
      'findByPk',
      'orders',
      () => Order.findByPk(orderId)
    );
    
    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    
    // 상태 존재 여부 확인
    const status = await measureDbQuery(
      'findByPk',
      'order_status',
      () => OrderStatus.findByPk(status_id)
    );
    
    if (!status) {
      return res.status(404).json({ message: '존재하지 않는 주문 상태입니다.' });
    }
    
    // 주문 상태 업데이트
    await measureDbQuery(
      'update',
      'orders',
      () => order.update({ status_id })
    );
    
    // 업데이트된 주문 정보 조회
    const updatedOrder = await measureDbQuery(
      'findByPk',
      'orders',
      () => Order.findByPk(orderId, {
        include: [
          { model: Customer },
          { model: OrderStatus, as: 'status' }
        ]
      })
    );
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// 주문 취소
exports.cancelOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const orderId = req.params.id;
    
    // 주문 조회
    const order = await measureDbQuery(
      'findByPk',
      'orders',
      () => Order.findByPk(orderId, {
        include: [
          { model: OrderDetail }
        ],
        transaction
      })
    );
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    
    // 이미 취소된 주문인지 확인
    if (order.status_id === 6) { // 취소 상태 ID
      await transaction.rollback();
      return res.status(400).json({ message: '이미 취소된 주문입니다.' });
    }
    
    // 출고된 주문은 취소 불가
    if (order.status_id === 4 || order.status_id === 5) { // 배송중(4) 또는 배송완료(5) 상태
      await transaction.rollback();
      return res.status(400).json({ message: '이미 출고된 주문은 취소할 수 없습니다.' });
    }
    
    // 재고 복구
    for (const detail of order.OrderDetails) {
      const inventory = await measureDbQuery(
        'findOne',
        'inventory',
        () => Inventory.findOne({
          where: {
            product_id: detail.product_id,
            warehouse_id: detail.warehouse_id
          },
          transaction
        })
      );
      
      if (inventory) {
        await measureDbQuery(
          'update',
          'inventory',
          () => inventory.update({
            quantity: inventory.quantity + detail.quantity
          }, { transaction })
        );
      }
    }
    
    // 주문 상태 취소로 변경
    await measureDbQuery(
      'update',
      'orders',
      () => order.update({
        status_id: 6 // 취소 상태 ID
      }, { transaction })
    );
    
    await transaction.commit();
    
    res.status(200).json({ message: '주문이 취소되었습니다.' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};