const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const warehouseController = require('../controllers/warehouseController');
const auth = require('../middlewares/auth');

// 입력 유효성 검증 미들웨어
const validateWarehouse = [
  body('name')
    .notEmpty().withMessage('창고명은 필수 입력 항목입니다.')
    .isLength({ min: 2, max: 255 }).withMessage('창고명은 2-255자 사이여야 합니다.'),
  body('location')
    .notEmpty().withMessage('위치는 필수 입력 항목입니다.')
    .isLength({ max: 255 }).withMessage('위치는 최대 255자까지 입력 가능합니다.'),
  body('address')
    .notEmpty().withMessage('주소는 필수 입력 항목입니다.'),
  body('contact_person')
    .optional()
    .isLength({ max: 100 }).withMessage('담당자 이름은 최대 100자까지 입력 가능합니다.'),
  body('contact_email')
    .optional()
    .isEmail().withMessage('유효한 이메일 주소를 입력해주세요.')
    .isLength({ max: 100 }).withMessage('이메일은 최대 100자까지 입력 가능합니다.'),
  body('contact_phone')
    .optional()
    .isLength({ max: 20 }).withMessage('전화번호는 최대 20자까지 입력 가능합니다.')
];

// 창고 관련 엔드포인트
router.get('/', warehouseController.getAllWarehouses);
router.get('/:id', warehouseController.getWarehouseById);
router.get('/:id/inventory-summary', warehouseController.getWarehouseInventorySummary);
router.post('/', auth.authenticate, validateWarehouse, warehouseController.createWarehouse);
router.put('/:id', auth.authenticate, validateWarehouse, warehouseController.updateWarehouse);
router.delete('/:id', auth.authenticate, warehouseController.deleteWarehouse);

module.exports = router;