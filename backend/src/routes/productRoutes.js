const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');

// 입력 유효성 검증 미들웨어
const validateProduct = [
  body('name')
    .notEmpty().withMessage('상품명은 필수 입력 항목입니다.')
    .isLength({ min: 2, max: 100 }).withMessage('상품명은 2-100자 사이여야 합니다.'),
  body('sku')
    .notEmpty().withMessage('SKU는 필수 입력 항목입니다.')
    .matches(/^[A-Za-z0-9-]+$/).withMessage('SKU는 영문자, 숫자, 하이픈(-)만 사용 가능합니다.')
    .isLength({ max: 50 }).withMessage('SKU는 최대 50자까지 입력 가능합니다.'),
  body('price')
    .notEmpty().withMessage('가격은 필수 입력 항목입니다.')
    .isFloat({ gt: 0 }).withMessage('가격은 0보다 커야 합니다.')
    .isLength({ max: 10 }).withMessage('가격이 너무 큽니다.'),
  body('weight')
    .optional()
    .isFloat({ gt: 0 }).withMessage('무게는 0보다 커야 합니다.'),
  body('dimensions')
    .optional()
    .isLength({ max: 50 }).withMessage('크기는 최대 50자까지 입력 가능합니다.')
];

// 상품 관련 엔드포인트
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth.authenticate, validateProduct, productController.createProduct);
router.put('/:id', auth.authenticate, validateProduct, productController.updateProduct);
router.delete('/:id', auth.authenticate, productController.deleteProduct);

module.exports = router;
