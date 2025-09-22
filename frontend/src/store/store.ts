import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import officeReducer from './officeSlice';
import employeeReducer from './employeeSlice';
import serviceTypeReducer from './serviceTypeSlice';
import orderReducer from './orderSlice';
import productReducer from './productSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    office: officeReducer,
    employee: employeeReducer,
    serviceType: serviceTypeReducer,
    order: orderReducer,
    product: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

