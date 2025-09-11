export interface Office {
  id: number;
  code: string;
  name: string;
  address: string;
  codeWard: number;
  codeCity: number;
  latitude: number;
  longitude: number;
  email: string;
  phoneNumber: string;
  openingTime: string;
  closingTime: string;
  type: 'Head Office' | 'Post Office';
  status: 'Active' | 'Inactive' | 'Maintenance';
}

export interface OfficeResponse {
  success: boolean;
  message?: string; 
  office?: Office;  
}



export interface OfficeState {
  office: Office | null;
  loading: boolean;
  error: string | null;
}