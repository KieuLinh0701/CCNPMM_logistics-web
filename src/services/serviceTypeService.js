import db from '../models';

const serviceTypeService = {
  // Get Active Service Types
  async getActiveServiceTypes() {
    try {
      const serviceTypes = await db.ServiceType.findAll({
        where: { status: 'active' },
        attributes: ['id', 'name', 'deliveryTime', 'status'],
        order: [['name', 'ASC']],
      });

      return {
        success: true,
        message: 'Lấy danh sách dịch vụ vận chuyển thành công',
        serviceTypes,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Lỗi server khi lấy danh sách dịch vụ vận chuyển',
        serviceTypes: [],
      };
    }
  },
};

export default serviceTypeService;