// Hàm dịch trạng thái đơn hàng
export const translateOrderStatus = (status: string): string => {
  switch (status) {
    case 'draft': return 'Bản nháp';
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'picked_up': return 'Đã lấy hàng';
    case 'in_transit': return 'Đang vận chuyển';
    case 'delivered': return 'Đã giao hàng';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
};

// Hàm lấy tên xã/phường
export const getWardName = (wardCode: string | number, wards: { code: number; name: string }[] = []) =>
  wards.find(w => w.code === Number(wardCode))?.name || '';