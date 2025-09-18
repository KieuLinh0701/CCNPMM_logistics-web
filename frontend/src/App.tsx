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
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerLayout from './layouts/ManagerLayout';
import { PrivateRoute } from './components/PrivateRoute';
import ForgotPasswordForm from './pages/ForgotPasswordForm';
import { PublicRoute } from './components/PublicRoute';
import Profile from './pages/Profile';
import Office from './pages/manager/Office';
import Warehouse from './pages/manager/Warehouse';
import EmployeePage from './pages/manager/EmployeeForm';
import CreateOrder from './pages/manager/CreateOrder';

const App: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!user?.token;

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
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/manager" element={<PrivateRoute roles={["manager"]}><ManagerLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="office" element={<Office />} />
              <Route path="warehouse" element={<Warehouse />} />
              <Route path="employees/list" element={<EmployeePage />} />
              <Route path="orders/list" element={<EmployeePage />} />
              <Route path="orders/create" element={<CreateOrder />} />
            </Route>

          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;