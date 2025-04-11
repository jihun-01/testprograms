const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');

// 주문 생성 유효성 검증 미들웨어
const validateCreateOrder = [
  body('customer_id')
    .notEmpty().withMessage('고객 ID는 필수 항목입니다.')
    .isInt().withMessage('올바른 고객 ID를 입력해주세요.'),
  body('shipping_address')
    .notEmpty().withMessage('배송 주소는 필수 항목입니다.'),
  body('items')
    .isArray({ min: 1 }).withMessage('주문 항목은 최소 1개 이상이어야 합니다.'),
  body('items.*.product_id')
    .notEmpty().withMessage('상품 ID는 필수 항목입니다.')
    .isInt().withMessage('올바른 상품 ID를 입력해주세요.'),
  body('items.*.warehouse_id')
    .notEmpty().withMessage('창고 ID는 필수 항목입니다.')
    .isInt().withMessage('올바른 창고 ID를 입력해주세요.'),
  body('items.*.quantity')
    .notEmpty().withMessage('수량은 필수 항목입니다.')
    .isInt({ min: 1 }).withMessage('수량은 1 이상이어야 합니다.')
];

// 주문 상태 업데이트 유효성 검증 미들웨어
const validateUpdateOrderStatus = [
  body('status_id')
    .notEmpty().withMessage('주문 상태 ID는 필수 항목입니다.')
    .isInt().withMessage('올바른 주문 상태 ID를 입력해주세요.')
];

// 주문 관련 엔드포인트
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', auth.authenticate, validateCreateOrder, orderController.createOrder);
router.put('/:id/status', auth.authenticate, validateUpdateOrderStatus, orderController.updateOrderStatus);
router.post('/:id/cancel', auth.authenticate, orderController.cancelOrder);

module.exports = router;