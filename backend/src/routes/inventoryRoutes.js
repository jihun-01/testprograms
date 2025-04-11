const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middlewares/auth');

// 입력 유효성 검증 미들웨어
const validateInventory = [
  body('product_id')
    .notEmpty().withMessage('상품을 선택해주세요.')
    .isInt().withMessage('올바른 상품 ID를 입력해주세요.'),
  body('warehouse_id')
    .notEmpty().withMessage('창고를 선택해주세요.')
    .isInt().withMessage('올바른 창고 ID를 입력해주세요.'),
  body('quantity')
    .notEmpty().withMessage('재고량은 필수 입력 항목입니다.')
    .isInt({ min: 0 }).withMessage('재고량은 0 이상이어야 합니다.'),
  body('min_stock_level')
    .notEmpty().withMessage('최소 재고량은 필수 입력 항목입니다.')
    .isInt({ min: 0 }).withMessage('최소 재고량은 0 이상이어야 합니다.'),
  body('max_stock_level')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('최대 재고량은 0 이상이어야 합니다.')
    .custom((value, { req }) => {
      if (value && parseInt(value) <= parseInt(req.body.min_stock_level)) {
        throw new Error('최대 재고량은 최소 재고량보다 커야 합니다.');
      }
      return true;
    }),
  body('location_in_warehouse')
    .optional()
    .isLength({ max: 50 }).withMessage('창고 내 위치는 최대 50자까지 입력 가능합니다.')
];

// 재고 관련 엔드포인트
router.get('/', inventoryController.getAllInventory);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', auth.authenticate, validateInventory, inventoryController.createInventory);
router.put('/:id', auth.authenticate, validateInventory, inventoryController.updateInventory);
router.delete('/:id', auth.authenticate, inventoryController.deleteInventory);

module.exports = router;