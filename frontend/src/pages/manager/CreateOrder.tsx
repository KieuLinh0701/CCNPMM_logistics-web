import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Typography,
  Card,
  message,
  Modal,
  List,
  Radio,
  Divider,
  Collapse,
  Tooltip,
} from "antd";
import AddressForm from "../../components/AdressForm";
import { InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getActiveServiceTypes } from "../../store/serviceTypeSlice";
import { serviceType } from "../../types/serviceType";
import { Order } from "../../types/order";
import { calculateShippingFee as calculateShippingFeeThunk } from "../../store/orderSlice";

const { Text } = Typography;
const { Option } = Select;

const CreateOrder: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  
  const [totalFee, setTotalFee] = useState<number>(0);

  // Lấy serviceType slice
  const { serviceTypes, loading: serviceLoading, error: serviceError } =
    useSelector((state: RootState) => state.serviceType);

  // Lấy order slice
  const { shippingFee, loading: orderLoading, error: orderError } =
    useSelector((state: RootState) => state.order);

  const [selectedServiceType, setSelectedServiceType] = useState<serviceType | null>(null);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);

  const promoList = [
    { code: "PROMO10", desc: "Giảm 10% cho đơn hàng đầu tiên" },
    { code: "FREESHIP", desc: "Miễn phí vận chuyển tối đa 30k" },
    { code: "SALE20", desc: "Giảm 20% cho đơn từ 200k" },
    { code: "SAVE50", desc: "Giảm 50k cho đơn từ 300k" },
    { code: "NEWUSER", desc: "Ưu đãi dành cho khách mới" },
    { code: "SPRING", desc: "Giảm 30% mùa xuân" },
  ];

  useEffect(() => {
    dispatch(getActiveServiceTypes());
  }, [dispatch]);

  useEffect(() => {
    if (serviceError) {
      message.error(serviceError);
    }
    if (orderError) {
      message.error(orderError);
    }
  }, [serviceError, orderError]);

  useEffect(() => {
    if (serviceTypes && serviceTypes.length > 0 && !selectedServiceType) {
      setSelectedServiceType(serviceTypes[0]); 
    }
  }, [serviceTypes]);

  const calculateShippingFee = (
    weight: number,
    service: serviceType | null,
    senderCodeCity: number,
    recipientCodeCity: number
  ) => {
    if (!service) return;

    dispatch(
      calculateShippingFeeThunk({
        weight,
        serviceTypeId: service.id,
        senderCodeCity,
        recipientCodeCity,
      })
    );
  };

  const getDiscountValue = (promoCode: string, shippingFee: number) => {
    switch (promoCode) {
      case "PROMO10":
        return shippingFee * 0.1;
      case "FREESHIP":
        return Math.min(shippingFee, 30000);
      case "SALE20":
        return shippingFee >= 200000 ? 20000 : 0;
      case "SAVE50":
        return shippingFee >= 300000 ? 50000 : 0;
      default:
        return 0;
    }
  };

  const onFinish = (values: any) => {
    // map form values về type Order
    const order: Partial<Order> = {
      senderName: values.senderName,
      senderPhone: values.senderPhone,
      senderAddress: {
        codeCity: values.sender.province,
        codeWard: values.sender.commune,
        detailAddress: values.sender.address,
      },

      recipientName: values.recipientName,
      recipientPhone: values.recipientPhone,
      recipientAddress: {
        codeCity: values.recipient.province,
        codeWard: values.recipient.commune,
        detailAddress: values.recipient.address,
      },

      weight: values.weight,
      serviceType: selectedServiceType || undefined,
      cod: values.codAmount || 0,
      orderValue: values.orderValue || 0,

      payer: values.payer === "shop" ? "Shop" : "Customer",
      paymentMethod:
        values.paymentMethod === "bankTransfer"
          ? "BankTransfer"
          : values.paymentMethod === "vnpay"
          ? "VNPay"
          : values.paymentMethod === "zalopay"
          ? "ZaloPay"
          : "Cash",

      notes: values.note || "",
      discountAmount: 0,
      shippingFee: 0,
      status: "pending",
    };

    console.log("Order payload:", order);
    message.success("Tạo đơn hàng thành công!");
  };

  return (
    <div className="create-order-container">
      <Row gutter={24} style={{ height: "100%" }}>
        {/* LEFT CONTENT (scroll được) */}
        <Col xs={24} lg={18} className="left-content">
          <div className="scrollable-content">
            <div className="page-header" style={{ marginBottom: 32 }}></div>

            <Form form={form} 
              layout="vertical" 
              onFinish={onFinish}
              onValuesChange={(
                changedValues: any,
                allValues: {
                  sender?: { province: number; commune: number; address: string };
                  recipient?: { province: number; commune: number; address: string };
                  weight?: number;
                  serviceType?: number;
                }
              ) => {
                const { sender, recipient, weight, serviceType } = allValues;

                if (sender?.province && recipient?.province && weight && serviceType) {
                  const selectedService = serviceTypes?.find((s) => s.id === serviceType) || null;

                  // Gọi redux thunk để lấy shippingFee từ API
                  calculateShippingFee(weight, selectedService, sender.province, recipient.province);
                } else {
                  setTotalFee(0);
                }
              }}>
              <Card className="custom-card">
                <div className="card-title">Thông tin người gửi</div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="senderName"
                      label="Tên người gửi"
                      rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                      <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item
                      name="senderPhone"
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại" },
                      ]}
                    >
                      <Input placeholder="090xxxxxxx" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <AddressForm form={form} prefix="sender"/>
                  </Col>
                </Row>
              </Card>
              <Card className="custom-card">
                <div className="card-title">Thông tin người nhận</div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="recipientName"
                      label="Tên người nhận"
                      rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                      <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item
                      name="recipientPhone"
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại" },
                      ]}
                    >
                      <Input placeholder="090xxxxxxx" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <AddressForm form={form} prefix="recipient"/>
                  </Col>
                </Row>
              </Card>

              <Card className="custom-card">
                <div className="card-title">Thông tin đơn hàng</div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="weight"
                      label="Khối lượng (kg)"
                      rules={[
                        {
                          required: true,
                          type: "number",
                          min: 0,
                          message: "Nhập khối lượng hợp lệ",
                        },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} placeholder="Ví dụ: 1.5" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="serviceType"
                      label="Loại dịch vụ giao hàng"
                      rules={[{ required: true, message: "Chọn loại dịch vụ" }]}
                    >
                      <Select
                        placeholder="Chọn dịch vụ"
                        value={selectedServiceType?.id}
                        onChange={(value) => {
                          const selected = serviceTypes?.find(s => s.id === value);
                          setSelectedServiceType(selected || null);
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
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="codAmount"
                      label={
                        <span>
                          Tổng tiền thu hộ (COD) <Tooltip title="Số tiền khách hàng thanh toán khi nhận hàng"><InfoCircleOutlined /></Tooltip>
                        </span>
                      }
                      rules={[
                        {
                          type: "number",
                          min: 0,
                          message: "Nhập số tiền thu hộ hợp lệ",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Ví dụ: 20000"
                        defaultValue={ 0 }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="orderValue"
                      label={
                        <span>
                          Tổng giá trị hàng hóa <Tooltip title="Tổng giá trị sản phẩm trong đơn hàng (chưa bao gồm phí vận chuyển)”"><InfoCircleOutlined /></Tooltip>
                        </span>
                      }
                      rules={[
                        {
                          type: "number",
                          min: 0,
                          message: "Nhập tổng giá trị hàng hóa hợp lệ",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Ví dụ: 20000"
                        defaultValue={ 0 }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              <Card className="custom-card">
                <div className="card-title">Thanh toán</div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="payer"
                      label="Người trả phí"
                      initialValue="customer"
                      rules={[{ required: true, message: "Chọn người trả phí" }]}
                    >
                      <Select>
                        <Option value="customer">Khách hàng</Option>
                        <Option value="shop">Cửa hàng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="paymentMethod"
                      label="Phương thức thanh toán"
                      initialValue="cash"
                      rules={[{ required: true, message: "Chọn phương thức thanh toán" }]}
                    >
                      <Select>
                        <Option value="cash">Tiền mặt</Option>
                        <Option value="bankTransfer">Chuyển khoản</Option>
                        <Option value="vnpay">VNPay</Option>
                        <Option value="zalopay">ZaloPay</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              <Card className="custom-card" >
                    <div className="card-title">Ghi chú</div>
                    <Collapse ghost>
                      <Form.Item name="note">
                        <Input.TextArea
                          placeholder="Nhập ghi chú"
                          autoSize={{ minRows: 3, maxRows: 5 }}
                        />
                      </Form.Item>
                    </Collapse>
                  </Card>
            </Form>
          </div>
        </Col>

        {/* RIGHT SIDEBAR (cố định) */}
        <Col xs={24} lg={6} className="right-sidebar">
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Phí dịch vụ:</Text>
              <div >{shippingFee.toLocaleString()} VNĐ</div>
            </div>
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16 }}>Tổng phí:</Text>
              <div style={{ fontSize: 18, color: "#FF4D4F" }}>{totalFee.toLocaleString()} VNĐ</div>
            </div>

            <Input.Search
              placeholder="Nhập mã khuyến mãi"
              enterButton={
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  style={{ background: "#1C3D90", borderColor: "#1C3D90", padding: "0px 25px" }}
                />
              }
              style={{ marginBottom: 12}}
            />

            <Button
              type="dashed"
              block
              style={{ marginBottom: 16, borderColor: "#1C3D90", color: "#1C3D90", }}
              onClick={() => setShowPromoModal(true)}
            >
              Chọn mã khuyến mãi
            </Button>
          </div>

          {/* NHÓM NÚT DƯỚI CÙNG */}
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            <Button block style={{ borderColor: "#1C3D90", color: "#1C3D90" }}>Lưu nháp </Button>

            <Button type="primary" block style={{ background: "#1C3D90" }} htmlType="submit">
              Tạo đơn
            </Button>
          </div>
        </Col>
      </Row>

      {/* MODAL PROMO */}
      <Modal
        title="Chương trình khuyến mãi"
        open={showPromoModal}
        onCancel={() => setShowPromoModal(false)}
        footer={null}
        centered
        bodyStyle={{ display: "flex", flexDirection: "column", height: 500, padding: 0 }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <Radio.Group
            value={selectedPromo}
            onChange={(e) => setSelectedPromo(e.target.value)}
            style={{ width: "100%" }}
          >
            <List
              dataSource={promoList}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                >
                  <Radio value={item.code}>
                    <div>
                      <Text strong>{item.code}</Text>
                      <div style={{ fontSize: 13, color: "#555" }}>{item.desc}</div>
                    </div>
                  </Radio>
                </List.Item>
              )}
            />
          </Radio.Group>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 16px",
            borderTop: "1px solid #f0f0f0",
            background: "#fff",
          }}
        >
          <Button
            style={{
              borderColor: "#1C3D90",
              color: "#1C3D90",
            }}
            onClick={() => setShowPromoModal(false)}
          >
            Hủy
          </Button>

          <Button
            type="primary"
            style={{
              background: "#1C3D90",
              borderColor: "#1C3D90",
            }}
            disabled={!selectedPromo}
            onClick={() => {
              message.success(`Đã chọn mã ${selectedPromo}`);
              setShowPromoModal(false);
            }}
          >
            Áp dụng
          </Button>
        </div>
      </Modal>

      <style>{`
        .create-order-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
          padding: 0 16px;
          background: #fafafa;
        }
        .left-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 8px;
        }
        .custom-card {
          border-radius: 12px;
          margin-bottom: 30px;
          position: relative;
          border: 1px solid #e4e6eb; /* viền mỏng để rõ hơn */
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
        }
        .card-title {
          position: absolute;
          top: -12px;
          left: 16px;
          background: white;
          padding: 0 8px;
          font-weight: 600;
          color: #1C3D90;
          font-size: 16px;
        }
        .right-sidebar {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .summary-card {
          border-radius: 12px;
          position: sticky;
          top: 16px;
        }
        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 8px;

          /* Ẩn scrollbar trên Chrome, Edge, Safari */
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .scrollable-content::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
      `}</style>
    </div>
  );
};

export default CreateOrder;