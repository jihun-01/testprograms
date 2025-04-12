const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// 입력 유효성 검증 미들웨어
const validateLogin = [
  body('username')
    .notEmpty().withMessage('사용자 이름은 필수 입력 항목입니다.'),
  body('password')
    .notEmpty().withMessage('비밀번호는 필수 입력 항목입니다.')
];

const validateRegister = [
  body('username')
    .notEmpty().withMessage('사용자 이름은 필수 입력 항목입니다.')
    .isLength({ min: 4, max: 50 }).withMessage('사용자 이름은 4-50자 사이여야 합니다.'),
  body('password')
    .notEmpty().withMessage('비밀번호는 필수 입력 항목입니다.')
    .isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
  body('name')
    .notEmpty().withMessage('이름은 필수 입력 항목입니다.'),
  body('email')
    .optional()
    .isEmail().withMessage('유효한 이메일 주소를 입력해주세요.')
];

// 인증 관련 엔드포인트
router.post('/login', validateLogin, authController.login);
router.get('/me', auth.authenticate, authController.getCurrentUser);
router.post('/register', validateRegister, authController.register);

module.exports = router;