import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bankAccountAPI } from '../services/api';
import { BankAccount, BankAccountResponse, BankAccountState } from '../types/bankAccount';

const initialState: BankAccountState = {
  account: null,
  accounts: [],
  message: null,
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
};

// Lấy danh sách tài khoản của user
export const listBankAccounts = createAsyncThunk<
  BankAccountResponse,
  void,
  { rejectValue: string }
>('bankAccounts/list', async (_, thunkAPI) => {
  try {
    const data = await bankAccountAPI.list();
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách tài khoản');
  }
});

// Thêm tài khoản mới
export const addBankAccount = createAsyncThunk<
  BankAccountResponse,
  Partial<BankAccount>,
  { rejectValue: string }
>('bankAccounts/add', async (payload, thunkAPI) => {
  try {
    const data = await bankAccountAPI.add(payload);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Thêm tài khoản thất bại');
  }
});

// Cập nhật tài khoản
export const updateBankAccount = createAsyncThunk<
  BankAccountResponse,
  { id: number; payload: Partial<BankAccount> },
  { rejectValue: string }
>('bankAccounts/update', async ({ id, payload }, thunkAPI) => {
  try {
    const data = await bankAccountAPI.update(id, payload);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Cập nhật tài khoản thất bại');
  }
});

// Xóa tài khoản
export const removeBankAccount = createAsyncThunk<
  BankAccountResponse,
  { id: number },
  { rejectValue: string }
>('bankAccounts/remove', async ({ id }, thunkAPI) => {
  try {
    const data = await bankAccountAPI.remove(id);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Xóa tài khoản thất bại');
  }
});

// Đặt tài khoản mặc định
export const setDefaultBankAccount = createAsyncThunk<
  BankAccountResponse,
  { id: number },
  { rejectValue: string }
>('bankAccounts/setDefault', async ({ id }, thunkAPI) => {
  try {
    const data = await bankAccountAPI.setDefault(id);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Đặt tài khoản mặc định thất bại');
  }
});

const bankAccountSlice = createSlice({
  name: 'bankAccount',
  initialState,
  reducers: {
    clearBankAccountError: (state) => {
      state.error = null;
    },
    setBankAccount: (state, action: PayloadAction<BankAccount>) => {
      state.account = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // listBankAccounts
      .addCase(listBankAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.accounts = action.payload.accounts || [];
          state.total = action.payload.total || state.accounts.length;
        }
      })
      .addCase(listBankAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // addBankAccount
      .addCase(addBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.account) {
          state.accounts.unshift(action.payload.account);
          state.total += 1;
        }
      })
      .addCase(addBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // updateBankAccount
      .addCase(updateBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.account) {
          const index = state.accounts.findIndex(acc => acc.id === action.payload.account!.id);
          if (index !== -1) state.accounts[index] = action.payload.account;
        }
      })
      .addCase(updateBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // removeBankAccount
      .addCase(removeBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.account) {
          state.accounts = state.accounts.filter(acc => acc.id !== action.payload.account!.id);
          state.total -= 1;
        }
      })
      .addCase(removeBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // setDefaultBankAccount
      .addCase(setDefaultBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.account) {
          state.accounts = state.accounts.map(acc =>
            acc.id === action.payload.account!.id ? action.payload.account! : { ...acc, isDefault: false }
          );
        }
      })
      .addCase(setDefaultBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBankAccountError, setBankAccount } = bankAccountSlice.actions;
export default bankAccountSlice.reducer;