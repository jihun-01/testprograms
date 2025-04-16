const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const auth = require('../middlewares/auth');

// 고객 생성/수정 유효성 검증 미들웨어
const validateCustomer = [
  body('name')
    .notEmpty().withMessage('이름은 필수 항목입니다.')
    .trim(),
  body('email')
    .optional()
    .isEmail().withMessage('올바른 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim()
];

// 고객 관련 엔드포인트
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router; 