const Product = require('../models/product');
const { measureDbQuery } = require('../utils/metrics');
const { Op } = require('sequelize');

// 모든 상품 조회
exports.getAllProducts = async (req, res, next) => {
  try {
    // 쿼리 파라미터로 검색 조건 받기
    const { search, minPrice, maxPrice } = req.query;
    
    // 검색 조건 구성
    const searchCondition = {};
    
    if (search) {
      searchCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (minPrice) {
      searchCondition.price = { ...searchCondition.price, [Op.gte]: minPrice };
    }
    
    if (maxPrice) {
      searchCondition.price = { ...searchCondition.price, [Op.lte]: maxPrice };
    }
    
    // 메트릭 측정과 함께 쿼리 실행
    const products = await measureDbQuery(
      'findAll',
      'products',
      () => Product.findAll({
        where: Object.keys(searchCondition).length > 0 ? searchCondition : undefined,
        order: [['created_at', 'DESC']]
      })
    );
    
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// 특정 상품 조회
exports.getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    const product = await measureDbQuery(
      'findByPk',
      'products',
      () => Product.findByPk(productId)
    );
    
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// 상품 생성
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, sku, price, weight, dimensions } = req.body;
    
    // SKU 중복 체크
    const existingProduct = await measureDbQuery(
      'findOne',
      'products',
      () => Product.findOne({ where: { sku } })
    );
    
    if (existingProduct) {
      return res.status(400).json({ message: '이미 존재하는 SKU입니다.' });
    }
    
    const newProduct = await measureDbQuery(
      'create',
      'products',
      () => Product.create({
        name,
        description,
        sku,
        price,
        weight,
        dimensions
      })
    );
    
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// 상품 수정
exports.updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { name, description, price, weight, dimensions } = req.body;
    
    const product = await measureDbQuery(
      'findByPk',
      'products',
      () => Product.findByPk(productId)
    );
    
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    // SKU는 변경할 수 없도록 제외
    await measureDbQuery(
      'update',
      'products',
      () => product.update({
        name,
        description,
        price,
        weight,
        dimensions
      })
    );
    
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// 상품 삭제
exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    const product = await measureDbQuery(
      'findByPk',
      'products',
      () => Product.findByPk(productId)
    );
    
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    await measureDbQuery(
      'destroy',
      'products',
      () => product.destroy()
    );
    
    res.status(200).json({ message: '상품이 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
};