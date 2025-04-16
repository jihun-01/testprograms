const { Customer } = require('../models');
const { measureDbQuery } = require('../utils/metrics');

// 모든 고객 조회
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    console.error('고객 조회 중 오류 발생:', error);
    res.status(500).json({ error: '고객 조회 중 오류가 발생했습니다.' });
  }
};

// 특정 고객 조회
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: '고객을 찾을 수 없습니다.' });
    }
    res.json(customer);
  } catch (error) {
    console.error('고객 조회 중 오류 발생:', error);
    res.status(500).json({ error: '고객 조회 중 오류가 발생했습니다.' });
  }
};

// 고객 생성
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.error('고객 생성 중 오류 발생:', error);
    res.status(500).json({ error: '고객 생성 중 오류가 발생했습니다.' });
  }
};

// 고객 정보 수정
exports.updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ error: '고객을 찾을 수 없습니다.' });
    }
    const updatedCustomer = await Customer.findByPk(req.params.id);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('고객 정보 수정 중 오류 발생:', error);
    res.status(500).json({ error: '고객 정보 수정 중 오류가 발생했습니다.' });
  }
};

// 고객 삭제
exports.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ error: '고객을 찾을 수 없습니다.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('고객 삭제 중 오류 발생:', error);
    res.status(500).json({ error: '고객 삭제 중 오류가 발생했습니다.' });
  }
}; 