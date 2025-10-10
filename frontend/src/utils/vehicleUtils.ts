// Hàm dịch trạng thái phương tiện
export const translateVehicleStatus = (status: string): string => {
  switch (status) {
    case 'Available': return 'Khả dụng';
    case 'InUse': return 'Đang sử dụng';
    case 'Maintenance': return 'Đang bảo trì';
    case 'Archived': return 'Đã lưu trữ';
    default: return status;
  }
};

// Hàm dịch loại phương tiện
export const translateVehicleType = (type: string): string => {
  switch (type) {
    case 'Truck': return 'Xe tải';
    case 'Van': return 'Xe thùng';
    default: return type;
  }
};

