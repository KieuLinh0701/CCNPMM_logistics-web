// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { store } from './store/store';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import Home from './pages/Home';
import './App.css';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPostOffices from './pages/admin/PostOffices';
import AdminServiceTypes from './pages/admin/ServiceTypes';
import AdminOrders from './pages/admin/Orders';
import AdminFees from './pages/admin/Fees';
import AdminReports from './pages/admin/Reports';
import AdminServices from './pages/admin/Services';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerLayout from './layouts/ManagerLayout';
import { PrivateRoute } from './components/PrivateRoute';
import ForgotPasswordForm from './pages/ForgotPasswordForm';
import { PublicRoute } from './components/PublicRoute';
import Profile from './pages/Profile';

const App: React.FC = () => {

  return (
    <Provider store={store}>
      <ConfigProvider locale={viVN}>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Trang Home */}
            <Route path="/home" element={<Home />} />

            {/* Login/Register */}
            <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordForm /></PublicRoute>} />

            <Route path="/admin" element={<PrivateRoute roles={["admin"]}><AdminLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="postoffices" element={<AdminPostOffices />} />
              <Route path="servicetypes" element={<AdminServiceTypes />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/manager" element={<PrivateRoute roles={["manager"]}><ManagerLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="profile" element={<Profile />} />
            </Route>

          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;