import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderAPI } from '../services/api';
import { Order, OrderResponse, OrderState } from '../types/order';

const initialState: OrderState = {
  loading: false,
  error: null,
  order: null,
  orders: [],
  shippingFee: 0,
  total: 0,
  page: 1,
  limit: 10,
  statuses: [],
  paymentMethods: [],
  payers: [],
  paymentStatuses: [],
  paymentUrl: null,
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

// Lấy Status Enum
export const getStatusesEnum = createAsyncThunk(
  'orders/statuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getStatusesEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin trạng thái đơn hàng thất bại');
    }
  }
);

// Lấy Status Enum
export const getPaymentMethodsEnum = createAsyncThunk(
  'orders/payment-methods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getPaymentMethodsEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin phương thức thanh toán thất bại');
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/create",
  async (order: Order, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createOrder(order);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Check trạng thái thanh toán VNPay
export const checkVNPayPayment = createAsyncThunk<
  any,
  string,
  { rejectValue: any }
>(
  'payment/check-vnpay',
  async (query, { rejectWithValue }) => {
    try {
      const data = await orderAPI.checkVNPayPayment(query);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getOrdersByUser = createAsyncThunk<
  OrderResponse,
  {
    page: number,
    limit: number,
    searchText?: string;
    payer?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    cod?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'orders/by-user',
  async ({ page, limit, searchText, payer, status, paymentStatus, paymentMethod, cod, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (payer) params.append("payer", payer);
      if (status) params.append("status", status);
      if (paymentStatus) params.append("paymentStatus", paymentStatus);
      if (paymentMethod) params.append("paymentMethod", paymentMethod);
      if (cod) params.append("cod", cod);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await orderAPI.getOrdersByUser(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng của cửa hàng');
    }
  }
);

// Lấy Payer Enum
export const getPayersEnum = createAsyncThunk(
  'orders/payers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getPayersEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin người thanh toán đơn hàng thất bại');
    }
  }
);

// Lấy Payment Status Enum
export const getPaymentStatusesEnum = createAsyncThunk(
  'orders/payment-statuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getPaymentStatusesEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin trạng thái thanh toán đơn hàng thất bại');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancel",
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelOrder(orderId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data.message || "Hủy đơn hàng thất bại");
    }
  }
);

// Lấy thông tin 1 đơn hàng theo orderId
export const getOrderByTrackingNumber = createAsyncThunk<
  OrderResponse,
  string,
  { rejectValue: string }
>(
  'orders/by-tracking-number',
  async (trackingNumber, { rejectWithValue }) => {
    try {
      const data = await orderAPI.getOrderByTrackingNumber(trackingNumber);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lấy thông tin đơn hàng thất bại');
    }
  }
);

export const createVNPayURL = createAsyncThunk<
  OrderResponse,
  number,
  { rejectValue: any }
>(
  'payment/create-url',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await orderAPI.createVNPayURL(orderId);
      return data as OrderResponse;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/edit",
  async (order: Order, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateOrder(order);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateOrderStatusToPending = createAsyncThunk(
  "orders/to-pending",
  async (payload: { orderId: number }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateOrderStatusToPending(payload.orderId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getOrdersByOffice = createAsyncThunk<
  OrderResponse,
  {
    officeId: number;
    page: number,
    limit: number,
    searchText?: string;
    payer?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    cod?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
    senderWard?: number;
    recipientWard?: number;
  },
  { rejectValue: string }
>(
  'orders/by-office',
  async ({ officeId, page, limit, searchText, payer, status, paymentStatus, paymentMethod, cod, startDate, endDate, senderWard, recipientWard, sort }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (payer) params.append("payer", payer);
      if (status) params.append("status", status);
      if (paymentStatus) params.append("paymentStatus", paymentStatus);
      if (paymentMethod) params.append("paymentMethod", paymentMethod);
      if (cod) params.append("cod", cod);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (senderWard) params.append("senderWard", senderWard.toString());
      if (recipientWard) params.append("recipientWard", recipientWard.toString());

      const data = await orderAPI.getOrdersByOffice(officeId, params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng của bưu cục');
    }
  }
);

export const confirmOrderAndAssignToOffice = createAsyncThunk(
  'orders/confirm',
  async (
    { orderId, officeId }: { orderId: number; officeId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderAPI.confirmOrderAndAssignToOffice(orderId, officeId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Xác nhận đơn hàng thất bại'
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

    // Get Statuses
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

    // Get Payment Methods 
    builder
      .addCase(getPaymentMethodsEnum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentMethodsEnum.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.paymentMethods) {
          state.paymentMethods = action.payload.paymentMethods;
        }
      })
      .addCase(getPaymentMethodsEnum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Orders By User
    builder
      .addCase(getOrdersByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.orders = action.payload.orders || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getOrdersByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Payers
    builder
      .addCase(getPayersEnum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayersEnum.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.payers) {
          state.payers = action.payload.payers;
        }
      })
      .addCase(getPayersEnum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Payment Statuses
    builder
      .addCase(getPaymentStatusesEnum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentStatusesEnum.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.paymentStatuses) {
          state.paymentStatuses = action.payload.paymentStatuses;
        }
      })
      .addCase(getPaymentStatusesEnum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cancel Order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Order By Id
    builder
      .addCase(getOrderByTrackingNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByTrackingNumber.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.order = action.payload.order || null;
        }
      })
      .addCase(getOrderByTrackingNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create VNPay Url
    builder
      .addCase(createVNPayURL.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVNPayURL.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.paymentUrl) {
          state.paymentUrl = action.payload.paymentUrl;
        }
      })
      .addCase(createVNPayURL.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message || "Tạo URL thanh toán VNPay thất bại";
      });

    builder
      .addCase(checkVNPayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVNPayPayment.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(checkVNPayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Error";
      });

    // Update Order
    builder
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Order Status To Pending
    builder
      .addCase(updateOrderStatusToPending.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusToPending.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateOrderStatusToPending.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Orders By Office
    builder
      .addCase(getOrdersByOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByOffice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.orders = action.payload.orders || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getOrdersByOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(confirmOrderAndAssignToOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmOrderAndAssignToOffice.fulfilled, (state, action) => {
        state.loading = false;

        // Cập nhật order trong danh sách orders
        if (action.payload.success && action.payload.order) {
          const updatedOrder = action.payload.order;

          // Cập nhật trong mảng orders
          const orderIndex = state.orders.findIndex(order => order.id === updatedOrder.id);
          if (orderIndex !== -1) {
            state.orders[orderIndex] = {
              ...state.orders[orderIndex],
              ...updatedOrder,
              status: 'confirmed',
              toOffice: updatedOrder.toOffice,
            };
          }

          // Cập nhật order detail nếu đang xem chi tiết
          if (state.order && state.order.id === updatedOrder.id) {
            state.order = {
              ...state.order,
              ...updatedOrder,
              status: 'confirmed',
              toOffice: updatedOrder.toOffice
            };
          }
        }
      })
      .addCase(confirmOrderAndAssignToOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderError, setOrder } = orderSlice.actions;
export default orderSlice.reducer;