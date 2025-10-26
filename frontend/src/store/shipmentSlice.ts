import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { shipmentAPI } from '../services/api';
import { Shipment, ShipmentResponse, ShipmentState } from '../types/shipment';

const initialState: ShipmentState = {
  shipment: null,
  shipments: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  statuses: [],
  exportShipments: [],
};

export const getShipmentStatuses = createAsyncThunk(
  'shipments/getShipmentStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await shipmentAPI.getShipmentStatuses();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy trạng thái chuyến xe thất bại');
    }
  }
);

export const listEmployeeShipments = createAsyncThunk<
  ShipmentResponse,
  {
    employeeId: number;
    page: number,
    limit: number,
    status?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'shipments/listUserTransactions',
  async ({ employeeId, page, limit, status, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) params.append("status", status);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await shipmentAPI.listEmployeeShipments(employeeId, params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách chuyến xe của nhân viên');
    }
  }
);

export const exportEmployeeShipments = createAsyncThunk<
  ShipmentResponse,
  {
    employeeId: number;
    status?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'shipments/exportEmployeeShipments',
  async ({ employeeId, status, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
      });
      if (status) params.append("status", status);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await shipmentAPI.exportEmployeeShipments(employeeId, params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách chuyến xe của nhân viên để xuất báo cáo');
    }
  }
);

const shipmentSlice = createSlice({
  name: 'shipment',
  initialState,
  reducers: {
    clearShipmentError: (state) => {
      state.error = null;
    },
    setshipment: (state, action: PayloadAction<Shipment>) => {
      state.shipment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShipmentStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShipmentStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getShipmentStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(listEmployeeShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listEmployeeShipments.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.shipments = action.payload.shipments || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(listEmployeeShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(exportEmployeeShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportEmployeeShipments.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.exportShipments = action.payload.exportShipments || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(exportEmployeeShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearShipmentError, setshipment } = shipmentSlice.actions;
export default shipmentSlice.reducer;