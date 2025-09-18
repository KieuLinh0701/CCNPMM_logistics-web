import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import officeReducer from './officeSlice';
import employeeReducer from './employeeSlice';
import serviceTypeReducer from './serviceTypeSlice';
import orderReducer from './orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    office: officeReducer,
    employee: employeeReducer,
    serviceType: serviceTypeReducer,
    order: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

