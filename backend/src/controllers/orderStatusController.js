const { OrderStatus } = require('../models');

// 모든 주문 상태 조회
exports.getOrderStatuses = async (req, res) => {
  try {
    const orderStatuses = await OrderStatus.findAll();
    res.json(orderStatuses);
  } catch (error) {
    console.error('주문 상태 조회 중 오류 발생:', error);
    res.status(500).json({ error: '주문 상태 조회 중 오류가 발생했습니다.' });
  }
};

// 특정 주문 상태 조회
exports.getOrderStatusById = async (req, res) => {
  try {
    const orderStatus = await OrderStatus.findByPk(req.params.id);
    if (!orderStatus) {
      return res.status(404).json({ error: '주문 상태를 찾을 수 없습니다.' });
    }
    res.json(orderStatus);
  } catch (error) {
    console.error('주문 상태 조회 중 오류 발생:', error);
    res.status(500).json({ error: '주문 상태 조회 중 오류가 발생했습니다.' });
  }
};

// 주문 상태 생성
exports.createOrderStatus = async (req, res) => {
  try {
    const orderStatus = await OrderStatus.create(req.body);
    res.status(201).json(orderStatus);
  } catch (error) {
    console.error('주문 상태 생성 중 오류 발생:', error);
    res.status(500).json({ error: '주문 상태 생성 중 오류가 발생했습니다.' });
  }
};

// 주문 상태 수정
exports.updateOrderStatus = async (req, res) => {
  try {
    const [updated] = await OrderStatus.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: '주문 상태를 찾을 수 없습니다.' });
    }
    const updatedOrderStatus = await OrderStatus.findByPk(req.params.id);
    res.json(updatedOrderStatus);
  } catch (error) {
    console.error('주문 상태 수정 중 오류 발생:', error);
    res.status(500).json({ error: '주문 상태 수정 중 오류가 발생했습니다.' });
  }
};

// 주문 상태 삭제
exports.deleteOrderStatus = async (req, res) => {
  try {
    const deleted = await OrderStatus.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: '주문 상태를 찾을 수 없습니다.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('주문 상태 삭제 중 오류 발생:', error);
    res.status(500).json({ error: '주문 상태 삭제 중 오류가 발생했습니다.' });
  }
}; 