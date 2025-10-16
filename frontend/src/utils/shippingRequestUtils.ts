// Hàm dịch trạng thái yêu cầu
export const translateStatus = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'Đang chờ xử lý';
    case 'Processing':
      return 'Đang xử lý';
    case 'Resolved':
      return 'Đã giải quyết';
    case 'Rejected':
      return 'Đã từ chối';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

// Hàm dịch loại yêu cầu
export const translateRequestType = (type: string): string => {
  switch (type) {
    case 'Complaint':
      return 'Khiếu nại';
    case 'PickupReminder':
      return 'Hối lấy hàng';
    case 'DeliveryReminder':
      return 'Hối giao hàng';
    case 'ChangeOrderInfo':
      return 'Thay đổi thông tin';
    case 'Inquiry':
      return 'Yêu cầu hỗ trợ';
    default:
      return type;
  }
};

