import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderAPI } from '../services/api';
import { Order, OrderState } from '../types/order';

const initialState: OrderState = {
  loading: false,
  error:  null,
  order: null,
  shippingFee: 0, 
};

// Tính phí vận chuyển
export const calculateShippingFee = createAsyncThunk(
  'orders/calculate-shipping-fee',
  async (
    {
      weight,
      serviceTypeId,
      senderCodeCity,
      recipientCodeCity,
    }: {
      weight: number;
      serviceTypeId: number;
      senderCodeCity: number;
      recipientCodeCity: number;
    },
    { rejectWithValue }
  ) => {
    try {
      // Gọi API với query params
      const response = await orderAPI.calculateShippingFee(
        weight,
        serviceTypeId,
        senderCodeCity,
        recipientCodeCity
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Tính phí vận chuyển thất bại'
      );
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    setOrder: (state, action: PayloadAction<Order>) => {
      state.order = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Calculate Shipping Fee
    builder
      .addCase(calculateShippingFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateShippingFee.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && typeof action.payload.shippingFee === 'number') {
          state.shippingFee = action.payload.shippingFee;
        }
      })
      .addCase(calculateShippingFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
  },
});

export const { clearOrderError, setOrder } = orderSlice.actions;
export default orderSlice.reducer;
