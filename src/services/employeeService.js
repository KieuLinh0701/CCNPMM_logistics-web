import bcrypt from 'bcrypt';
import db from '../models';
import generateRandomPassword from '../utils/generateRandomPassword';
import { sendWelcomeEmail } from '../utils/sendWelcomeEmail';
import notificationService from './notificationService';
import dayjs from 'dayjs';
import { Op } from 'sequelize';

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
      // 1️⃣ Kiểm tra dữ liệu đầu vào
      if (!email && !phoneNumber) {
        return { success: false, message: "Thiếu email hoặc số điện thoại" };
      }

      // 2️⃣ Lấy thông tin người thao tác
      const currentUser = await db.User.findOne({
        where: { id: userId },
        attributes: ["id", "role"],
        include: [{ model: db.Employee, as: "employee", attributes: ["officeId"] }]
      });

      if (!["admin", "manager"].includes(currentUser.role)) {
        return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
      }

      // 3️⃣ Xác định office thao tác
      let officeId = officeIdFromBody;
      if (currentUser.role === "manager") {
        if (!currentUser.employee)
          return { success: false, message: "Manager không thuộc office nào" };
        officeId = currentUser.employee.officeId;
      } else if (currentUser.role === "admin" && !officeId) {
        return { success: false, message: "Thiếu officeId khi thêm nhân viên" };
      }

      // 4️⃣ Kiểm tra user tồn tại theo email / phone
      const existingByEmail = email
        ? await db.User.findOne({ where: { email } })
        : null;
      const existingByPhone = phoneNumber
        ? await db.User.findOne({ where: { phoneNumber } })
        : null;

      // ⚙️ Trường hợp 1: Không có user nào tồn tại → người mới hoàn toàn
      if (!existingByEmail && !existingByPhone) {
        return { success: true, exists: false, message: "User chưa tồn tại, có thể tạo mới" };
      }

      // ⚙️ Trường hợp 2: Cả email & phone cùng thuộc 1 user
      if (existingByEmail && existingByPhone && existingByEmail.id === existingByPhone.id) {
        const user = existingByEmail;
        const allEmployees = await db.Employee.findAll({ where: { userId: user.id } });
        const activeEmployee = allEmployees.find(e => e.status !== "Leave");

        if (activeEmployee) {
          if (activeEmployee.officeId === officeId) {
            return {
              success: false,
              exists: true,
              user,
              message: "Người này đang là nhân viên tại bưu cục hiện tại, không thể thêm lại"
            };
          }
          return {
            success: false,
            exists: true,
            user,
            message: `Người này đang là nhân viên tại bưu cục khác`
          };
        }

        // Nếu đã nghỉ → có thể thêm lại
        return {
          success: true,
          exists: true,
          user,
          message: "Người này từng làm việc (đã nghỉ), có thể thêm lại"
        };
      }

      // ⚙️ Trường hợp 3: Chỉ trùng email
      if (existingByEmail && !existingByPhone) {
        const user = existingByEmail;
        const allEmployees = await db.Employee.findAll({ where: { userId: user.id } });
        const activeEmployee = allEmployees.find(e => e.status !== "Leave");

        if (activeEmployee) {
          if (activeEmployee.officeId === officeId) {
            return {
              success: false,
              exists: true,
              user,
              message: "Người này đang là nhân viên tại bưu cục hiện tại"
            };
          } else {
            return {
              success: false,
              exists: true,
              user,
              message: `Người này đang là nhân viên tại bưu cục khác`
            };
          }
        }

        // Nếu đã nghỉ → có thể thêm lại và cập nhật số điện thoại
        return {
          success: true,
          exists: true,
          user,
          message: "Người này từng làm việc (đã nghỉ), có thể thêm lại và cập nhật số điện thoại mới"
        };
      }

      // ⚙️ Trường hợp 4: Chỉ trùng số điện thoại
      if (existingByPhone && !existingByEmail) {
        return {
          success: false,
          exists: true,
          user: existingByPhone,
          message: "Số điện thoại này đã được sử dụng cho tài khoản khác"
        };
      }

      // ⚙️ Trường hợp 5: Trùng email và phone nhưng thuộc 2 người khác nhau
      if (existingByEmail && existingByPhone && existingByEmail.id !== existingByPhone.id) {
        return {
          success: false,
          exists: true,
          message: "Email và số điện thoại thuộc hai tài khoản khác nhau, vui lòng kiểm tra lại"
        };
      }

      return { success: false, message: "Trường hợp dữ liệu không hợp lệ" };

    } catch (err) {
      return { success: false, message: "Lỗi server khi kiểm tra trước khi thêm" };
    }
  },

  // ADD EMPLOYEE
  async addEmployee(userId, hireDate, shift, status, user, office) {
    const t = await db.sequelize.transaction();
    try {
      if (!user?.email || !user?.firstName || !user?.lastName || !user?.role || !user?.phoneNumber) {
        return { success: false, message: "Thiếu thông tin tài khoản nhân viên" };
      }

      // 1. Lấy người thao tác
      const currentUser = await db.User.findOne({
        where: { id: userId },
        attributes: ["id", "role"],
        include: [{ model: db.Employee, as: "employee", attributes: ["officeId"] }]
      });

      if (!["admin", "manager"].includes(currentUser.role)) {
        return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
      }

      // 2. Xác định office
      const officeId = currentUser.role === "manager" ? currentUser.employee.officeId : office?.id;
      if (!officeId) return { success: false, message: "Thiếu thông tin officeId để thêm nhân viên" };

      // 3. Kiểm tra user trùng email / phone
      const existingByEmail = await db.User.findOne({ where: { email: user.email } });
      const existingByPhone = await db.User.findOne({ where: { phoneNumber: user.phoneNumber } });

      let targetUser = null;

      // Email và phone trùng nhưng là 2 user khác → lỗi
      if (existingByEmail && existingByPhone && existingByEmail.id !== existingByPhone.id) {
        await t.rollback();
        return { success: false, message: "Email và số điện thoại thuộc hai tài khoản khác nhau" };
      }

      // Cả 2 trùng và là cùng 1 user
      if (existingByEmail && existingByPhone && existingByEmail.id === existingByPhone.id) {
        targetUser = existingByEmail;
      }
      // Email trùng, phone khác
      else if (existingByEmail && !existingByPhone) {
        targetUser = existingByEmail;

        const allEmployees = await db.Employee.findAll({ where: { userId: targetUser.id } });
        const activeEmployee = allEmployees.find(e => e.status !== "Leave");

        if (activeEmployee) {
          if (activeEmployee.officeId === officeId) {
            await t.rollback();
            return {
              success: false,
              message: "Người này đang là nhân viên active tại bưu cục hiện tại, không thể cập nhật số điện thoại"
            };
          } else {
            await t.rollback();
            return {
              success: false,
              message: `Người này đang là nhân viên active tại bưu cục khác (ID: ${activeEmployee.officeId}), không thể cập nhật số điện thoại`
            };
          }
        }

        // Nếu đã nghỉ → cập nhật phone
        await targetUser.update({ phoneNumber: user.phoneNumber }, { transaction: t });
      }
      // Email khác, phone trùng → chặn
      else if (!existingByEmail && existingByPhone) {
        await t.rollback();
        return { success: false, message: "Số điện thoại đã được sử dụng cho tài khoản khác" };
      }

      // 4. Nếu user chưa tồn tại → tạo mới
      if (!targetUser) {
        const plainPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newUser = await db.User.create({
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isVerified: true
        }, { transaction: t });

        const newEmployee = await db.Employee.create({
          hireDate: hireDate || new Date(),
          shift: shift || "Full Day",
          status: status || "Active",
          userId: newUser.id,
          officeId
        }, { transaction: t });

        t.afterCommit(async () => {
          await sendWelcomeEmail(newUser.email, newUser.firstName, newUser.role, plainPassword);
        });

        await t.commit();

        await notificationService.createNotification({
          title: "Chào mừng bạn đến với hệ thống!",
          message: "Tài khoản nhân viên của bạn đã được kích hoạt. Chúc bạn làm việc hiệu quả!",
          type: "system",
          userId: newUser.id,
        });

        return { success: true, message: "Thêm nhân viên mới thành công", employee: newEmployee };
      }

      // 5.Nếu user đã tồn tại → kiểm tra employee
      const allEmployees = await db.Employee.findAll({ where: { userId: targetUser.id } });
      const activeEmployee = allEmployees.find(e => e.status !== "Leave");

      if (activeEmployee) {
        if (activeEmployee.officeId === officeId) {
          await t.rollback();
          return { success: false, message: "Người này đang là nhân viên tại bưu cục hiện tại" };
        } else {
          await t.rollback();
          return { success: false, message: `Người này đang là nhân viên tại bưu cục khác (ID: ${activeEmployee.officeId})` };
        }
      }

      // 6. Nếu đã nghỉ → thêm lại employee
      const newEmployee = await db.Employee.create({
        hireDate: hireDate || new Date(),
        shift: shift || "Full Day",
        status: status || "Active",
        userId: targetUser.id,
        officeId
      }, { transaction: t });

      await t.commit();

      await notificationService.createNotification({
        title: "Chào mừng bạn quay trở lại!",
        message: "Tài khoản nhân viên của bạn đã được kích hoạt trở lại. Chúc bạn làm việc hiệu quả!",
        type: "system",
        userId: targetUser.id,
      });

      return { success: true, message: "Kích hoạt lại nhân viên thành công", employee: newEmployee };

    } catch (error) {
      await t.rollback();
      console.error("Add Employee error:", error);
      return { success: false, message: "Lỗi server khi tạo nhân viên" };
    }
  },

  // Update Employee 
  async updateEmployee(userId, employeeId, hireDate, shift, status, user, office) {
    const t = await db.sequelize.transaction();
    try {
      // Xác thực quyền người thực hiện
      const currentUser = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'role'],
        include: [{ model: db.Employee, as: 'employee', attributes: ['officeId'] }],
      });

      if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
        return { success: false, message: 'Bạn không có quyền thực hiện thao tác này' };
      }

      // Lấy thông tin nhân viên cần cập nhật
      const employee = await db.Employee.findOne({
        where: { id: employeeId },
        include: [{ model: db.User, as: 'user' }],
      });

      if (!employee) return { success: false, message: 'Nhân viên không tồn tại' };

      // Manager chỉ được phép chỉnh nhân viên cùng bưu cục
      if (currentUser.role === 'manager' && currentUser.employee.officeId !== employee.officeId) {
        return { success: false, message: 'Bạn không có quyền thao tác với nhân viên bưu cục khác' };
      }

      // Lưu các thay đổi để gửi báo cáo
      const changes = [];
      const compare = (key, label, oldVal, newVal) => {
        if (oldVal?.toString() !== newVal?.toString()) {
          changes.push(`${label} (${oldVal || 'trống'} → ${newVal || 'trống'})`);
        }
      };

      const oldHireDate = employee.hireDate ? dayjs(employee.hireDate).format('YYYY-MM-DD') : null;
      const newHireDate = hireDate ? dayjs(hireDate).format('YYYY-MM-DD') : null;

      if (oldHireDate !== newHireDate) {
        changes.push(`ngày bắt đầu làm việc (${oldHireDate || 'trống'} → ${newHireDate || 'trống'})`);
      }
      compare('shift', 'ca làm', employee.shift, shift);
      compare('status', 'trạng thái', employee.status, status);
      compare('role', 'vai trò', employee.user.role, user.role);

      // Cập nhật Employee
      await employee.update(
        {
          hireDate: hireDate ?? employee.hireDate,
          shift: shift ?? employee.shift,
          status: status ?? employee.status,
          officeId: currentUser.role === 'admin' && office ? office : employee.officeId,
        },
        { transaction: t }
      );

      if (changes.length == 0) {
        return { success: false, message: 'Không có thay đổi nào để cập nhật' };
      }

      // Cập nhật thông tin User
      if (user && employee.user) {
        await employee.user.update(
          {
            firstName: user.firstName ?? employee.user.firstName,
            lastName: user.lastName ?? employee.user.lastName,
            phoneNumber: user.phoneNumber ?? employee.user.phoneNumber,
            role: user.role ?? employee.user.role,
          },
          { transaction: t }
        );
      }

      // Reload để lấy dữ liệu mới
      await employee.reload({ include: [{ model: db.User, as: 'user' }] });

      // Gửi thông báo nếu có thay đổi
      let requireReLogin = false;

      // Kiểm tra role có thay đổi không
      if (user && employee.user && user.role && user.role !== employee.user.role) {
        requireReLogin = true;
      }

      // Gửi notification
      if (changes.length > 0) {
        await notificationService.createNotification({
          title: 'Thông tin của bạn đã được cập nhật',
          message: `Quản lý đã thay đổi ${changes.join(', ')}.${requireReLogin ? ' Vui lòng đăng nhập lại để quyền mới có hiệu lực.' : ''
            }`,
          type: 'system',
          userId: employee.user.id,
          targetRole: 'user',
          relatedId: employee.id,
          relatedType: 'employee',
          t,
        });
      }

      await t.commit();

      return {
        success: true,
        message: 'Cập nhật nhân viên thành công',
        employee: employee,
      };
    } catch (error) {
      await t.rollback();
      console.error('Lỗi khi cập nhật nhân viên:', error);
      return { success: false, message: 'Lỗi server khi cập nhật nhân viên' };
    }
  },

  async getEmployeePerformance(managerId, page = 1, limit = 10, filters = {}) {
    try {
      const { searchText, startDate, endDate, sort, role } = filters;

      // 1 Lấy bưu cục của manager
      const manager = await db.Employee.findOne({
        where: { userId: managerId },
        include: [{ model: db.Office, as: 'office', attributes: ['id', 'name'] }],
        attributes: ['id', 'userId', 'officeId']
      });

      if (!manager || !manager.office) {
        return { success: false, message: 'Manager không thuộc bưu cục nào.' };
      }

      const officeId = manager.office.id;

      // 2 Chuẩn bị điều kiện where cho User
      let userWhere = { role: { [Op.not]: 'manager' } }; // luôn loại manager
      if (role && role !== 'All') {
        userWhere.role = role; // thêm lọc role nếu role khác 'All'
      }

      // 3 Lấy danh sách nhân viên active trong bưu cục
      const employees = await db.Employee.findAll({
        where: { officeId, status: 'Active' },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'role'],
            where: userWhere
          }
        ],
      });

      // 4 Duyệt từng nhân viên để tính hiệu suất
      let performanceData = [];
      for (const emp of employees) {
        const fullName = `${emp.user.lastName} ${emp.user.firstName}`;

        if (searchText && !fullName.toLowerCase().includes(searchText.toLowerCase())) continue;

        const shipmentWhere = { userId: emp.userId };
        if (startDate && endDate) {
          shipmentWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const shipments = await db.Shipment.findAll({
          where: shipmentWhere,
          include: [
            {
              model: db.ShipmentOrder,
              as: 'shipmentOrders',
              include: [{ model: db.Order, as: 'order', attributes: ['trackingNumber', 'status', 'weight'] }]
            }
          ]
        });

        let totalShipments = shipments.length;
        let totalOrders = 0;
        let completedOrders = 0;
        let totalTimeMs = 0;

        shipments.forEach(sh => {
          totalOrders += sh.shipmentOrders.length;
          completedOrders += sh.shipmentOrders.filter(so => so.order.status === 'Delivered').length;
          if (sh.startTime && sh.endTime) totalTimeMs += new Date(sh.endTime) - new Date(sh.startTime);
        });

        const avgTimePerOrder = totalOrders ? totalTimeMs / totalOrders : 0;
        const completionRate = totalOrders ? (completedOrders / totalOrders) * 100 : 0;

        performanceData.push({
          employeeId: emp.id,
          name: fullName,
          role: emp.user.role,
          totalShipments,
          totalOrders,
          completedOrders,
          completionRate: Number(completionRate.toFixed(2)),
          avgTimePerOrder: Number((avgTimePerOrder / (1000 * 60)).toFixed(2))
        });
      }

      // 5 Sort
      switch (sort) {
        case 'totalOrdersHigh': performanceData.sort((a, b) => b.totalOrders - a.totalOrders); break;
        case 'totalOrdersLow': performanceData.sort((a, b) => a.totalOrders - b.totalOrders); break;
        case 'totalShipmentsHigh': performanceData.sort((a, b) => b.totalShipments - a.totalShipments); break;
        case 'totalShipmentsLow': performanceData.sort((a, b) => a.totalShipments - b.totalShipments); break;
        case 'completedOrdersHigh': performanceData.sort((a, b) => b.completedOrders - a.completedOrders); break;
        case 'completedOrdersLow': performanceData.sort((a, b) => a.completedOrders - b.completedOrders); break;
        case 'completionRateHigh': performanceData.sort((a, b) => b.completionRate - a.completionRate); break;
        case 'completionRateLow': performanceData.sort((a, b) => a.completionRate - b.completionRate); break;
        case 'avgTimePerOrderHigh': performanceData.sort((a, b) => b.avgTimePerOrder - a.avgTimePerOrder); break;
        case 'avgTimePerOrderLow': performanceData.sort((a, b) => a.avgTimePerOrder - b.avgTimePerOrder); break;
        default: break;
      }

      // 6️⃣ Phân trang
      const total = performanceData.length;
      const startIndex = (page - 1) * limit;
      const paginatedData = performanceData.slice(startIndex, startIndex + limit);

      return {
        success: true,
        message: 'Lấy dữ liệu hiệu suất nhân viên thành công',
        total,
        page,
        limit,
        data: paginatedData
      };

    } catch (error) {
      console.error('getEmployeePerformance error:', error);
      return { success: false, message: 'Lỗi server khi lấy hiệu suất nhân viên' };
    }
  },

  async exportEmployeePerformance(managerId, filters = {}) {
    try {
      const { searchText, startDate, endDate, sort, role } = filters;

      // 1. Lấy bưu cục của manager
      const manager = await db.Employee.findOne({
        where: { userId: managerId },
        include: [{ model: db.Office, as: 'office', attributes: ['id', 'name'] }],
        attributes: ['id', 'userId', 'officeId']
      });

      if (!manager || !manager.office) {
        return { success: false, message: 'Manager không thuộc bưu cục nào.' };
      }

      const officeId = manager.office.id;

      // 2. Chuẩn bị điều kiện where cho User
      let userWhere = { role: { [Op.not]: 'manager' } }; // luôn loại manager
      if (role && role !== 'All') {
        userWhere.role = role; // thêm lọc role nếu role khác 'All'
      }

      // 3. Lấy danh sách nhân viên active trong bưu cục
      const employees = await db.Employee.findAll({
        where: { officeId, status: 'Active' },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'role'],
            where: userWhere
          }
        ],
      });

      // 4. Duyệt từng nhân viên để tính hiệu suất
      let performanceData = [];
      for (const emp of employees) {
        const fullName = `${emp.user.lastName} ${emp.user.firstName}`;
        if (searchText && !fullName.toLowerCase().includes(searchText.toLowerCase())) continue;

        const shipmentWhere = { userId: emp.userId };
        if (startDate && endDate) {
          shipmentWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const shipments = await db.Shipment.findAll({
          where: shipmentWhere,
          include: [
            {
              model: db.ShipmentOrder,
              as: 'shipmentOrders',
              include: [{ model: db.Order, as: 'order', attributes: ['trackingNumber', 'status', 'weight'] }]
            }
          ]
        });

        let totalShipments = shipments.length;
        let totalOrders = 0;
        let completedOrders = 0;
        let totalTimeMs = 0;

        shipments.forEach(sh => {
          totalOrders += sh.shipmentOrders.length;
          completedOrders += sh.shipmentOrders.filter(so => so.order.status === 'Delivered').length;
          if (sh.startTime && sh.endTime) totalTimeMs += new Date(sh.endTime) - new Date(sh.startTime);
        });

        const avgTimePerOrder = totalOrders ? totalTimeMs / totalOrders : 0;
        const completionRate = totalOrders ? (completedOrders / totalOrders) * 100 : 0;

        performanceData.push({
          employeeId: emp.id,
          name: fullName,
          role: emp.user.role,
          totalShipments,
          totalOrders,
          completedOrders,
          completionRate: Number(completionRate.toFixed(2)),
          avgTimePerOrder: Number((avgTimePerOrder / (1000 * 60)).toFixed(2)) // phút
        });
      }

      // 5. Sort
      switch (sort) {
        case 'totalOrdersHigh': performanceData.sort((a, b) => b.totalOrders - a.totalOrders); break;
        case 'totalOrdersLow': performanceData.sort((a, b) => a.totalOrders - b.totalOrders); break;
        case 'totalShipmentsHigh': performanceData.sort((a, b) => b.totalShipments - a.totalShipments); break;
        case 'totalShipmentsLow': performanceData.sort((a, b) => a.totalShipments - b.totalShipments); break;
        case 'completedOrdersHigh': performanceData.sort((a, b) => b.completedOrders - a.completedOrders); break;
        case 'completedOrdersLow': performanceData.sort((a, b) => a.completedOrders - b.completedOrders); break;
        case 'completionRateHigh': performanceData.sort((a, b) => b.completionRate - a.completionRate); break;
        case 'completionRateLow': performanceData.sort((a, b) => a.completionRate - b.completionRate); break;
        case 'avgTimePerOrderHigh': performanceData.sort((a, b) => b.avgTimePerOrder - a.avgTimePerOrder); break;
        case 'avgTimePerOrderLow': performanceData.sort((a, b) => a.avgTimePerOrder - b.avgTimePerOrder); break;
        default: break;
      }

      return {
        success: true,
        message: 'Lấy dữ liệu hiệu suất nhân viên thành công',
        total: performanceData.length,
        data: performanceData
      };

    } catch (error) {
      console.error('getEmployeePerformanceReport error:', error);
      return { success: false, message: 'Lỗi server khi lấy hiệu suất nhân viên' };
    }
  },

  // =========================== Admin ================================================

  // List employees with pagination and search
  async listEmployees(params) {
    try {
      const { page = 1, limit = 20, search = "", officeId, status, shift } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};

      if (officeId) where.officeId = officeId;
      if (status) where.status = status;
      if (shift) where.shift = shift;

      const { rows, count } = await db.Employee.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role'],
            where: search ? {
              [db.Sequelize.Op.or]: [
                { firstName: { [db.Sequelize.Op.like]: `%${search}%` } },
                { lastName: { [db.Sequelize.Op.like]: `%${search}%` } },
                { email: { [db.Sequelize.Op.like]: `%${search}%` } },
                { phoneNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
              ]
            } : undefined
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type']
          }
        ]
      });

      return {
        success: true,
        data: rows,
        pagination: { page: Number(page), limit: Number(limit), total: count }
      };
    } catch (error) {
      console.error("listEmployees error:", error);
      return { success: false, message: "Lỗi server khi lấy danh sách nhân viên" };
    }
  },

  // Get employee by ID
  async getEmployeeById(employeeId) {
    try {
      const employee = await db.Employee.findByPk(employeeId, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'isActive']
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type', 'status']
          }
        ]
      });

      if (!employee) {
        return { success: false, message: "Không tìm thấy nhân viên" };
      }
      return { success: true, data: employee };
    } catch (error) {
      console.error("getEmployeeById error:", error);
      return { success: false, message: "Lỗi server khi lấy nhân viên" };
    }
  },

  // Create new employee
  async createEmployee(employeeData) {
    try {
      const { userId, officeId, shift = "Full Day", status = "Inactive" } = employeeData;

      if (!userId || !officeId) {
        return { success: false, message: "Thiếu thông tin bắt buộc" };
      }

      const user = await db.User.findByPk(userId);
      if (!user) return { success: false, message: "Không tìm thấy người dùng" };

      if (!['manager', 'shipper'].includes(user.role)) {
        return { success: false, message: "Người dùng không có quyền làm nhân viên" };
      }

      const office = await db.Office.findByPk(officeId);
      if (!office) return { success: false, message: "Không tìm thấy văn phòng" };

      const existingEmployee = await db.Employee.findOne({ where: { userId } });
      if (existingEmployee) {
        return { success: false, message: "Người dùng đã là nhân viên" };
      }

      const created = await db.Employee.create({ userId, officeId, shift, status });

      const newEmployee = await db.Employee.findByPk(created.id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role']
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type']
          }
        ]
      });

      return { success: true, data: newEmployee };
    } catch (error) {
      console.error("createEmployee error:", error);
      return { success: false, message: "Lỗi server khi tạo nhân viên" };
    }
  },

  // Update employee (basic)
  async updateEmployeeBasic(employeeId, updateData) {
    try {
      const { officeId, shift, status } = updateData;

      const employee = await db.Employee.findByPk(employeeId);
      if (!employee) return { success: false, message: "Không tìm thấy nhân viên" };

      if (officeId && officeId !== employee.officeId) {
        const office = await db.Office.findByPk(officeId);
        if (!office) return { success: false, message: "Không tìm thấy văn phòng" };
      }

      if (typeof officeId !== "undefined") employee.officeId = officeId;
      if (typeof shift !== "undefined") employee.shift = shift;
      if (typeof status !== "undefined") employee.status = status;

      await employee.save();

      const updatedEmployee = await db.Employee.findByPk(employee.id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role']
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type']
          }
        ]
      });

      return { success: true, data: updatedEmployee };
    } catch (error) {
      console.error("updateEmployeeBasic error:", error);
      return { success: false, message: "Lỗi server khi cập nhật nhân viên" };
    }
  },

  // Delete employee
  async deleteEmployee(employeeId) {
    try {
      const employee = await db.Employee.findByPk(employeeId);
      if (!employee) {
        return { success: false, message: "Không tìm thấy nhân viên" };
      }
      await employee.destroy();
      return { success: true };
    } catch (error) {
      console.error("deleteEmployee error:", error);
      return { success: false, message: "Lỗi server khi xóa nhân viên" };
    }
  },

  // Get employee by user ID (for shipper)
  async getEmployeeByUserId(userId) {
    try {
      console.log('=== EMPLOYEE SERVICE GET BY USER ID START ===');
      console.log('User ID:', userId);

      const employee = await db.Employee.findOne({
        where: { userId },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role']
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type']
          }
        ]
      });

      console.log('Employee found:', employee);

      if (!employee) {
        console.log('No employee found for userId:', userId);
        return null;
      }

      return employee;
    } catch (error) {
      console.error('=== EMPLOYEE SERVICE GET BY USER ID ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },
};


export default employeeService;