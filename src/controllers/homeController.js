import db from '../models/index.js';

// Home page
let getHomePage = async (req, res) => {
    try {
        return res.json({
            message: 'Chào mừng đến với Hệ thống Quản lý Logistic',
            status: 'success'
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: 'Lỗi server',
            status: 'error'
        });
    }
}

// About page
let getAboutPage = (req, res) => {
    return res.json({
        message: 'Về chúng tôi - Hệ thống Quản lý Logistic',
        description: 'Hệ thống quản lý chuỗi giao nhận logistic được xây dựng với NodeJS, ExpressJS, ReactJS, TypeScript, MySQL và Ant Design.',
        features: [
            'Đăng ký tài khoản với OTP',
            'Đăng nhập với JWT',
            'Quản lý profile người dùng',
            'Phân quyền theo vai trò'
        ],
        status: 'success'
    });
}

export default {
    getHomePage: getHomePage,
    getAboutPage: getAboutPage
}
