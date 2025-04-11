import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ShipmentList from '../components/shipments/ShipmentList';
import ShipmentDetail from '../components/shipments/ShipmentDetail';

const Shipments = () => {
  return (
    <Routes>
      <Route path="/" element={<ShipmentList />} />
      <Route path="/:id" element={<ShipmentDetail />} />
    </Routes>
  );
};

export default Shipments;