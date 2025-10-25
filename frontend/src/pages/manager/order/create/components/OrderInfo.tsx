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
import { styles } from "../../../../user/order/style/Order.styles";
import { FormInstance } from "antd/lib";

const { Option } = Select;

interface Props {
  form: FormInstance;
  weight: number;
  orderValue: number;
  serviceTypes?: serviceType[];
  serviceLoading: boolean;
  selectedServiceType: serviceType | null;
  setSelectedServiceType: (val: any) => void;
  onChangeOrderInfo?: (changedValues: any) => void;
}

const OrderInfo: React.FC<Props> = ({
  form,
  weight,
  orderValue,
  serviceTypes,
  serviceLoading,
  selectedServiceType,
  setSelectedServiceType,
  onChangeOrderInfo,
}) => {

  // Thêm hàm xử lý change trực tiếp
  const handleWeightChange = (value: number | null) => {
    if (value !== null) {
      onChangeOrderInfo?.({ weight: value });
    } else {
      // Khi xóa giá trị, set về undefined để hiển thị placeholder
      form.setFieldValue('weight', undefined);
      onChangeOrderInfo?.({ weight: 0 });
    }
  };

  const handleOrderValueChange = (value: number | null) => {
    if (value !== null) {
      onChangeOrderInfo?.({ orderValue: value });
    } else {
      form.setFieldValue('orderValue', undefined);
      onChangeOrderInfo?.({ orderValue: 0 });
    }
  };

  const handleCodChange = (value: number | null) => {
    if (value !== null) {
      onChangeOrderInfo?.({ codAmount: value });
    } else {
      form.setFieldValue('codAmount', undefined);
      onChangeOrderInfo?.({ codAmount: 0 });
    }
  };

  return (
    <div style={styles.rowContainerEdit}>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues) => {
          onChangeOrderInfo?.(changedValues);
        }}
        initialValues={{
          weight: undefined,
          orderValue: undefined,
          codAmount: undefined,
          serviceType: undefined
        }}
      >
        <Card style={styles.customCard}>
          <div style={styles.cardTitle}>Thông tin đơn hàng</div>

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
                      // Chỉ kiểm tra khi có giá trị
                      if (value !== undefined && value !== null && value !== '') {
                        if (isNaN(value) || value <= 0) {
                          return Promise.reject(new Error("Khối lượng phải là số lớn hơn 0"));
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                validateTrigger={['onChange', 'onBlur']}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Ví dụ: 1.5"
                  onChange={handleWeightChange}
                  min={0.01}
                  step={0.01}
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
                  placeholder="Chọn dịch vụ..."
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
                  loading={serviceLoading}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
                    message: "Tổng giá trị hàng hóa phải lớn hơn 0",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Ví dụ: 150,000"
                  min={0} 
                  step={1000}
                  onChange={handleOrderValueChange}
                  formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
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