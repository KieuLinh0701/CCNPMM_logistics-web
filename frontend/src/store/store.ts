import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import officeReducer from './officeSlice';
import employeeReducer from './employeeSlice';
import serviceTypeReducer from './serviceTypeSlice';
import orderReducer from './orderSlice';
import productReducer from './productSlice';
import promotionReducer from './promotionSlice';
import vehicleReducer from './vehicleSlice';
import shippingRequestReducer from './shippingRequestSlice';
import transactionReducer from './transactionSlice';
import paymentSubmissionReducer from './paymentSubmissionSlice';
import orderHistoryReducer from './orderHistorySlice';
import shipmentReducer from './shipmentSlice';
import bankAccountReducer from './bankAccountSlice';
import incidentReportReducer from './incidentReportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    office: officeReducer,
    employee: employeeReducer,
    serviceType: serviceTypeReducer,
    order: orderReducer,
    product: productReducer,
    promotion: promotionReducer,
    vehicle: vehicleReducer,
    request: shippingRequestReducer,
    transaction: transactionReducer,
    submission: paymentSubmissionReducer,
    orderHistory: orderHistoryReducer,
    shipment: shipmentReducer,
    bankAccount: bankAccountReducer,
    incident: incidentReportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

