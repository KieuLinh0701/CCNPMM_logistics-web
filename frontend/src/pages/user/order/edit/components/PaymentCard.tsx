import React from "react";
import { Card, Col, Form, Row, Select } from "antd";
import { styles } from "../../style/Order.styles";
import { FormInstance } from "antd/lib";

const { Option } = Select;

interface Props {
  form: FormInstance;
  payer?: string;
  paymentMethod?: string;
  onChangePayment?: (changedValues: any) => void;
}

const PaymentCard: React.FC<Props> = ({
  form,
  payer,
  paymentMethod,
  onChangePayment
}) => {
  return (
    <Card style={styles.customCard}>
      <div style={styles.cardTitleEdit}>Thanh toán</div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          payer: payer === "Shop" ? "Người gửi" : "Người nhận",
          paymentMethod: paymentMethod || "cash",
        }}
        onValuesChange={(changedValues, allValues) => {
          console.log("📝 Form changed:", changedValues); 
          
          // Nếu payer thay đổi, reset paymentMethod về Cash
          if (changedValues.payer) {
            const newPayer = changedValues.payer;
            const defaultPaymentMethod = "Cash";

            // Đổi từ Shop sang Customer hoặc Customer sang Shop
            if (newPayer === "Customer" || newPayer === "Shop") {
              form.setFieldsValue({ paymentMethod: defaultPaymentMethod });
              
              // Gọi onChangePayment với cả 2 giá trị đã thay đổi
              setTimeout(() => {
                const allCurrentValues = form.getFieldsValue();
                onChangePayment?.({
                  payer: newPayer,
                  paymentMethod: defaultPaymentMethod,
                  ...allCurrentValues
                });
              }, 0);
              return; // Dừng lại không gọi onChangePayment lần nữa
            }
          }

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
              <Select>
                <Option value="Customer">Người nhận</Option>
                <Option value="Shop">Người gửi</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              shouldUpdate={(prev, cur) => prev.payer !== cur.payer}
              noStyle
            >
              {({ getFieldValue }) => {
                const currentPayer = getFieldValue("payer");
                return (
                  <Form.Item
                    name="paymentMethod"
                    label="Phương thức thanh toán"
                    rules={[
                      { required: true, message: "Chọn phương thức thanh toán" },
                    ]}
                  >
                    <Select>
                      {currentPayer === "Customer" ? (
                        <Option value="Cash">Tiền mặt</Option>
                      ) : (
                        <>
                          <Option value="Cash">Tiền mặt</Option>
                          <Option value="VNPay">VNPay</Option>
                          <Option value="ZaloPay">ZaloPay</Option>
                        </>
                      )}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default PaymentCard;