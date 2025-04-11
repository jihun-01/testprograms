const Shipment = require('../models/shipment');
const { Order, OrderStatus } = require('../models/order');
const Warehouse = require('../models/warehouse');
const OrderDetail = require('../models/orderDetail');
const Product = require('../models/product');
const { sequelize } = require('../utils/database');
const { measureDbQuery } = require('../utils/metrics');
const { Op } = require('sequelize');

// 모든 출고 조회
exports.getAllShipments = async (req, res, next) => {
  try {
    // 쿼리 파라미터로 필터링 조건 받기
    const { order_id, warehouse_id, status, start_date, end_date } = req.query;
    
    // 필터링 조건 구성
    const whereCondition = {};
    
    if (order_id) {
      whereCondition.order_id = order_id;
    }
    
    if (warehouse_id) {
      whereCondition.warehouse_id = warehouse_id;
    }
    
    if (status) {
      whereCondition.status = status;
    }
    
    if (start_date || end_date) {
      whereCondition.shipment_date = {};
      
      if (start_date) {
        whereCondition.shipment_date[Op.gte] = new Date(start_date);
      }
      
      if (end_date) {
        whereCondition.shipment_date[Op.lte] = new Date(end_date);
      }
    }
    
    // 메트릭 측정과 함께 쿼리 실행
    const shipments = await measureDbQuery(
      'findAll',
      'shipments',
      () => Shipment.findAll({
        where: whereCondition,
        include: [
          { 
            model: Order,
            include: [
              { model: OrderStatus, as: 'status' }
            ]
          },
          { model: Warehouse }
        ],
        order: [['shipment_date', 'DESC']]
      })
    );
    
    res.status(200).json(shipments);
  } catch (error) {
    next(error);
  }
};

// 특정 출고 조회
exports.getShipmentById = async (req, res, next) => {
  try {
    const shipmentId = req.params.id;
    
    const shipment = await measureDbQuery(
      'findByPk',
      'shipments',
      () => Shipment.findByPk(shipmentId, {
        include: [
          { 
            model: Order,
            include: [
              { model: OrderStatus, as: 'status' },
              { 
                model: OrderDetail,
                include: [
                  { model: Product },
                  { model: Warehouse }
                ]
              }
            ]
          },
          { model: Warehouse }
        ]
      })
    );
    
    if (!shipment) {
      return res.status(404).json({ message: '출고 정보를 찾을 수 없습니다.' });
    }
    
    res.status(200).json(shipment);
  } catch (error) {
    next(error);
  }
};

// 출고 생성
exports.createShipment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { order_id, warehouse_id, tracking_number, carrier } = req.body;
    
    // 주문 조회
    const order = await measureDbQuery(
      'findByPk',
      'orders',
      () => Order.findByPk(order_id, { transaction })
    );
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    
    // 창고 조회
    const warehouse = await measureDbQuery(
      'findByPk',
      'warehouses',
      () => Warehouse.findByPk(warehouse_id, { transaction })
    );
    
    if (!warehouse) {
      await transaction.rollback();
      return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });
    }
    
    // 이미 출고된 주문인지 확인
    if (order.status_id === 4 || order.status_id === 5) { // 배송중(4) 또는 배송완료(5) 상태
      await transaction.rollback();
      return res.status(400).json({ message: '이미 출고된 주문입니다.' });
    }
    
    // 취소된 주문인지 확인
    if (order.status_id === 6) { // 취소 상태
      await transaction.rollback();
      return res.status(400).json({ message: '취소된 주문은 출고할 수 없습니다.' });
    }
    
    // 출고 생성
    const shipment = await measureDbQuery(
      'create',
      'shipments',
      () => Shipment.create({
        order_id,
        warehouse_id,
        tracking_number: tracking_number || null,
        carrier: carrier || null,
        status: '배송준비중'
      }, { transaction })
    );
    
    // 주문 상태 업데이트
    await measureDbQuery(
      'update',
      'orders',
      () => order.update({ status_id: 3 }, { transaction }) // 포장완료(3) 상태로 변경
    );
    
    await transaction.commit();
    
    // 생성된 출고 정보 조회
    const createdShipment = await measureDbQuery(
      'findByPk',
      'shipments',
      () => Shipment.findByPk(shipment.id, {
        include: [
          { model: Order },
          { model: Warehouse }
        ]
      })
    );
    
    res.status(201).json(createdShipment);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 출고 상태 업데이트
exports.updateShipmentStatus = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const shipmentId = req.params.id;
    const { status, tracking_number, carrier } = req.body;
    
    // 출고 정보 조회
    const shipment = await measureDbQuery(
      'findByPk',
      'shipments',
      () => Shipment.findByPk(shipmentId, {
        include: [{ model: Order }],
        transaction
      })
    );
    
    if (!shipment) {
      await transaction.rollback();
      return res.status(404).json({ message: '출고 정보를 찾을 수 없습니다.' });
    }
    
    // 출고 상태 업데이트
    await measureDbQuery(
      'update',
      'shipments',
      () => shipment.update({
        status,
        tracking_number: tracking_number !== undefined ? tracking_number : shipment.tracking_number,
        carrier: carrier !== undefined ? carrier : shipment.carrier
      }, { transaction })
    );
    
    // 출고 상태에 따른 주문 상태 업데이트
    let orderStatusId;
    
    switch (status) {
      case '배송중':
        orderStatusId = 4; // 배송중 상태
        break;
      case '배송완료':
        orderStatusId = 5; // 배송완료 상태
        break;
      default:
        orderStatusId = 3; // 포장완료 상태
    }
    
    await measureDbQuery(
      'update',
      'orders',
      () => shipment.Order.update({ status_id: orderStatusId }, { transaction })
    );
    
    await transaction.commit();
    
    // 업데이트된 출고 정보 조회
    const updatedShipment = await measureDbQuery(
      'findByPk',
      'shipments',
      () => Shipment.findByPk(shipmentId, {
        include: [
          { 
            model: Order,
            include: [{ model: OrderStatus, as: 'status' }]
          },
          { model: Warehouse }
        ]
      })
    );
    
    res.status(200).json(updatedShipment);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};