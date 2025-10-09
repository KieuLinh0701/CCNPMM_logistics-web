import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  InputNumber,
  Select,
  Button,
  Table,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { OrderProduct } from "../../../../../types/orderProduct";
import { serviceType } from "../../../../../types/serviceType";
import { styles } from "../../style/Order.styles";
import { FormInstance } from "antd/lib";

const { Option } = Select;

interface Props {
  form: FormInstance;
  weight: number;
  orderValue: number;
  cod: number
  status: string;
  orderProducts: OrderProduct[];
  orderColumns: any[];
  serviceTypes?: serviceType[];
  serviceLoading: boolean;
  selectedServiceType: serviceType;
  setSelectedServiceType: (val: any) => void;
  onOpenProductModal: () => void;
  onChangeOrderInfo?: (changedValues: any) => void;
}

const OrderInfo: React.FC<Props> = ({
  form, // Nhận form từ props
  weight,
  orderValue,
  cod,
  status,
  orderProducts,
  orderColumns,
  serviceTypes,
  serviceLoading,
  selectedServiceType,
  setSelectedServiceType,
  onOpenProductModal,
  onChangeOrderInfo
}) => {

  const isDraft = status === "draft";
  const isOrderValueDisabled = !(status === "draft" && orderProducts.length === 0);
  const isWeightDisabled = !(status === "draft" && orderProducts.length === 0);

  useEffect(() => {
    if (selectedServiceType) {
      form.setFieldsValue({
        weight,
        orderValue,
        codAmount: cod,
        serviceType: selectedServiceType.id,
      });
    }
  }, [weight, orderValue, cod, selectedServiceType, serviceTypes, form]);

  // Thêm hàm xử lý change trực tiếp
  const handleWeightChange = (value: number | null) => {
    console.log("⚖️ Weight thay đổi trực tiếp:", value);
    if (value !== null) {
      onChangeOrderInfo?.({ weight: value });
    }
  };

  const handleOrderValueChange = (value: number | null) => {
    console.log("💰 OrderValue thay đổi trực tiếp:", value);
    if (value !== null) {
      onChangeOrderInfo?.({ orderValue: value });
    }
  };

  const handleCodChange = (value: number | null) => {
    console.log("COD thay đổi trực tiếp:", value);
    if (value !== null) {
      onChangeOrderInfo?.({ codAmount: value });
    }
  };

  return (
    <div style={styles.rowContainerEdit}>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues) => {
          console.log("🔄 onValuesChange được gọi với:", changedValues);
          onChangeOrderInfo?.(changedValues);
        }}
      >
        <Card style={styles.customCard}>
          <div style={styles.cardTitle}>Thông tin đơn hàng</div>
          {isDraft && (
            <Button
              icon={<PlusOutlined />}
              type="primary"
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                zIndex: 5,
                background: "#1C3D90",
              }}
              onClick={onOpenProductModal}
            >
              Chọn sản phẩm
            </Button>
          )}

          {orderProducts.length > 0 && (
            <Table<OrderProduct>
              dataSource={orderProducts}
              rowKey={(record) => String(record.product.id)}
              pagination={false}
              columns={orderColumns}
              style={{ marginBottom: 12, marginTop: 24 }}
            />
          )}

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Khối lượng (kg)"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập khối lượng",
                  },
                  {
                    validator: (_, value) => {
                      if (value && (isNaN(value) || value <= 0)) {
                        return Promise.reject(new Error("Khối lượng phải lớn hơn 0"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Ví dụ: 1.5"
                  disabled={isWeightDisabled}
                  onChange={handleWeightChange}
                  min={0.001}
                  step={0.001}
                />
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
                  options={
                    serviceTypes?.map((s) => ({
                      label: s.name,
                      value: s.id,
                    })) || []
                  }
                  onChange={(value) => {
                    const selected = serviceTypes?.find((s) => s.id === value);
                    setSelectedServiceType(selected || null);
                    form.setFieldValue("serviceType", value);
                  }}
                  disabled={!isDraft}
                  loading={serviceLoading}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="codAmount"
                label={
                  <span>
                    Tổng tiền thu hộ (COD){" "}
                    <Tooltip title="Số tiền khách hàng thanh toán khi nhận hàng (chưa bao gồm phí vận chuyển)">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập tổng tiền thu hộ" },
                  { type: "number", min: 0, message: "Nhập số tiền thu hộ hợp lệ" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Ví dụ: 20000"
                  disabled={false}
                  onChange={handleCodChange} // ✅ Thêm onChange trực tiếp
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="orderValue"
                label={
                  <span>
                    Tổng giá trị hàng hóa{" "}
                    <Tooltip title="Tổng giá trị sản phẩm trong đơn hàng (chưa bao gồm phí vận chuyển)">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tổng giá trị hàng hóa",
                  },
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
                  disabled={isOrderValueDisabled}
                  onChange={handleOrderValueChange}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div >
  );
};

export default OrderInfo;