import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';

const Products = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/new" element={<ProductForm />} />
      <Route path="/:id/edit" element={<ProductForm />} />
    </Routes>
  );
};

export default Products;