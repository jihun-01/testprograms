const Inventory = require('../models/inventory');
const Product = require('../models/product');
const Warehouse = require('../models/warehouse');
const { measureDbQuery } = require('../utils/metrics');
const { Op } = require('sequelize');

// 재고 목록 조회
exports.getAllInventory = async (req, res, next) => {
  try {
    // 쿼리 파라미터로 필터링 조건 받기
    const { warehouse_id, product_id, low_stock } = req.query;
    
    // 필터링 조건 구성
    const whereCondition = {};
    
    if (warehouse_id) {
      whereCondition.warehouse_id = warehouse_id;
    }
    
    if (product_id) {
      whereCondition.product_id = product_id;
    }
    
    if (low_stock === 'true') {
      whereCondition[Op.and] = [
        { quantity: { [Op.lte]: sequelize.col('min_stock_level') } }
      ];
    }
    
    // 메트릭 측정과 함께 쿼리 실행
    const inventory = await measureDbQuery(
      'findAll',
      'inventory',
      () => Inventory.findAll({
        where: whereCondition,
        include: [
          { model: Product },
          { model: Warehouse }
        ],
        order: [
          ['warehouse_id', 'ASC'],
          ['product_id', 'ASC']
        ]
      })
    );
    
    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
};

// 특정 재고 정보 조회
exports.getInventoryById = async (req, res, next) => {
  try {
    const inventoryId = req.params.id;
    
    const inventory = await measureDbQuery(
      'findByPk',
      'inventory',
      () => Inventory.findByPk(inventoryId, {
        include: [
          { model: Product },
          { model: Warehouse }
        ]
      })
    );
    
    if (!inventory) {
      return res.status(404).json({ message: '재고 정보를 찾을 수 없습니다.' });
    }
    
    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
};

// 재고 생성
exports.createInventory = async (req, res, next) => {
  try {
    const { product_id, warehouse_id, quantity, min_stock_level, max_stock_level, location_in_warehouse } = req.body;
    
    // 상품과 창고 존재 여부 확인
    const [product, warehouse] = await Promise.all([
      measureDbQuery('findByPk', 'products', () => Product.findByPk(product_id)),
      measureDbQuery('findByPk', 'warehouses', () => Warehouse.findByPk(warehouse_id))
    ]);
    
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    if (!warehouse) {
      return res.status(404).json({ message: '창고를 찾을 수 없습니다.' });
    }
    
    // 같은 상품-창고 조합이 이미 존재하는지 확인
    const existingInventory = await measureDbQuery(
      'findOne',
      'inventory',
      () => Inventory.findOne({
        where: {
          product_id,
          warehouse_id
        }
      })
    );
    
    if (existingInventory) {
      return res.status(400).json({
        message: '이 상품은 이미 해당 창고에 등록되어 있습니다. 대신 기존 재고를 업데이트하세요.'
      });
    }
    
    // 새 재고 항목 생성
    const newInventory = await measureDbQuery(
      'create',
      'inventory',
      () => Inventory.create({
        product_id,
        warehouse_id,
        quantity,
        min_stock_level,
        max_stock_level: max_stock_level || null,
        location_in_warehouse,
        last_restock_date: quantity > 0 ? new Date() : null
      })
    );
    
    // 상품 및 창고 정보 포함하여 응답
    const inventoryWithDetails = await measureDbQuery(
      'findByPk',
      'inventory',
      () => Inventory.findByPk(newInventory.id, {
        include: [
          { model: Product },
          { model: Warehouse }
        ]
      })
    );
    
    res.status(201).json(inventoryWithDetails);
  } catch (error) {
    next(error);
  }
};

// 재고 수정
exports.updateInventory = async (req, res, next) => {
  try {
    const inventoryId = req.params.id;
    const { quantity, min_stock_level, max_stock_level, location_in_warehouse } = req.body;
    
    const inventory = await measureDbQuery(
      'findByPk',
      'inventory',
      () => Inventory.findByPk(inventoryId)
    );
    
    if (!inventory) {
      return res.status(404).json({ message: '재고 정보를 찾을 수 없습니다.' });
    }
    
    // 재고량이 증가했는지 확인하여 마지막 입고일 업데이트
    const updateData = {
      quantity,
      min_stock_level,
      max_stock_level: max_stock_level || null,
      location_in_warehouse
    };
    
    // 재고량이 증가했다면 마지막 입고일 업데이트
    if (quantity > inventory.quantity) {
      updateData.last_restock_date = new Date();
    }
    
    await measureDbQuery(
      'update',
      'inventory',
      () => inventory.update(updateData)
    );
    
    // 상품 및 창고 정보 포함하여 응답
    const updatedInventory = await measureDbQuery(
      'findByPk',
      'inventory',
      () => Inventory.findByPk(inventoryId, {
        include: [
          { model: Product },
          { model: Warehouse }
        ]
      })
    );
    
    res.status(200).json(updatedInventory);
  } catch (error) {
    next(error);
  }
};

// 재고 삭제
exports.deleteInventory = async (req, res, next) => {
  try {
    const inventoryId = req.params.id;
    
    const inventory = await measureDbQuery(
      'findByPk',
      'inventory',
      () => Inventory.findByPk(inventoryId)
    );
    
    if (!inventory) {
      return res.status(404).json({ message: '재고 정보를 찾을 수 없습니다.' });
    }
    
    await measureDbQuery(
      'destroy',
      'inventory',
      () => inventory.destroy()
    );
    
    res.status(200).json({ message: '재고 정보가 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
};