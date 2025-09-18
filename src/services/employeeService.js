import bcrypt from 'bcrypt';
import db from '../models';
import generateRandomPassword from '../utils/generateRandomPassword';
import { sendWelcomeEmail } from '../utils/sendWelcomeEmail';

const employeeService = {

  // Get Shift Enum
  async getShiftEnum(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'role'],
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Kiểm tra role
      if (!user.role || user.role === 'user') {
        return { success: false, message: 'Bạn không có quyền xem ca làm việc' };
      }

      // Lấy enum shift từ model Employee
      const shiftEnum = db.Employee.rawAttributes.shift.values;

      return {
        success: true,
        message: 'Lấy danh sách ca làm việc thành công',
        shifts: shiftEnum,
      };
    } catch (error) {
      console.error('Get Shift Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Status Enum
  async getStatusEnum(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'role'],
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Kiểm tra role
      if (!user.role || user.role === 'user') {
        return { success: false, message: 'Bạn không có quyền xem trạng thái nhân viên' };
      }

      // Lấy enum shift từ model Employee
      const statusEnum = db.Employee.rawAttributes.status.values;

      return {
        success: true,
        message: 'Lấy danh trạng thái nhân viên thành công',
        statuses: statusEnum,
      };
    } catch (error) {
      console.error('Get Status Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Employees By Office
  async getEmployeesByOffice(userId, officeId, page, limit, filters) {
    try {
      const offset = (page - 1) * limit;

      const user = await db.User.findOne({
        where: { id: userId },
        include: {
          model: db.Employee,
          as: 'employee',
          attributes: ['id', 'officeId'],
        },
        attributes: ['id', 'role'],
      });

      if (!user) return { success: false, message: 'Người dùng không tồn tại' };
      if (!['admin', 'manager'].includes(user.role)) {
        return { success: false, message: 'Bạn không có quyền xem danh sách nhân viên' };
      }

      let whereCondition = { officeId };

      if (user.role === 'manager') {
        if (!user.employee || user.employee.officeId !== parseInt(officeId)) {
          return { success: false, message: 'Bạn không có quyền xem nhân viên bưu cục này' };
        }

        // Loại trừ chính manager khỏi danh sách
        whereCondition.id = { [db.Sequelize.Op.ne]: user.employee.id };
      }

      // Áp dụng filter
      const { searchText, shift, status, role, startDate, endDate } = filters || {};
      const { Op } = db.Sequelize;

      if (searchText) {
        whereCondition[Op.or] = [
          { id: { [Op.like]: `%${searchText}%` } },
          { '$user.firstName$': { [Op.like]: `%${searchText}%` } },
          { '$user.lastName$': { [Op.like]: `%${searchText}%` } },
          { '$user.email$': { [Op.like]: `%${searchText}%` } },
          { '$user.phoneNumber$': { [Op.like]: `%${searchText}%` } },
        ];
      }

      if (shift) whereCondition.shift = shift;
      if (status) whereCondition.status = status;
      if (role) whereCondition['$user.role$'] = role;
      if (startDate && endDate) {
        whereCondition.hireDate = { [Op.between]: [startDate, endDate] };
      }

      const { rows: employees, count: total } = await db.Employee.findAndCountAll({
        where: whereCondition,
        attributes: ['id', 'hireDate', 'shift', 'status'],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'role'],
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id'],
          },
        ],
        limit,
        offset,
        order: [['id', 'ASC']],
      });

      return {
        success: true,
        message: 'Lấy danh sách nhân viên thành công',
        employees,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Get Employees By Office error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Check Before Add Employee
  async checkBeforeAddEmployee(userId, email, phoneNumber, officeIdFromBody) {
    console.log("Check before add =>", { userId, email, phoneNumber, officeIdFromBody });
    try {
      if (!email) return { success: false, message: "Thiếu email" };

      // Lấy thông tin người thao tác
      const currentUser = await db.User.findOne({
        where: { id: userId },
        attributes: ["id", "role"],
        include: [{ model: db.Employee, as: "employee", attributes: ["officeId"] }]
      });

      if (!["admin", "manager"].includes(currentUser.role)) {
        return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
      }

      let officeId = officeIdFromBody;
      if (currentUser.role === "manager") {
        if (!currentUser.employee)
          return { success: false, message: "Manager không thuộc office nào" };
        officeId = currentUser.employee.officeId;
      } else if (currentUser.role === "admin" && !officeId) {
        return { success: false, message: "Thiếu officeId khi thêm nhân viên" };
      }

      // Lấy thông tin user cần check
      const user = await db.User.findOne({
        where: { email },
        attributes: ["id", "email", "firstName", "lastName", "phoneNumber", "role"],
        include: [{ model: db.Employee, as: "employee", attributes: ["officeId", "status"] }]
      });

      if (!user) {
        return { success: true, exists: false, message: "User chưa tồn tại" };
      }

      // Kiểm tra số điện thoại trùng
      if (phoneNumber && user.phoneNumber !== phoneNumber) {
        const phoneExists = await db.User.findOne({
          where: { phoneNumber, id: { [db.Sequelize.Op.ne]: user.id } }
        });
        if (phoneExists) {
          return {
            success: false,
            exists: true,
            user,
            message: "Số điện thoại này đã được sử dụng cho tài khoản khác"
          };
        }
      }

      // Kiểm tra tất cả employee của user
      const allEmployees = await db.Employee.findAll({ where: { userId: user.id } });

      // Xem có active không
      const activeEmployee = allEmployees.find(e => e.status !== "Leave");
      if (activeEmployee) {
        if (activeEmployee.officeId === officeId) {
          return {
            success: false,
            exists: true,
            user,
            message: `Người này đang là nhân viên tại bưu cục hiện tại, không thể thêm`
          };
        } else {
          return {
            success: false,
            exists: true,
            user,
            message: `Người này đang là nhân viên tại bưu cục ${activeEmployee.officeId}, không thể thêm vào bưu cục này`
          };
        }
      }

      // Nếu không có active → check từng office đã leave trước đó
      const previousSameOffice = allEmployees.find(e => e.officeId === officeId && e.status === "Leave");
      if (previousSameOffice) {
        return {
          success: true,
          exists: true,
          isEmployee: false,
          user,
          message: "Người này từng làm ở bưu cục này (đã nghỉ), có thể thêm lại."
        };
      }

      const previousOtherOffice = allEmployees.find(e => e.officeId !== officeId && e.status === "Leave");
      if (previousOtherOffice) {
        return {
          success: true,
          exists: true,
          isEmployee: false,
          user,
          message: "Người này từng làm ở bưu cục khác (đã nghỉ), có thể thêm vào bưu cục mới."
        };
      }

      // User chưa từng là nhân viên
      return {
        success: true,
        exists: true,
        isEmployee: false,
        user,
        message: "Người này đã có tài khoản, có thể thêm làm nhân viên"
      };

    } catch (err) {
      console.error("Check before add error:", err);
      return { success: false, message: "Lỗi server khi kiểm tra trước khi thêm" };
    }
  },

  // Add Employee
  async addEmployee(userId, hireDate, shift, status, user, office) {
    const t = await db.sequelize.transaction();
    try {
      if (!user?.email || !user?.firstName || !user?.lastName || !user?.role || !user?.phoneNumber) {
        return { success: false, message: "Thiếu thông tin tài khoản nhân viên" };
      }

      // 1. Lấy user hiện tại (admin/manager đang thao tác)
      const currentUser = await db.User.findOne({
        where: { id: userId },
        attributes: ["id", "role"],
        include: [{ model: db.Employee, as: "employee", attributes: ["officeId"] }]
      });

      if (!["admin", "manager"].includes(currentUser.role)) {
        return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
      }

      // Xác định officeId thao tác
      const officeId = currentUser.role === "manager"
        ? currentUser.employee.officeId
        : office?.id;

      if (!officeId) {
        return { success: false, message: "Thiếu thông tin officeId để thêm nhân viên" };
      }

      // 2. Tìm user theo email
      let existingUser = await db.User.findOne({
        where: { email: user.email },
        include: [{ model: db.Employee, as: "employee" }]
      });

      if (existingUser) {
        // Cập nhật thông tin user
        await existingUser.update({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role
        }, { transaction: t });

        // Nếu user đã có employee trong cùng office → update employee
        if (existingUser.employee && existingUser.employee.officeId === officeId) {
          await existingUser.employee.update({
            hireDate: new Date() || existingUser.employee.hireDate,
            shift: shift || existingUser.employee.shift,
            status: status || "Inactive",
          }, { transaction: t });

          await t.commit();

          return {
            success: true,
            message: "Cập nhật thông tin nhân viên thành công",
            employee: { ...existingUser.employee.toJSON(), user: existingUser.toJSON() }
          };
        }

        // Nếu chưa có employee hoặc employee thuộc office khác → tạo mới employee
        const newEmployee = await db.Employee.create({
          hireDate: hireDate || new Date(),
          shift: shift || "Full Day",
          status: status || "Inactive",
          userId: existingUser.id,
          officeId
        }, { transaction: t });

        await t.commit();

        return {
          success: true,
          message: "Thêm nhân viên thành công",
          employee: { ...newEmployee.toJSON(), user: existingUser.toJSON() }
        };

      } else {
        // 3. Nếu chưa có user → tạo mới user
        const plainPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        existingUser = await db.User.create({
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isVerified: true
        }, { transaction: t });

        // 4. Tạo employee mới
        const newEmployee = await db.Employee.create({
          hireDate: hireDate || new Date(),
          shift: shift || "Full Day",
          status: status || "Inactive",
          userId: existingUser.id,
          officeId
        }, { transaction: t });

        // Gửi email chào mừng sau khi commit
        t.afterCommit(async () => {
          try {
            await sendWelcomeEmail(existingUser.email, existingUser.firstName, existingUser.role, plainPassword);
          } catch (err) {
            console.error("Gửi email thất bại:", err);
          }
        });

        await t.commit();

        return {
          success: true,
          message: "Tạo nhân viên thành công",
          employee: { ...newEmployee.toJSON(), user: existingUser.toJSON() }
        };
      }

    } catch (error) {
      await t.rollback();
      console.error("Add Employee error:", error);
      return { success: false, message: "Lỗi server khi tạo nhân viên" };
    }
  },

  // Update User
  async updateEmployee(userId, employeeId, hireDate, shift, status, user, office) {
    const t = await db.sequelize.transaction();
    try {
      const currentUser = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'role'],
        include: [{ model: db.Employee, as: 'employee', attributes: ['officeId'] }]
      });

      if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
        return { success: false, message: 'Bạn không có quyền thực hiện thao tác này' };
      }

      const employee = await db.Employee.findOne({
        where: { id: employeeId },
        include: [{ model: db.User, as: 'user' }]
      });

      if (!employee) return { success: false, message: 'Nhân viên không tồn tại' };

      // Kiểm tra manager có cùng office không
      if (currentUser.role === 'manager' && currentUser.employee.officeId !== employee.officeId) {
        return { success: false, message: 'Bạn không có quyền thao tác với nhân viên bưu cục khác' };
      }

      // Kiểm tra số điện thoại có trùng không (không tính user hiện tại)
      if (user?.phoneNumber && employee.user.phoneNumber !== user.phoneNumber) {
        const phoneExists = await db.User.findOne({
          where: {
            phoneNumber: user.phoneNumber,
            id: { [db.Sequelize.Op.ne]: employee.user.id }
          }
        });
        if (phoneExists) {
          return {
            success: false,
            message: 'Số điện thoại này đã được sử dụng cho tài khoản khác'
          };
        }
      }

      // Cập nhật Employee
      await employee.update(
        {
          hireDate: hireDate || employee.hireDate,
          shift: shift || employee.shift,
          status: status || employee.status,
          officeId: currentUser.role === 'admin' && office ? office : employee.officeId
        },
        { transaction: t }
      );

      // Cập nhật User (không đổi email)
      if (user && employee.user) {
        await employee.user.update(
          {
            firstName: user.firstName || employee.user.firstName,
            lastName: user.lastName || employee.user.lastName,
            phoneNumber: user.phoneNumber || employee.user.phoneNumber,
            role: user.role || employee.user.role,
          },
          { transaction: t }
        );
      }

      await t.commit();

      return {
        success: true,
        message: 'Cập nhật nhân viên thành công',
        employee: { ...employee.toJSON(), user: employee.user.toJSON() },
      };
    } catch (error) {
      await t.rollback();
      console.error('Update Employee error:', error);
      return { success: false, message: 'Lỗi server khi cập nhật nhân viên' };
    }
  },

  // Import Add Employees
  async importEmployees(userId, employees) {
    const importedResults = [];
    try {
      if (!Array.isArray(employees) || employees.length === 0) {
        return { success: false, message: "Không có dữ liệu nhân viên để import" };
      }

      for (const emp of employees) {
        const { user, hireDate, shift, status, office } = emp;

        // 1. Check trước khi thêm
        const checkResult = await this.checkBeforeAddEmployee(userId, user.email, user.phoneNumber, office?.id);

        if (!checkResult.success) {
          importedResults.push({
            email: user.email,
            success: false,
            message: checkResult.message,
          });
          continue;
        }

        // 2. Thêm nhân viên
        const addResult = await this.addEmployee(userId, hireDate, shift, status, user, office);

        importedResults.push({
          email: user.email,
          success: addResult.success,
          message: addResult.message,
          employee: addResult.employee || null,
        });
      }

      // Phân loại kết quả
      const createdEmployees = importedResults.filter(r => r.success).map(r => r.email);
      const failedEmployees = importedResults.filter(r => !r.success).map(r => ({ email: r.email, message: r.message }));

      return {
        success: true,
        message: `Import hoàn tất: ${createdEmployees.length} nhân viên mới, ${failedEmployees.length} lỗi`,
        totalImported: createdEmployees.length,
        totalFailed: failedEmployees.length,
        createdEmployees,
        failedEmployees,
        results: importedResults,
      };
    } catch (error) {
      console.error("Import Employees error:", error);
      return { success: false, message: "Lỗi server khi import nhân viên" };
    }
  },
};


export default employeeService;