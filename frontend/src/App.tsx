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
import ShippingFee from './pages/tracking/shippingFee/ShippingFee';
import OrderTracking from './pages/tracking/orderTracking/OrderTracking';
import CompanyInfo from './pages/info/CompanyInfo';
import ContactForm from './pages/info/ContactForm';
import ServiceDetails from './pages/info/ServiceDetails';
import ShippingRates from './pages/info/ShippingRates';
import './App.css';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPostOffices from './pages/admin/PostOffices';
import AdminServiceTypes from './pages/admin/ServiceTypes';
import AdminOrders from './pages/admin/Orders';
import AdminFees from './pages/admin/Fees';
import AdminReports from './pages/admin/Reports';
import AdminVehicles from './pages/admin/Vehicles';
import PromotionManagement from './pages/admin/PromotionManagement';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerLayout from './layouts/ManagerLayout';
import { PrivateRoute } from './components/PrivateRoute';
import ForgotPasswordForm from './pages/ForgotPasswordForm';
import Profile from './pages/Profile';
import Office from './pages/manager/Office';
import Warehouse from './pages/manager/Warehouse';
import EmployeePage from './pages/manager/EmployeeForm';
import CreateOrder from './pages/manager/CreateOrder';
import UserLayout from './layouts/UserLayout';
import OrderList from './pages/user/order/list/OrderList';
import OrderDetail from './pages/user/order/detail/OrderDetail';
import OrderSuccess from './pages/user/order/success_fail/OrderSuccess';
import OrderEdit from './pages/user/order/edit/OrderEdit';
import OrderListManager from './pages/manager/order/list/OrderList';
import Products from './pages/user/product/Products';
import Vehicles from './pages/manager/vehicle/Vehicles';
import ShippingRequests from './pages/user/order/request/ShippingRequests';
import { AuthRoute } from './components/AuthRoute';
import SupportManager from './pages/manager/order/request/SupportManager';
import ShipperLayout from './layouts/ShipperLayout';
import ShipperDashboard from './pages/shipper/Dashboard';
import ShipperOrders from './pages/shipper/Orders';
import ShipperOrderDetail from './pages/shipper/OrderDetail';
import ShipperDeliveryUpdate from './pages/shipper/DeliveryUpdate';
import ShipperPostOfficeHandover from './pages/shipper/PostOfficeHandover';
import ShipperCODManagement from './pages/shipper/CODManagement';
import ShipperIncidentReport from './pages/shipper/IncidentReport';
import ShipperDeliveryHistory from './pages/shipper/DeliveryHistory';
import ShipperDeliveryRoute from './pages/shipper/DeliveryRoute';
import ShipperNotifications from './pages/shipper/Notifications';
import UnassignedOrders from './pages/shipper/UnassignedOrders';
import ShippingFeeBody from './pages/tracking/shippingFee/ShippingFeeBody';
import OfficeSearchBody from './pages/tracking/officeSearch/OfficeSearchBody';
import OfficeSearch from './pages/tracking/officeSearch/OfficeSearch';
import ShippingRatesBody from './pages/info/shippingRate/shippingRatesBody';
import OrderCreate from './pages/user/order/create/OrderCreate';
import OrderCreateManager from './pages/manager/order/create/OrderCreate';
import OrderEditManager from './pages/manager/edit/OrderEdit';
import UserDashboard from './pages/user/dashboard/Dashboard';
import TransactionList from './pages/user/revenue/TransactionList';

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

            {/* Public tracking pages */}
            <Route path="/tracking/shipping-fee" element={<ShippingFee />} />
            <Route path="/tracking/order-tracking" element={<OrderTracking />} />
            <Route path="/tracking/office-search" element={<OfficeSearch />} />

            {/* Public info pages */}
            <Route path="/info/company" element={<CompanyInfo />} />
            <Route path="/info/contact" element={<ContactForm />} />
            <Route path="/info/services" element={<ServiceDetails />} />
            <Route path="/info/shipping-rates" element={<ShippingRates />} />

            {/* Login/Register */}
            <Route path="/login" element={<AuthRoute type="public"><LoginForm /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute type="public"><RegisterForm /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute type="public"><ForgotPasswordForm /></AuthRoute>} />

            <Route path="/admin" element={<PrivateRoute roles={["admin"]}><AdminLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="postoffices" element={<AdminPostOffices />} />
              <Route path="servicetypes" element={<AdminServiceTypes />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/create" element={<CreateOrder />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/manager" element={<PrivateRoute roles={["manager"]}><ManagerLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="office" element={<Office />} />
              <Route path="warehouse" element={<Warehouse />} />
              <Route path="employees/list" element={<EmployeePage />} />
              <Route path="orders" element={<OrderListManager />} />
              <Route path="orders/create" element={<OrderCreateManager />} />
              <Route path="orders/edit/:trackingNumber" element={<OrderEditManager />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="supports" element={<SupportManager />} />
            </Route>

            <Route path="/user" element={<PrivateRoute roles={["user"]}><UserLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/requests" element={<ShippingRequests />} />
              <Route path="orders/create" element={<OrderCreate />} />
              <Route path="orders/create/edit-profile" element={<Profile />} />
              <Route path="orders/edit/:trackingNumber" element={<OrderEdit />} />
              <Route path="orders/success/:trackingNumber" element={<OrderSuccess />} />
              <Route path="orders/failed/:trackingNumber" element={<OrderSuccess />} />
              <Route path="orders/detail/:trackingNumber" element={<OrderDetail />} />
              <Route path="info/shipping-rates" element={<ShippingRatesBody />} />
              <Route path="tracking/shipping-fee" element={<ShippingFeeBody />} />
              <Route path="tracking/office-search" element={<OfficeSearchBody />} />
              <Route path="transactions" element={<TransactionList />} />
            </Route>

            <Route path="/shipper" element={<PrivateRoute roles={["shipper"]}><ShipperLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<ShipperDashboard />} />
              <Route path="orders" element={<ShipperOrders />} />
              <Route path="orders-unassigned" element={<UnassignedOrders />} />
              <Route path="orders/:id" element={<ShipperOrderDetail />} />
              <Route path="delivery/:id" element={<ShipperDeliveryUpdate />} />
              <Route path="pickup" element={<ShipperPostOfficeHandover />} />
              <Route path="cod" element={<ShipperCODManagement />} />
              <Route path="report" element={<ShipperIncidentReport />} />
              <Route path="history" element={<ShipperDeliveryHistory />} />
              <Route path="route" element={<ShipperDeliveryRoute />} />
              <Route path="notifications" element={<ShipperNotifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;