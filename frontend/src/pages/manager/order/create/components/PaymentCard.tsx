import React from "react";
import { Card, Col, Form, Row, Select } from "antd";
import { styles } from "../../../../user/order/style/Order.styles";
import { FormInstance } from "antd/lib";
import { translateOrderPayer, translateOrderPaymentMethod } from "../../../../../utils/orderUtils";

const { Option } = Select;

interface Props {
  form: FormInstance;
  payer?: string;
  payers: string[];
  paymentMethods: string[];
  paymentMethod?: string;
  onChangePayment?: (changedValues: any) => void;
}

const PaymentCard: React.FC<Props> = ({
  form,
  payer,
  payers,
  paymentMethod,
  paymentMethods,
  onChangePayment
}) => {
  return (
    <Card style={styles.customCard}>
      <div style={styles.cardTitleEdit}>Thanh toán</div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          payer: payer,
          paymentMethod: paymentMethod || "Cash",
        }}
        onValuesChange={(changedValues) => {

          // Nếu payer thay đổi thành Customer, reset paymentMethod về Cash
          if (changedValues.payer === "Customer") {
            form.setFieldsValue({ paymentMethod: "Cash" });

            // Gọi onChangePayment với cả 2 giá trị
            onChangePayment?.({
              payer: "Customer",
              paymentMethod: "Cash"
            });
            return;
          }

          // Nếu payer thay đổi thành Shop, reset paymentMethod về Cash
          if (changedValues.payer === "Shop") {
            form.setFieldsValue({ paymentMethod: "Cash" });

            // Gọi onChangePayment với cả 2 giá trị
            onChangePayment?.({
              payer: "Shop",
              paymentMethod: "Cash"
            });
            return;
          }

          // Các trường hợp khác
          onChangePayment?.(changedValues);
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="payer"
              label="Người trả phí"
              rules={[{ required: true, message: "Chọn người trả phí" }]}
            >
              <Select placeholder="Chọn người trả phí">
                {payers.map((payer) => (
                  <Option key={payer} value={payer}>
                    {translateOrderPayer(payer)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              initialValue="Cash"
              rules={[{ required: true, message: "Chọn phương thức thanh toán" }]}
            >
              <Select value="Cash" disabled>
                <Option value="Cash">Tiền mặt</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default PaymentCard;