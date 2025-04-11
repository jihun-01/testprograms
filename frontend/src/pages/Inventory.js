import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InventoryList from '../components/inventory/InventoryList';
import InventoryForm from '../components/inventory/InventoryForm';
import InventoryDetail from '../components/inventory/InventoryDetail';

const Inventory = () => {
  return (
    <Routes>
      <Route path="/" element={<InventoryList />} />
      <Route path="/new" element={<InventoryForm />} />
      <Route path="/:id" element={<InventoryDetail />} />
      <Route path="/:id/edit" element={<InventoryForm />} />
    </Routes>
  );
};

export default Inventory;