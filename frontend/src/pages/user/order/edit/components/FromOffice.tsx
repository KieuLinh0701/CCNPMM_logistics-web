import React, { useEffect } from "react";
import { Card, Collapse, Form, Select } from "antd";
import { styles } from "../../style/Order.styles";
import { Office } from "../../../../../types/office";
import { FormInstance } from "antd/lib";

interface Props {
  form: FormInstance; 
  status: string; 
  selectedOffice?: Office | null; 
  offices: Office[]; 
  onChange: (office: Office | null) => void; 
}

const FromOffice: React.FC<Props> = ({ form, status, selectedOffice, offices, onChange }) => {

  useEffect(() => {
    form.setFieldsValue({ senderOfficeId: selectedOffice?.id });
  }, [selectedOffice, form]);

  return (
    <Card style={styles.customCard}>
      <div style={styles.cardTitleEdit}>Bưu cục gửi</div>
        <Form form={form} layout="vertical" initialValues={{ senderOfficeId: selectedOffice?.id }}>
          <Form.Item
            name="senderOfficeId"
            label="Chọn bưu cục"
            rules={[{ required: true, message: "Vui lòng chọn bưu cục" }]}
          >
            <Select
              placeholder="Chọn bưu cục"
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

export default FromOffice;