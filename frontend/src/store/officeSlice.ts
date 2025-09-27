import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { officeAPI } from '../services/api';
import { Office, OfficeResponse, OfficeState } from '../types/office';

const initialState: OfficeState = {
  office: null,
  loading: false,
  error: null,
};

// Lấy office theo userId
export const getByUserId = createAsyncThunk(
  'office/getByUserId',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await officeAPI.getByUserId(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xem thông tin bưu cục thất bại');
    }
  }
);

// Update office
export const updateOffice = createAsyncThunk<
  OfficeResponse,         // kiểu trả về
  Partial<Office>,        // input: partial office, đã có id
  { rejectValue: string }
>(
  'office/update',
  async (officeData, { rejectWithValue }) => {
    try {
      if (!officeData.id) {
        return rejectWithValue('Office id không tồn tại');
      }

      // Gọi API update, token đã được tự động thêm qua interceptor
      const response = await officeAPI.update(officeData);

      return response; // officeAPI.update đã trả về response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi cập nhật office');
    }
  }
);

const officeSlice = createSlice({
  name: 'office',
  initialState,
  reducers: {
    clearOfficeError: (state) => {
      state.error = null;
    },
    setOffice: (state, action: PayloadAction<Office>) => {
      state.office = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get By UserId
    builder
      .addCase(getByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getByUserId.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.office) {
          state.office = action.payload.office;
        }
      })
      .addCase(getByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Office
    builder
      .addCase(updateOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOffice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.office) {
          state.office = action.payload.office;
        }
      })
      .addCase(updateOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOfficeError, setOffice } = officeSlice.actions;
export default officeSlice.reducer;
