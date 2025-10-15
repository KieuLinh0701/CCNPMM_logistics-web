import React, { useEffect } from "react";
import { Card, Collapse, Form, Select } from "antd";
import { styles } from "../../../user/order/style/Order.styles";
import { FormInstance } from "antd/lib";
import { Office } from "../../../../types/office";

interface Props {
  form: FormInstance;
  status: string;
  title?: string;
  selectedOffice?: Office | null;
  offices: Office[];
  onChange: (office: Office | null) => void;
}

const OfficeCard: React.FC<Props> = ({ form, status, title, selectedOffice, offices, onChange }) => {

  useEffect(() => {
    form.setFieldsValue({ officeId: selectedOffice?.id });
  }, [selectedOffice, form]);

  return (
    <Card style={styles.customCard}>
      <div style={styles.cardTitleEdit}>
        {title}
      </div>
      <Form form={form} layout="vertical" initialValues={{ officeId: selectedOffice?.id }}>
        <Form.Item
          name="officeId"
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

export default OfficeCard;