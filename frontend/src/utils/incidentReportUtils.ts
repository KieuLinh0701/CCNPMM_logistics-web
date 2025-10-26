export const translateIncidentType = (type: string): string => {
  switch (type) {
    case 'recipient_not_available': return 'Người nhận không có mặt';
    case 'wrong_address': return 'Sai địa chỉ';
    case 'package_damaged': return 'Hàng bị hư hỏng';
    case 'recipient_refused': return 'Người nhận từ chối';
    case 'security_issue': return 'Vấn đề an ninh';
    case 'other': return 'Khác';
    default: return type;
  }
};

export const translateIncidentStatus = (status: string): string => {
  switch (status) {
    case 'pending': return 'Chờ xử lý';
    case 'processing': return 'Đang giải quyết';
    case 'resolved': return 'Đã giải quyết';
    case 'rejected': return 'Từ chối';
    default: return status;
  }
};