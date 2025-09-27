import React, { useEffect, useState } from "react";
import { Form, InputNumber, Select, Button, Typography, Row, Col, message } from "antd";
import HeaderHome from "../../components/header/HeaderHome";
import FooterHome from "../../components/footer/FooterHome";
import axios from "axios";
import { serviceType } from "../../types/serviceType";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getActiveServiceTypes } from "../../store/serviceTypeSlice";
import { calculateShippingFee as calculateShippingFeeThunk } from "../../store/orderSlice";

const { Option } = Select;
const { Title, Text } = Typography;

interface Province {
  code: number;
  name: string;
}

const ShippingFee: React.FC = () => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<serviceType | null>(null);
  const [shippingFeeResult, setShippingFeeResult] = useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { serviceTypes, loading: serviceLoading } = useSelector(
    (state: RootState) => state.serviceType
  );

  useEffect(() => {
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/v2/p/")
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    dispatch(getActiveServiceTypes());
  }, [dispatch]);

  const calculateShippingFee = async (values: any) => {
    if (!selectedServiceType) {
      message.error("Vui lòng chọn loại dịch vụ");
      return;
    }

    try {
      const resultAction: any = await dispatch(
        calculateShippingFeeThunk({
          weight: values.weight,
          serviceTypeId: selectedServiceType.id,
          senderCodeCity: values.fromProvince,  
          recipientCodeCity: values.toProvince,  
        })
      );

      if (resultAction.payload) {
        setShippingFeeResult(resultAction.payload.shippingFee); 
      }
    } catch (error) {
      message.error("Tính cước thất bại");
      console.error(error);
    }
  };

  const inputStyle = { width: "100%", height: 45, fontSize: 16 };

  return (
    <div>
      <HeaderHome />
      <div style={{ padding: "20px", maxWidth: 600, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Tra cứu cước vận chuyển
        </Title>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fromProvince"
                label="Gửi từ"
                rules={[{ required: true, message: "Chọn tỉnh/thành phố gửi hàng!" }]}
              >
                <Select placeholder="Tỉnh/thành phố" style={inputStyle}>
                  {provinces.map((p) => (
                    <Option key={p.code} value={p.code}>
                      {p.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="toProvince"
                label="Gửi đến"
                rules={[{ required: true, message: "Chọn tỉnh/thành phố nhận hàng!" }]}
              >
                <Select placeholder="Tỉnh/thành phố" style={inputStyle}>
                  {provinces.map((p) => (
                    <Option key={p.code} value={p.code}>
                      {p.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Khối lượng (kg)"
                rules={[{ required: true, message: "Nhập khối lượng!" }]}
              >
                <InputNumber
                  style={inputStyle}
                  min={0}
                  placeholder="Ví dụ: 0.5"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="serviceType"
                label="Loại dịch vụ giao hàng"
                rules={[{ required: true, message: "Chọn loại dịch vụ!" }]}
              >
                <Select
                  placeholder="Chọn dịch vụ"
                  style={inputStyle}
                  onChange={(value) => {
                    const selected = serviceTypes?.find((s) => s.id === value);
                    setSelectedServiceType(selected || null);
                    form.setFieldsValue({ serviceType: value });
                  }}
                >
                  {serviceLoading && <Option value="" disabled>Đang tải...</Option>}
                  {serviceTypes?.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              style={{ background: "#1C3D90", color: "fff", width: "100%", height: 50, fontSize: 16 }}
              onClick={() => form.validateFields().then(calculateShippingFee)
                .catch(() => {})
              }
            >
              Tra cứu
            </Button>
          </Form.Item>

          {shippingFeeResult !== null && (
            <div style={{ marginTop: 24, marginBottom: 32, textAlign: "center", padding: 16, background: "#fff0f0", borderRadius: 8 }}>
              <Text strong>TỔNG TIỀN CƯỚC VẬN CHUYỂN</Text>
              <div style={{ fontSize: 24, color: "#FF4D4F", margin: "8px 0" }}>
                {shippingFeeResult.toLocaleString()} VNĐ
              </div>
            </div>
          )}
        </Form>
      </div>
      <FooterHome />
    </div>
  );
};

export default ShippingFee;