import db from '../models';

const officeService = {
  // Get Office By UserId
  async getByUserId(userId) {
    try {
      const employee = await db.Employee.findOne({ where: { userId }, include: [{ model: db.Office, as: 'office' }] });
      if (!employee || !employee.office) {
        return {
          success: false,
          message: 'Không tìm thấy bưu cục'
        };
      }

      return {
        success: true,
        message: 'Lấy thông tin bưu cục thành công',
        office: employee.office
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Lỗi server'
      };
    }
  },

  // Update Office
  async update(userId, officeId, data) {
    try {
      // Lấy office theo employee
      const employee = await db.Employee.findOne({ where: { userId }, include: [{ model: db.Office, as: 'office' }] });
      const office = employee?.office;

      if (!office || office.id !== Number(officeId)) {
        return { success: false, message: 'Office không tồn tại hoặc không có quyền cập nhật' };
      }

      await office.update(data);

      return { success: true, office };
    } catch (error) {
      console.error('Update office error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  async getOfficesByArea(codeCity, codeWard) {
    try {
      const whereClause = {};
      if (codeCity != null) whereClause.codeCity = codeCity;
      if (codeWard != null) whereClause.codeWard = codeWard;

      console.log('Where clause:', whereClause);

      const offices = await db.Office.findAll({ where: whereClause });

      if (!offices || offices.length === 0) {
        return {
          success: false,
          message: 'Không tìm thấy bưu cục',
          offices: [],
        };
      }

      return {
        success: true,
        message: 'Lấy thông tin bưu cục thành công',
        offices,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Lỗi server',
        offices: [],
      };
    }
  },
};

export default officeService;