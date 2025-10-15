import React, { useEffect } from "react";
import { Card, Form, Select } from "antd";
import { Office } from "../../../../../types/office";
import { FormInstance } from "antd/lib";
import { styles } from "../../../../user/order/style/Order.styles";

interface Props {
  form: FormInstance;
  selectedOffice?: Office | null;
  offices: Office[];
  onChange: (office: Office | null) => void;
}

const ToOffice: React.FC<Props> = ({ form, selectedOffice, offices, onChange }) => {
  
  // Đồng bộ giá trị selectedOffice với form
  useEffect(() => {
    form.setFieldsValue({ recipientOfficeId: selectedOffice?.id ?? undefined });
  }, [selectedOffice, form]);

  return (
    <Card style={styles.customCard}>
      <div style={styles.cardTitleEdit}>Bưu cục gửi</div>
      <Form form={form} layout="vertical">
        <Form.Item
          name="recipientOfficeId"
          label="Chọn bưu cục"
          rules={[{ required: true, message: "Vui lòng chọn bưu cục" }]}
        >
          <Select
            placeholder="Chọn bưu cục nhận"
            value={selectedOffice?.id} 
            onChange={(value) => {
              const office = offices.find((o) => o.id === value) || null;
              onChange(office);
            }}
          >
            {offices.map((o) => (
              <Select.Option key={o.id} value={o.id}>
                {o.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ToOffice;