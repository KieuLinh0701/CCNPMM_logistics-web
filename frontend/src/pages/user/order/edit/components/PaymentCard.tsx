import React from "react";
import { Card, Col, Form, Row, Select } from "antd";
import { styles } from "../../style/Order.styles";
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
              return;
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
                          {paymentMethods.map((paymentMethod) => (
                            <Option key={paymentMethod} value={paymentMethod}>
                              {translateOrderPaymentMethod(paymentMethod)}
                            </Option>
                          ))}
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