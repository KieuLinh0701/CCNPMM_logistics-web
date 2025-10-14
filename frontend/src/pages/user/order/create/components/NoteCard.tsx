import React from "react";
import { Card, Form, Input } from "antd";
import { styles } from "../../style/Order.styles";

interface Props {
  notes?: string;
  onChange?: (value: string) => void;
  disabled: boolean;
}

const NoteCard: React.FC<Props> = ({ notes, onChange, disabled }) => {
  const [form] = Form.useForm();

  return (
    <Card style={styles.customCard}>
      <div style={styles.cardTitleEdit}>Ghi chú</div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ notes: notes }}
        onValuesChange={(changedValues) => {
          if (changedValues.notes !== undefined) {
            onChange?.(changedValues.notes);
          }
        }}
      >
        <Form.Item name="notes">
          <Input.TextArea
            placeholder="Nhập ghi chú cho đơn hàng..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            disabled={disabled}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NoteCard;