export interface Employee {
  id?: number;
  hireDate?: Date;
  shift?: string;
  status?: string;
  user?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
  };
  office?: {
    id?: number;
  };
}

export interface ImportResult {
  email: string;
  success: boolean;
  message: string;
  employee?: Employee | null;
}

export interface EmployeeResponseInner {
  success: boolean;
  message?: string;
  totalImported?: number;
  totalFailed?: number;
  createdEmployees?: string[];
  failedEmployees?: { email: string; message: string }[];
  results?: ImportResult[];
}

export interface EmployeeResponse {
  success: boolean;
  message?: string;
  employee?: Employee;
  employees?: Employee[];
  shifts?: string[];
  statuses?: string[];
  total?: number;
  page?: number;
  limit?: number;

  // Cho importEmployees
  result?: EmployeeResponseInner; 
}

export interface EmployeeCheckResult {
  success: boolean;
  exists: boolean;
  isEmployee?: boolean;
  user?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
  };
  message?: string;
}

export interface EmployeeState {
  shifts: string[];
  statuses: string[];
  employee: Employee | null;
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  checkResult: EmployeeCheckResult | null;

  // Kết quả import
  importResults: ImportResult[] | null;
  totalImported?: number;
  totalFailed?: number;
  createdEmployees?: string[];
  failedEmployees?: { email: string; message: string }[];
}