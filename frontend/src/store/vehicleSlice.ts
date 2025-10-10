import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ImportVehicleResult, ImportVehiclesResponse, Vehicle, VehicleResponse, VehicleState } from '../types/vehicle';
import { vehicleAPI } from '../services/api';

const initialState: VehicleState = {
  loading: false,
  error: null,
  vehicle: null,
  vehicles: [],
  total: 0,
  page: 1,
  limit: 10,
  statuses: [],
  types: [],
  importResults: [], 
  totalImported: 0,
  totalFailed: 0,
};

export const getTypesEnum = createAsyncThunk(
  'products/types',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getTypesEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy loại phương tiện thất bại');
    }
  }
);

export const getStatusesEnum = createAsyncThunk(
  'products/statuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getStatusesEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy trạng thái phương tiện thất bại');
    }
  }
);

export const getVehiclesByOffice = createAsyncThunk<
  VehicleResponse,
  {
    officeId: number;
    page: number,
    limit: number,
    searchText?: string;
    type?: string;
    status?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'vehicles/by-office',
  async ({ officeId, page, limit, searchText, type, status, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (type) params.append("type", type);
      if (status) params.append("status", status);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await vehicleAPI.getVehiclesByOffice(officeId, params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm của cửa hàng');
    }
  }
);

// Add Vehicle
export const addVehicle = createAsyncThunk<
  VehicleResponse,
  {
    officeId: number;
    vehicle: Partial<Vehicle>;
  },
  { rejectValue: string }
>(
  'vehicles/add',
  async ({ officeId, vehicle }, thunkAPI) => {
    try {
      const data = await vehicleAPI.addVehicle(officeId, vehicle);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi thêm phương tiện');
    }
  }
);

// Update Vehicle
export const updateVehicle = createAsyncThunk<
  VehicleResponse,
  { vehicle: Partial<Vehicle> },
  { rejectValue: string }
>(
  'vehicles/edit',
  async ({ vehicle }, thunkAPI) => {
    try {
      const data = await vehicleAPI.updateVehicle(vehicle);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi cập nhật phương tiện');
    }
  }
);


export const importVehicles = createAsyncThunk<
  ImportVehiclesResponse,
  {
    officeId: number;
    vehicles: Partial<Vehicle>[];
  },
  { rejectValue: string }
>(
  'vehicles/import',
  async ({ officeId, vehicles }, thunkAPI) => {
    try {
      const data = await vehicleAPI.importVehicles(officeId, vehicles);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err || 'Lỗi khi import phương tiện');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    clearVehicleError: (state) => {
      state.error = null;
    },
    setVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.vehicle = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Statused 
    builder
      .addCase(getStatusesEnum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStatusesEnum.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getStatusesEnum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // Get Types Enum
    builder
      .addCase(getTypesEnum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTypesEnum.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.types) {
          state.types = action.payload.types;
        }
      })
      .addCase(getTypesEnum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getVehiclesByOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVehiclesByOffice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.vehicles = action.payload.vehicles || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getVehiclesByOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const newVehicle = action.payload.vehicle;
        if (action.payload.success && newVehicle) {
          state.vehicles = [newVehicle, ...(state.vehicles || [])];
        }
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.vehicle) {
          const index = state.vehicles.findIndex(emp => emp.id === action.payload.vehicle?.id);
          if (index !== -1) {
            state.vehicles[index] = action.payload.vehicle;
          }
          state.vehicle = action.payload.vehicle;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(importVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importVehicles.fulfilled, (state, action) => {
        state.loading = false;

        const importData = action.payload;

        if (importData.success) {
          state.importResults = importData.results || []
          state.totalImported = importData.totalImported || 0;
          state.totalFailed = importData.totalFailed || 0;

          // Thêm vehicles thành công vào danh sách
          importData.results?.forEach((r: ImportVehicleResult) => {
            if (r.success && r.vehicle) {
              state.vehicles.unshift(r.vehicle);
            }
          })
        }
      })
      .addCase(importVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.importResults = null;
        state.totalImported = 0;
        state.totalFailed = 0;
      });
  },
});

export const { clearVehicleError, setVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;