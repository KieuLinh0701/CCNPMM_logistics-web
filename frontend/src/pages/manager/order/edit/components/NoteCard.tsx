import React from "react";
import { Card, Collapse, Form, Input } from "antd";
import { styles } from "../../../../user/order/style/Order.styles";

interface Props {
  notes?: string;
  onChangeNotes?: (value: string) => void;
}

const NoteCard: React.FC<Props> = ({ notes, onChangeNotes }) => {
  const [form] = Form.useForm();

  return (
    <Card style={styles.customCard}>
      <div style={styles.cardTitleEdit}>Ghi chú</div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ notes: notes }}
      >
        <Form.Item name="notes">
          <Input.TextArea
            placeholder="Nhập ghi chú"
            autoSize={{ minRows: 3 }}
            onChange={(e) => onChangeNotes?.(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NoteCard;