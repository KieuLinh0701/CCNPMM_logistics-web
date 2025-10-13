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
import ShippingFee from './pages/tracking/ShippingFee';
import './App.css';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerLayout from './layouts/ManagerLayout';
import { PrivateRoute } from './components/PrivateRoute';
import ForgotPasswordForm from './pages/ForgotPasswordForm';
import Profile from './pages/Profile';
import Office from './pages/manager/Office';
import Warehouse from './pages/manager/Warehouse';
import EmployeePage from './pages/manager/EmployeeForm';
import CreateOrder from './pages/manager/CreateOrder';
import UserDashboard from './pages/user/Dashboard';
import UserLayout from './layouts/UserLayout';
import OrderList from './pages/user/order/list/OrderList';
import CreateOrderUser from './pages/user/CreateOrder';
import OrderDetail from './pages/user/order/detail/OrderDetail';
import OrderSuccess from './pages/user/order/success_fail/OrderSuccess';
import OrderEdit from './pages/user/order/edit/OrderEdit';
import OrderListManager from './pages/manager/order/list/OrderList';
import Products from './pages/user/product/Products';
import Vehicles from './pages/manager/vehicle/Vehicles';
import ShippingRequests from './pages/user/order/request/ShippingRequests';
import { AuthRoute } from './components/AuthRoute';
import SupportManager from './pages/manager/order/request/SupportManager';

const App: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <Provider store={store}>
      <ConfigProvider locale={viVN}>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Trang Home */}
            <Route path="/home" element={<Home />} />
            <Route path="/tracking/shipping-fee" element={<ShippingFee />} />

            {/* Login/Register */}
            <Route path="/login" element={<AuthRoute type="public"><LoginForm /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute type="public"><RegisterForm /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute type="public"><ForgotPasswordForm /></AuthRoute>} />

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
              <Route path="orders/list" element={<OrderListManager />} />
              <Route path="orders/create" element={<CreateOrder />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="supports" element={<SupportManager />} />
            </Route>

            <Route path="/user" element={<PrivateRoute roles={["user"]}><UserLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/requests" element={<ShippingRequests />} />
              <Route path="orders/create" element={<CreateOrderUser />} />
              <Route path="orders/edit/:trackingNumber" element={<OrderEdit />} />
              <Route path="orders/success/:trackingNumber" element={<OrderSuccess />} />
              <Route path="orders/failed/:trackingNumber" element={<OrderSuccess />} />
              <Route path="orders/detail/:trackingNumber" element={<OrderDetail />} />
            </Route>

          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;