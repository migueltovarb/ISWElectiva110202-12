// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';  // ¡AÑADE ESTA LÍNEA!
import PrivateRoute from './components/PrivateRoute';
import useStore from './store/useStore';
import api from './config/axios';
import AdminRoute from './components/AdminRoute';
import OrderStatus from './pages/OrderStatus';
import OrderHistory from './pages/OrderHistory';
import AdminDashboardComplete from './pages/AdminDashboardComplete';
import Profile from './pages/Profile';
import PaymentMethods from './pages/PaymentMethods';
import Support from './pages/Support';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  const setUser = useStore((state) => state.setUser);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/user/me/')
        .then(response => setUser(response.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, [setUser]);
  
  return (
    <Router>
      <div className="min-h-screen w-full bg-morado-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/cart" element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            } />
            <Route path="/checkout" element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } />
            <Route path="/pedidos" element={
              <PrivateRoute>
                <OrderHistory />
              </PrivateRoute>
            } />
            <Route path="/pedido/:id" element={
              <PrivateRoute>
                <OrderStatus />
              </PrivateRoute>
            } />
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboardComplete />
              </AdminRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/payment-methods" element={
              <PrivateRoute>
                <PaymentMethods />
              </PrivateRoute>
            } />
            <Route path="/support" element={
              <PrivateRoute>
                <Support />
              </PrivateRoute>
            } />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;