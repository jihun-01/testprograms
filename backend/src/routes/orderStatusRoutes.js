const express = require('express');
const router = express.Router();
const orderStatusController = require('../controllers/orderStatusController');

// 모든 주문 상태 조회
router.get('/', orderStatusController.getOrderStatuses);

// 특정 주문 상태 조회
router.get('/:id', orderStatusController.getOrderStatusById);

// 주문 상태 생성
router.post('/', orderStatusController.createOrderStatus);

// 주문 상태 수정
router.put('/:id', orderStatusController.updateOrderStatus);

// 주문 상태 삭제
router.delete('/:id', orderStatusController.deleteOrderStatus);

module.exports = router; 