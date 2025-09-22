import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeAPI } from '../services/api';
import { Employee, EmployeeCheckResult, EmployeeResponse, EmployeeState } from '../types/employee';

const initialState: EmployeeState = {
  shifts: [],
  statuses: [],
  employee: null,
  employees: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  checkResult: null,
  importResults: null,
  totalImported: 0,
  totalFailed: 0,
  createdEmployees: [],
  failedEmployees: []
};

// Lấy Shift Enum
export const getShiftEnum = createAsyncThunk(
  'employee/getShift',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getShiftEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin ca làm việc thất bại');
    }
  }
);

// Lấy Status Enum
export const getStatusEnum = createAsyncThunk(
  'employee/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getStatusEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin trạng thái làm việc thất bại');
    }
  }
);

// Get Employees By Office
export const getEmployeesByOffice = createAsyncThunk<
  EmployeeResponse,
  {
    officeId: number;
    page: number;
    limit: number;
    searchText?: string;
    shift?: string;
    status?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'employee/getEmployeesByOffice',
  async ({ officeId, page, limit, searchText, shift, status, role, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (shift) params.append("shift", shift);
      if (status) params.append("status", status);
      if (role) params.append("role", role);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await employeeAPI.getEmployeesByOffice(officeId, params.toString()); 
      return data; 
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách nhân viên');
    }
  }
);

// Add Employee
export const addEmployee = createAsyncThunk<
  EmployeeResponse,
  { employee: Partial<Employee> }, // nhận vào object có key employee
  { rejectValue: string }
>(
  'employee/addEmployee',
  async ({ employee }, thunkAPI) => {
    try {
      // Gọi API
      const data = await employeeAPI.addEmployee(employee);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi thêm nhân viên');
    }
  }
);

// Check Before Add Employee
export const checkBeforeAddEmployee = createAsyncThunk<
  EmployeeCheckResult,
  { email: string; phoneNumber: string; officeId?: number },
  { rejectValue: string }
>(
  "employee/checkBeforeAdd",
  async ({ email, phoneNumber, officeId }, { rejectWithValue }) => {
    try {
      return await employeeAPI.checkBeforeAdd(email, phoneNumber, officeId);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi kiểm tra nhân viên");
    }
  }
);

// Update Employee
export const updateEmployee = createAsyncThunk<
  EmployeeResponse,
  { employee: Partial<Employee> },
  { rejectValue: string }
>(
  'employee/updateEmployee',
  async ({ employee }, thunkAPI) => {
    try {
      const data = await employeeAPI.updateEmployee(employee);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi cập nhật nhân viên');
    }
  }
);

// Import Employees
export const importEmployees = createAsyncThunk<
  EmployeeResponse, 
  { employees: Partial<Employee>[] }, 
  { rejectValue: string }
>(
  'employee/importEmployees',
  async ({ employees }, thunkAPI) => {
    try {
      const data = await employeeAPI.importEmployees(employees);
      return data; // backend trả về object giống như bạn thiết kế
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi import nhân viên');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
    setEmployee: (state, action: PayloadAction<Employee>) => {
      state.employee = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Shift In Employee
    builder
      .addCase(getShiftEnum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShiftEnum.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.shifts) {
          state.shifts = action.payload.shifts;
        }
      })
      .addCase(getShiftEnum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      // Get Status In Employee
      builder
        .addCase(getStatusEnum.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getStatusEnum.fulfilled, (state, action) => {
          state.loading = false;
          if (action.payload.success && action.payload.statuses) {
            state.statuses = action.payload.statuses;
          }
        })
        .addCase(getStatusEnum.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });

      // Get Employees By Office
      builder
        .addCase(getEmployeesByOffice.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getEmployeesByOffice.fulfilled, (state, action) => {
          state.loading = false;
          if (action.payload.success) {
            state.employees = action.payload.employees || [];
            state.total = action.payload.total || 0;
            state.page = action.payload.page || 1;
            state.limit = action.payload.limit || 10;
          }
        })
        .addCase(getEmployeesByOffice.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });

        // Add Employee
        builder
          .addCase(addEmployee.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(addEmployee.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload.success && action.payload.employee) {
              state.employees.unshift(action.payload.employee); 
            }
          })
          .addCase(addEmployee.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
          });

        // Check Before Add Employee
        builder
          .addCase(checkBeforeAddEmployee.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.checkResult = null;
          })
          .addCase(checkBeforeAddEmployee.fulfilled, (state, action) => {
            state.loading = false;
            state.checkResult = action.payload;
          })
          .addCase(checkBeforeAddEmployee.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            state.checkResult = null;
          });

        // Update Employee
        builder
          .addCase(updateEmployee.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(updateEmployee.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload.success && action.payload.employee) {
              const index = state.employees.findIndex(emp => emp.id === action.payload.employee?.id);
              if (index !== -1) {
                state.employees[index] = action.payload.employee;
              }
              state.employee = action.payload.employee; 
            }
          })
          .addCase(updateEmployee.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
          });
        
        // Import Employees
        builder
          .addCase(importEmployees.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(importEmployees.fulfilled, (state, action) => {
            state.loading = false;

            const importData = action.payload.result; // <-- dùng result nested

            if (importData?.success) {
              state.importResults = importData.results || null;
              state.totalImported = importData.totalImported || 0;
              state.totalFailed = importData.totalFailed || 0;
              state.createdEmployees = importData.createdEmployees || [];
              state.failedEmployees = importData.failedEmployees || [];

              // Nếu có employee thành công, thêm vào danh sách
              importData.results?.forEach(r => {
                if (r.success && r.employee) {
                  state.employees.unshift(r.employee);
                }
              });
            }
          })
          .addCase(importEmployees.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            state.importResults = null;
            state.totalImported = 0;
            state.totalFailed = 0;
            state.createdEmployees = [];
            state.failedEmployees = [];
          });

  },
});

export const { clearEmployeeError, setEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
