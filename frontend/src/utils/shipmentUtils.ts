export const translateShipmentStatus = (status: string): string => {
  switch (status) {
    case 'Pending': return 'Chờ xác nhận';       
    case 'InTransit': return 'Đang giao';          
    case 'Completed': return 'Hoàn thành';        
    case 'Cancelled': return 'Đã hủy';            
    default: return status;
  }
};
