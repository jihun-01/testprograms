import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WarehouseList from '../components/warehouses/WarehouseList';
import WarehouseForm from '../components/warehouses/WarehouseForm';
import WarehouseDetail from '../components/warehouses/WarehouseDetail';

const Warehouses = () => {
  return (
    <Routes>
      <Route path="/" element={<WarehouseList />} />
      <Route path="/new" element={<WarehouseForm />} />
      <Route path="/:id" element={<WarehouseDetail />} />
      <Route path="/:id/edit" element={<WarehouseForm />} />
    </Routes>
  );
};

export default Warehouses;