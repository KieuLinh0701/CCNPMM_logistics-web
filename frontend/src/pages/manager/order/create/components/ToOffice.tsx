import React, { useEffect } from "react";
import { Card, Form, Select } from "antd";
import { Office } from "../../../../../types/office";
import { FormInstance } from "antd/lib";
import { styles } from "../../../../user/order/style/Order.styles";
import { City, Ward } from "../../../../../types/location";

interface Props {
  form: FormInstance;
  selectedOffice?: Office | null;
  offices: Office[];
  onChange: (office: Office | null) => void;
  wards: Ward[];
  cities: City[];
}

const ToOffice: React.FC<Props> = ({ form, selectedOffice, offices, onChange, wards, cities }) => {

  // Đồng bộ giá trị selectedOffice với form
  useEffect(() => {
    form.setFieldsValue({ recipientOfficeId: selectedOffice?.id ?? undefined });
  }, [selectedOffice, form]);

  // Hàm lấy địa chỉ hiển thị
  const getAddress = (office: Office) => {
    const wardName = wards.find((w) => w.code === office.codeWard)?.name || "";
    const cityName = cities.find((c) => c.code === office.codeCity)?.name || "";
    return [office.address, wardName, cityName].filter(Boolean).join(", ");
  };

  return (
    <Card style={styles.customCard}>
      <div style={styles.cardTitleEdit}>Bưu cục nhận</div>
      <Form form={form} layout="vertical">
        <Form.Item
          name="recipientOfficeId"
          label="Chọn bưu cục"
          rules={[{ required: true, message: "Vui lòng chọn bưu cục" }]}
        >
          <Select
            placeholder="Chọn bưu cục"
            value={selectedOffice?.id}
            onChange={(value) => {
              const office = offices.find((o) => o.id === value) || null;
              onChange(office);
            }}
            optionLabelProp="label"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {offices.map((o) => {
              const address = getAddress(o);
              return (
                <Select.Option
                  key={o.id}
                  value={o.id}
                  label={o.name}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 500 }}>{o.name}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>{address || "Không có địa chỉ"}</span>
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ToOffice;