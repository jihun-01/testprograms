const { sequelize } = require('../models');
const {
  Order,
  OrderDetail,
  Customer,
  Product,
  Warehouse,
  Inventory,
  OrderStatus
} = require('../models');
const { measureDbQuery } = require('../utils/metrics');
const { Op } = require('sequelize');

// 전체 주문 조회
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Customer },
        { model: OrderStatus },
        {
          model: OrderDetail,
          include: [
            { model: Product },
            { model: Warehouse }
          ]
        }
      ]
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// 주문 상세 조회
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Customer },
        { model: OrderStatus },
        {
          model: OrderDetail,
          include: [
            { model: Product },
            { model: Warehouse }
          ]
        }
      ]
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// 새 주문 생성
exports.createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { customerId, shippingAddress, orderDetails } = req.body;
    
    // 고객 확인
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // 주문 생성
    const order = await Order.create({
      customer_id: customerId,
      shipping_address: shippingAddress,
      status_id: 1, // pending
      total_amount: 0
    }, { transaction });
    
    // 주문 상세 생성 및 재고 확인
    let totalAmount = 0;
    for (const detail of orderDetails) {
      const { productId, warehouseId, quantity } = detail;
      
      // 재고 확인
      const inventory = await Inventory.findOne({
        where: {
          product_id: productId,
          warehouse_id: warehouseId
        }
      });
      
      if (!inventory || inventory.quantity < quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Insufficient inventory' });
      }
      
      // 상품 가격 조회
      const product = await Product.findByPk(productId);
      const unitPrice = product.price;
      
      // 주문 상세 생성
      await OrderDetail.create({
        order_id: order.id,
        product_id: productId,
        warehouse_id: warehouseId,
        quantity,
        unit_price: unitPrice
      }, { transaction });
      
      // 재고 감소
      await inventory.decrement('quantity', { by: quantity, transaction });
      
      totalAmount += unitPrice * quantity;
    }
    
    // 주문 총액 업데이트
    await order.update({ total_amount: totalAmount }, { transaction });
    
    await transaction.commit();
    res.status(201).json(order);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 주문 상태 업데이트
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { statusId } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    await order.update({ status_id: statusId });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// 주문 삭제
exports.deleteOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderDetail }]
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // 주문 상세 삭제 및 재고 복구
    for (const detail of order.OrderDetails) {
      await Inventory.increment('quantity', {
        by: detail.quantity,
        where: {
          product_id: detail.product_id,
          warehouse_id: detail.warehouse_id
        },
        transaction
      });
    }
    
    await order.destroy({ transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 주문 통계 조회
exports.getOrderStats = async (req, res, next) => {
  try {
    const stats = await measureDbQuery(
      'findAll',
      'orders',
      () => Order.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('Order.id')), 'total_orders'],
          [sequelize.fn('SUM', sequelize.col('Order.total_amount')), 'total_amount'],
          [sequelize.col('Order.status_id'), 'status_id'],
          [sequelize.col('OrderStatus.name'), 'status_name']
        ],
        include: [
          {
            model: OrderStatus,
            attributes: []
          }
        ],
        group: ['Order.status_id', 'OrderStatus.name']
      })
    );

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

// 주문 상태 목록 조회
exports.getOrderStatuses = async (req, res, next) => {
  try {
    const statuses = await measureDbQuery(
      'findAll',
      'order_status',
      () => OrderStatus.findAll({
        order: [['id', 'ASC']]
      })
    );
    
    res.status(200).json(statuses);
  } catch (error) {
    console.error('주문 상태 목록 조회 중 오류 발생:', error);
    next(error);
  }
};