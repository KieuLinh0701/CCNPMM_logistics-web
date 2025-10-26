import db from '../models/index.js';
import { Op } from 'sequelize';

const bankAccountService = {
  // Lấy danh sách tất cả tài khoản của 1 user
  async list(userId) {
    try {
      const accounts = await db.BankAccount.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      return { success: true, accounts, total: accounts.length };
    } catch (error) {
      console.error('BankAccountService.list error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Thêm tài khoản mới
  async add(userId, payload) {
    try {
      if (!userId) return { success: false, message: 'UserId không hợp lệ' };

      const count = await db.BankAccount.count({ where: { userId } });
      if (count >= 5) return { success: false, message: 'Đạt tối đa 5 tài khoản, không thể thêm nữa' };

      // Nếu chưa có tài khoản nào, bắt buộc mặc định
      if (count === 0) payload.isDefault = true;

      // Nếu set mặc định, reset tất cả các tài khoản khác
      if (payload.isDefault) {
        await db.BankAccount.update({ isDefault: false }, { where: { userId } });
      }

      const account = await db.BankAccount.create({ ...payload, userId });
      return { success: true, account };
    } catch (error) {
      console.error('BankAccountService.add error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Cập nhật tài khoản
  async update(userId, accountId, payload) {
    try {
      const account = await db.BankAccount.findOne({ where: { id: accountId, userId } });
      if (!account) return { success: false, message: 'Tài khoản không tồn tại' };

      // Xác định giá trị isDefault mới
      const isDefault = payload.hasOwnProperty('isDefault') ? payload.isDefault : account.isDefault;

      // Nếu muốn bỏ mặc định và account đang mặc định
      if (isDefault === false && account.isDefault) {
        const otherDefaultCount = await db.BankAccount.count({
          where: { userId, id: { [Op.ne]: accountId }, isDefault: true },
        });
        if (otherDefaultCount === 0) {
          return { success: false, message: 'Phải có ít nhất 1 tài khoản mặc định' };
        }
      }

      // Nếu muốn đặt mặc định
      if (isDefault === true) {
        await db.BankAccount.update({ isDefault: false }, { where: { userId } });
      }

      await account.update(payload);
      return { success: true, account };
    } catch (error) {
      console.error('BankAccountService.update error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Đặt tài khoản làm mặc định
  async setDefault(userId, accountId, value) {
    try {
      const account = await db.BankAccount.findOne({ where: { id: accountId, userId } });
      if (!account) return { success: false, message: 'Tài khoản không tồn tại' };

      if (value === false) {
        return { success: false, message: 'Không thể bỏ mặc định, vui lòng chọn tài khoản khác làm mặc định nếu muốn thay đổi' };
      }

      await db.BankAccount.update({ isDefault: false }, { where: { userId } });
      await account.update({ isDefault: true });

      return { success: true, account };
    } catch (error) {
      console.error('BankAccountService.setDefault error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Xóa tài khoản
  async remove(userId, accountId) {
    try {
      const account = await db.BankAccount.findOne({ where: { id: accountId, userId } });
      if (!account) return { success: false, message: 'Tài khoản không tồn tại' };

      if (account.isDefault) {
        const otherAccount = await db.BankAccount.findOne({
          where: { userId, id: { [Op.ne]: accountId } },
        });
        if (otherAccount) {
          await otherAccount.update({ isDefault: true });
        }
      }

      await account.destroy();
      return { success: true, message: 'Xóa tài khoản thành công' };
    } catch (error) {
      console.error('BankAccountService.remove error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },
};

export default bankAccountService;