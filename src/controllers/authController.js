import authService from '../services/authService.js';

// Register user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    const result = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Verify OTP and complete registration
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password, firstName, lastName, phoneNumber, role } = req.body;

    // Validation
    if (!email || !otp || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    const result = await authService.verifyOTPAndCreateUser(email, otp, {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    const result = await authService.loginUser(email, password);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const result = await authService.getUserProfile(userId);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

export default {
  register,
  verifyOTP,
  login,
  getProfile
};
