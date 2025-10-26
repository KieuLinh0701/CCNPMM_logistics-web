# CCNPMM Logistics

## Giới thiệu dự án

**CCNPMM Logistics** là một hệ thống quản lý chuỗi giao nhận logistics toàn diện được xây dựng cho các đơn vị vận chuyển. Hệ thống cung cấp các tính năng quản lý đơn hàng, theo dõi vận chuyển, quản lý COD (Cash on Delivery), và các chức năng quản trị khác.

### Mục tiêu dự án

- Xây dựng hệ thống quản lý logistics hiện đại và hiệu quả
- Tối ưu hóa quy trình giao nhận và vận chuyển
- Cung cấp giao diện thân thiện cho các vai trò khác nhau
- Đảm bảo tính bảo mật và độ tin cậy cao

### Tính năng chính

#### Quản lý người dùng
- **Admin**: Quản lý toàn hệ thống, xem báo cáo tổng quan
- **Manager**: Quản lý bưu cục, giám sát hoạt động
- **Driver**: Quản lý phương tiện, theo dõi lộ trình vận chuyển
- **Shipper**: Giao hàng, thu tiền COD, báo cáo giao hàng

#### Quản lý đơn hàng
- Tạo và theo dõi đơn hàng
- Quản lý trạng thái đơn hàng (Pending, In Transit, Delivered, Cancelled)
- Theo dõi lịch sử giao hàng
- Quản lý COD (Cash on Delivery)

#### Quản lý vận chuyển
- Quản lý phương tiện (Truck, Van, Motorcycle)
- Theo dõi trạng thái phương tiện (Available, In Use, Maintenance, Archived)
- Tính toán lộ trình tối ưu với khoảng cách thực tế
- Ước tính thời gian giao hàng dựa trên loại phương tiện

#### Quản lý bưu cục
- Quản lý thông tin bưu cục
- Theo dõi hoạt động giao nhận
- Báo cáo thống kê theo bưu cục

#### Quản lý COD
- Thu tiền COD từ khách hàng
- Nộp tiền COD cho bưu cục
- Theo dõi lịch sử nộp tiền
- Báo cáo chênh lệch tiền

#### Báo cáo và thống kê
- Dashboard tổng quan
- Báo cáo doanh thu
- Thống kê hiệu suất giao hàng
- Báo cáo COD

### Công nghệ sử dụng

#### Backend
- **Node.js**
- **Express.js**
- **Sequelize**
- **JWT**
- **Socket.io**
- **Babel**

#### Frontend
- **React.js**
- **TypeScript**
- **Ant Design**
- **React Router**
- **Axios**

#### Database
- **MySQL**

#### Development Tools
- **Nodemon**: Auto-restart development server
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0.0
- **Git**: Latest version

### Bước 1: Clone repository

```bash
git clone https://github.com/KieuLinh0701/CCNPMM_logistics-web.git
cd CCNPMM_logistics-web
```

### Bước 2: Cài đặt dependencies

#### Cài đặt backend dependencies
```bash
npm install
```

#### Cài đặt frontend dependencies
```bash
cd frontend
npm install
cd ..
```

### Bước 3: Cấu hình database

#### Tạo database MySQL
```sql
CREATE DATABASE logistic_system;
```

#### Chạy migrations (nếu có)
```bash
# Chạy các file migration trong thư mục src/migrations/
# Hoặc import database schema từ file SQL
```

### Bước 4: Tạo file .env

Tạo file `.env` trong thư mục gốc của dự án với nội dung sau:

```env
# Server Configuration
PORT=8088
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=logistic_system

# JWT Configuration
JWT_SECRET=

# Email Configuration (Optional)
EMAIL_USER=
EMAIL_PASS=

# File Upload Configuration
UPLOAD_PATH=./uploads

### Bước 5: Khởi chạy ứng dụng

#### Chạy backend server
```bash
npm start
```

Backend sẽ chạy tại: `http://localhost:8088`

#### Chạy frontend (terminal mới)
```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Cách chạy dự án

### Development Mode

1. **Khởi động backend:**
   ```bash
   npm start
   ```
   - Server sẽ tự động restart khi có thay đổi code (nodemon)
   - API endpoints: `http://localhost:8088/api`

2. **Khởi động frontend:**
   ```bash
   cd frontend
   npm start
   ```
   - Frontend sẽ tự động reload khi có thay đổi
   - Giao diện web: `http://localhost:3000`
