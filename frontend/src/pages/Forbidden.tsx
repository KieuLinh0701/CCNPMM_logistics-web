import React from "react";
import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import { Color } from "antd/es/color-picker";

const Forbidden: React.FC = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
      extra={
        <Link to="/home">
          <Button style={{ background: "#1C3D90", color: "#fff", height: "40px"}}>
            Về trang chủ
          </Button>
        </Link>
      }
    />
  );
};

export default Forbidden;