import React, { useEffect } from "react";
import { Card, Collapse, Form, Select } from "antd";
import { styles } from "../../../../user/order/style/Order.styles";
import { FormInstance } from "antd/lib";
import { Office } from "../../../../../types/office";
import { City, Ward } from "../../../../../types/location";

interface Props {
  form: FormInstance;
  status: string;
  title?: string;
  selectedOffice?: Office | null;
  offices: Office[];
  onChange: (office: Office | null) => void;
  cities: City[];
  wards: Ward[];
}

const OfficeCard: React.FC<Props> = ({ form, status, title, selectedOffice, offices, onChange, cities, wards }) => {

  useEffect(() => {
    form.setFieldsValue({ officeId: selectedOffice?.id });
  }, [selectedOffice, form]);

  // Hàm lấy địa chỉ hiển thị
  const getAddress = (office: Office) => {
    const wardName = wards.find((w) => w.code === office.codeWard)?.name || "";
    const cityName = cities.find((c) => c.code === office.codeCity)?.name || "";
    return [office.address, wardName, cityName].filter(Boolean).join(", ");
  };

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
            optionLabelProp="label"
            style={{ width: "100%" }}
            onChange={(value) => {
              const office = offices.find((o) => o.id === value) || null;
              onChange(office);
            }}
          >
            {offices.map((o) => (
              <Select.Option
                key={o.id}
                value={o.id}
                label={o.name}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600 }}>{o.name}</span>
                  <span style={{ fontSize: 12, color: "#666" }}>{getAddress(o)}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default OfficeCard;