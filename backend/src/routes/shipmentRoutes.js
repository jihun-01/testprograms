const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const shipmentController = require('../controllers/shipmentController');
const auth = require('../middlewares/auth');

// 출고 생성 유효성 검증 미들웨어
const validateCreateShipment = [
  body('order_id')
    .notEmpty().withMessage('주문 ID는 필수 항목입니다.')
    .isInt().withMessage('올바른 주문 ID를 입력해주세요.'),
  body('warehouse_id')
    .notEmpty().withMessage('창고 ID는 필수 항목입니다.')
    .isInt().withMessage('올바른 창고 ID를 입력해주세요.'),
  body('tracking_number')
    .optional()
    .isLength({ max: 100 }).withMessage('송장 번호는 최대 100자까지 입력 가능합니다.'),
  body('carrier')
    .optional()
    .isLength({ max: 100 }).withMessage('배송 업체는 최대 100자까지 입력 가능합니다.')
];

// 출고 상태 업데이트 유효성 검증 미들웨어
const validateUpdateShipmentStatus = [
  body('status')
    .notEmpty().withMessage('출고 상태는 필수 항목입니다.')
    .isIn(['배송준비중', '배송중', '배송완료']).withMessage('유효한 출고 상태를 입력해주세요.'),
  body('tracking_number')
    .optional()
    .isLength({ max: 100 }).withMessage('송장 번호는 최대 100자까지 입력 가능합니다.'),
  body('carrier')
    .optional()
    .isLength({ max: 100 }).withMessage('배송 업체는 최대 100자까지 입력 가능합니다.')
];

// 출고 관련 엔드포인트
router.get('/', shipmentController.getAllShipments);
router.get('/:id', shipmentController.getShipmentById);
router.post('/', auth.authenticate, validateCreateShipment, shipmentController.createShipment);
router.put('/:id/status', auth.authenticate, validateUpdateShipmentStatus, shipmentController.updateShipmentStatus);

module.exports = router;