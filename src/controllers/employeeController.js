import employeeService from '../services/employeeService.js';

const employeeController = {
  // Admin list employees
  async list(req, res) {
    try {
      const { page, limit, search, officeId, status, shift } = req.query;
      const result = await employeeService.listEmployees({ page, limit, search, officeId, status, shift });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      console.error("listEmployees error:", error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách nhân viên' });
    }
  },

  // Admin get employee by id
  async getById(req, res) {
    try {
      const result = await employeeService.getEmployeeById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      console.error('getEmployeeById error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi lấy nhân viên' });
    }
  },

  // Admin create employee (basic)
  async create(req, res) {
    try {
      const result = await employeeService.createEmployee(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      console.error('createEmployee error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi tạo nhân viên' });
    }
  },

  // Admin update employee (basic)
  async update(req, res) {
    try {
      const result = await employeeService.updateEmployeeBasic(req.params.id, req.body);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      console.error('updateEmployeeBasic error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật nhân viên' });
    }
  },

  // Admin delete employee
  async remove(req, res) {
    try {
      const result = await employeeService.deleteEmployee(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      console.error('deleteEmployee error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi xóa nhân viên' });
    }
  },

  // ================= Manager ======================================

  // Get Shift Enum
  async getShiftEnum(req, res) {
    try {

        const userId = req.user.id;

        const result = await employeeService.getShiftEnum(userId);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Get Shift Enum error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
      });
    }
  },

  // Get Status Enum
  async getStatusEnum(req, res) {
    try {

        const userId = req.user.id;

        const result = await employeeService.getStatusEnum(userId);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Get Status Enum error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
      });
    }
  },

  // Get Employees By Office
  async getEmployeesByOffice(req, res) {
    try {
      const userId = req.user.id;
      const officeId = req.params.id;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        shift: req.query.shift || undefined,
        status: req.query.status || undefined,
        role: req.query.role || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await employeeService.getEmployeesByOffice(userId, officeId, page, limit, filters);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Employees By Office error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Check Before Add Employee
  async checkBeforeAddEmployee(req, res) {
    try {
      const userId = req.user.id;

      const { email, phoneNumber, officeId } = req.query;

      const result = await employeeService.checkBeforeAddEmployee(userId, email, phoneNumber, officeId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Check Before Add Employee:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Add Employees 
  async addEmployee(req, res) {
    try {
      const userId = req.user.id;

      const { hireDate, shift, status, user, office } = req.body;

      const result = await employeeService.addEmployee(userId, hireDate, shift, status, user, office);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Add Employee error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Update Employees 
  async updateEmployee(req, res) {
    try {
      const userId = req.user.id;

      const { id } = req.params;

      const { hireDate, shift, status, user, office } = req.body;

      const result = await employeeService.updateEmployee(userId, id, hireDate, shift, status, user, office);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Add Employee error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Import Add Employees
  async importEmployees(req, res) {
    try {
      const userId = req.user.id;
      
      const { employees } = req.body;

      if (!Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có dữ liệu nhân viên để import",
        });
      }

      // Gọi service để thêm nhiều nhân viên
      const result = await employeeService.importEmployees(userId, employees);

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Import Employees error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi import nhân viên",
      });
    }
  },

  async getEmployeePerformance(req, res) {
    try {
      const userId = req.user.id;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        startDate: req.query.startDate || undefined,
        sort: req.query.sort || undefined,
        role: req.query.role || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await employeeService.getEmployeePerformance(userId, page, limit, filters);

      return res.status(200).json(result);
    } catch (error) {
      console.error('getEmployeePerformanceError:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async exportEmployeePerformance(req, res) {
    try {
      const userId = req.user.id;

      const filters = {
        searchText: req.query.search || undefined,
        startDate: req.query.startDate || undefined,
        sort: req.query.sort || undefined,
        role: req.query.role || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await employeeService.exportEmployeePerformance(userId, filters);

      return res.status(200).json(result);
    } catch (error) {
      console.error('exportEmployeePerformance:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },
};

export default employeeController;
