import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { serviceType, ServiceTypeState } from '../types/serviceType';
import { serviceTypeAPI } from '../services/api';

const initialState: ServiceTypeState = {
  serviceType: null,
  serviceTypes: [],
  loading: false,
  error:  null,
  shippingFee: 0,
};

// Lấy Service Type đang Active
export const getActiveServiceTypes = createAsyncThunk(
  'services/get-active',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceTypeAPI.getActiveServiceTypes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách dịch vụ vận chuyển thất bại');
    }
  }
);

const serviceTypeSlice = createSlice({
  name: 'serviceType',
  initialState,
  reducers: {
    clearServiceTypeError: (state) => {
      state.error = null;
    },
    setServiceType: (state, action: PayloadAction<serviceType>) => {
      state.serviceType = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Active Service Types
    builder
      .addCase(getActiveServiceTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveServiceTypes.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.serviceTypes) {
          state.serviceTypes = action.payload.serviceTypes;
        }
      })
      .addCase(getActiveServiceTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearServiceTypeError, setServiceType } = serviceTypeSlice.actions;
export default serviceTypeSlice.reducer;
