const Warehouse = require('../models/warehouse');
const Inventory = require('../models/inventory');
const Product = require('../models/product');
const { measureDbQuery } = require('../utils/metrics');
const { Op } = require('sequelize');
const { sequelize } = require('../utils/database');

// 모든 창고 조회
exports.getAllWarehouses = async (req, res, next) => {
  try {
    // 쿼리 파라미터로 검색 조건 받기
    const { search } = req.query;
    
    // 검색 조건 구성
    const searchCondition = {};
    
    if (search) {
      searchCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // 메트릭 측정과 함께 쿼리 실행
    const warehouses = await measureDbQuery(
      'findAll',
      'warehouses',
      () => Warehouse.findAll({
        where: Object.keys(searchCondition).length > 0 ? searchCondition : undefined,
        order: [['name', 'ASC']]
      })
    );
    
    res.status(200).json(warehouses);
  } catch (error) {
    next(error);
  }
};

// 특정 창고 조회
exports.getWarehouseById = async (req, res, next) => {
  try {
    const warehouseId = req.params.id;
    
    const warehouse = await measureDbQuery(
      'findByPk',
      'warehouses',
      () => Warehouse.findByPk(warehouseId)
    );
    
    if (!warehouse) {
      return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });
    }
    
    res.status(200).json(warehouse);
  } catch (error) {
    next(error);
  }
};

// 창고 생성
exports.createWarehouse = async (req, res, next) => {
  try {
    const { name, location, address, contact_person, contact_email, contact_phone } = req.body;
    
    const newWarehouse = await measureDbQuery(
      'create',
      'warehouses',
      () => Warehouse.create({
        name,
        location,
        address,
        contact_person,
        contact_email,
        contact_phone
      })
    );
    
    res.status(201).json(newWarehouse);
  } catch (error) {
    next(error);
  }
};

// 창고 수정
exports.updateWarehouse = async (req, res, next) => {
  try {
    const warehouseId = req.params.id;
    const { name, location, address, contact_person, contact_email, contact_phone } = req.body;
    
    const warehouse = await measureDbQuery(
      'findByPk',
      'warehouses',
      () => Warehouse.findByPk(warehouseId)
    );
    
    if (!warehouse) {
      return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });
    }
    
    await measureDbQuery(
      'update',
      'warehouses',
      () => warehouse.update({
        name,
        location,
        address,
        contact_person,
        contact_email,
        contact_phone
      })
    );
    
    res.status(200).json(warehouse);
  } catch (error) {
    next(error);
  }
};

// 창고 삭제
exports.deleteWarehouse = async (req, res, next) => {
  try {
    const warehouseId = req.params.id;
    
    const warehouse = await measureDbQuery(
      'findByPk',
      'warehouses',
      () => Warehouse.findByPk(warehouseId)
    );
    
    if (!warehouse) {
      return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });
    }
    
    // 해당 창고와 연관된 모든 재고 정보 삭제
    await measureDbQuery(
      'destroy',
      'inventory',
      () => Inventory.destroy({
        where: { warehouse_id: warehouseId }
      })
    );
    
    // 창고 삭제
    await measureDbQuery(
      'destroy',
      'warehouses',
      () => warehouse.destroy()
    );
    
    res.status(200).json({ message: '창고가 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
};

// 창고 재고 요약 정보 조회
exports.getWarehouseInventorySummary = async (req, res, next) => {
  try {
    const warehouseId = req.params.id;
    
    // 창고 존재 여부 확인
    const warehouse = await measureDbQuery(
      'findByPk',
      'warehouses',
      () => Warehouse.findByPk(warehouseId)
    );
    
    if (!warehouse) {
      return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });
    }
    
    // 창고 재고 요약 정보 쿼리
    const inventorySummary = await measureDbQuery(
      'findAll',
      'inventory',
      () => Inventory.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_items'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
          [sequelize.literal(`SUM(CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END)`), 'low_stock_items'],
          [sequelize.literal(`SUM(CASE WHEN max_stock_level IS NOT NULL AND quantity >= max_stock_level THEN 1 ELSE 0 END)`), 'over_stock_items']
        ],
        where: { warehouse_id: warehouseId }
      })
    );
    
    res.status(200).json({
      warehouse_id: warehouseId,
      warehouse_name: warehouse.name,
      ...inventorySummary[0].dataValues
    });
  } catch (error) {
    next(error);
  }
};

// 창고 통계 정보 반환
exports.getStats = async (req, res, next) => {
  try {
    const stats = await measureDbQuery(
      'findAll',
      'warehouses',
      () => Warehouse.findAll({
        attributes: [
          'id',
          'name',
          [sequelize.fn('COUNT', sequelize.col('Inventories.id')), 'total_items'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('Inventories.quantity')), 0), 'total_quantity'],
          [sequelize.literal(`COALESCE(SUM(CASE WHEN Inventories.quantity <= Inventories.min_stock_level THEN 1 ELSE 0 END), 0)`), 'low_stock_items'],
          [sequelize.literal(`COALESCE(SUM(CASE WHEN Inventories.max_stock_level IS NOT NULL AND Inventories.quantity >= Inventories.max_stock_level THEN 1 ELSE 0 END), 0)`), 'over_stock_items']
        ],
        include: [
          {
            model: Inventory,
            attributes: [],
            required: false
          }
        ],
        group: ['id', 'name']
      })
    );

    // 결과가 없는 경우 빈 배열 반환
    if (!stats || stats.length === 0) {
      return res.status(200).json([]);
    }

    // null 값을 0으로 변환
    const formattedStats = stats.map(stat => ({
      id: stat.id,
      name: stat.name,
      total_items: parseInt(stat.dataValues.total_items) || 0,
      total_quantity: parseInt(stat.dataValues.total_quantity) || 0,
      low_stock_items: parseInt(stat.dataValues.low_stock_items) || 0,
      over_stock_items: parseInt(stat.dataValues.over_stock_items) || 0
    }));

    res.status(200).json(formattedStats);
  } catch (error) {
    console.error('창고 통계 조회 중 오류 발생:', error);
    next(error);
  }
};

// 창고 통계 조회
exports.getWarehouseStats = async (req, res, next) => {
  try {
    const stats = await measureDbQuery(
      'findAll',
      'warehouses',
      () => Warehouse.findAll({
        attributes: [
          'id',
          'name',
          'capacity',
          [sequelize.fn('COUNT', sequelize.col('Inventories.id')), 'total_items'],
          [sequelize.fn('SUM', sequelize.col('Inventories.quantity')), 'total_quantity']
        ],
        include: [
          {
            model: Inventory,
            attributes: []
          }
        ],
        group: ['Warehouse.id', 'Warehouse.name', 'Warehouse.capacity']
      })
    );

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};