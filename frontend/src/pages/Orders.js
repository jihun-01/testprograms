import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OrderList from '../components/orders/OrderList';
import OrderDetail from '../components/orders/OrderDetail';
import OrderForm from '../components/orders/OrderForm';

const Orders = () => {
  return (
    <Routes>
      <Route path="/" element={<OrderList />} />
      <Route path="/new" element={<OrderForm />} />
      <Route path="/:id" element={<OrderDetail />} />
    </Routes>
  );
};

export default Orders;