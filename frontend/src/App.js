import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Shipments from './pages/Shipments';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/common/assets/styles/app.css';

function App() {
  return (
    <div className="App" style={{ minWidth: '320px' }}>
       <Provider store={store}>
         <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />                <Route path="products/*" element={<Products />} />
              <Route path="warehouses/*" element={<Warehouses />} />
              <Route path="inventory/*" element={<Inventory />} />
              <Route path="orders/*" element={<Orders />} />
              <Route path="shipments/*" element={<Shipments />} />
              <Route path="*" element={<NotFound />} />
            </Route>            </Routes>
          </Router>
        </Provider>
      </div>
  );
}

export default App;