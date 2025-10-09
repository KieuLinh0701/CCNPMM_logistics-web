import React, { useEffect, useState } from "react";
import { Form, Input, Select } from "antd";
import axios from "axios";

const { Option } = Select;

interface Province {
  code: number;
  name: string;
}

interface Commune {
  code: number;
  name: string;
}

interface AddressFormProps {
  form: any;
  prefix: string; // 
  initialCity?: number;
  initialWard?: number;
  initialDetail?: string;
  disableCity?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  form,
  prefix,
  initialCity,
  initialWard,
  initialDetail,
  disableCity,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);

  // 🆕 Watch province theo prefix
  const selectedProvince = Form.useWatch([prefix, "province"], form);

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/v2/p/")
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (initialDetail) {
      form.setFieldsValue({
        [prefix]: {
          ...form.getFieldValue(prefix),
          address: initialDetail,
        },
      });
    }
  }, [initialDetail, form, prefix]);

  interface ProvinceDetail {
    name: string;
    code: number;
    wards: {
      code: number;
      name: string;
      province_code: number;
    }[];
  }

  useEffect(() => {
    const provinceCode = selectedProvince || initialCity;
    if (provinceCode) {
      axios.get<ProvinceDetail>(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`)
        .then((res) => {
          const wards: Commune[] = (res.data.wards || []).map(w => ({ code: w.code, name: w.name }));
          setCommunes(wards);

          // ✅ Nếu có initialWard, set commune sau khi wards load xong
          if (initialWard) {
            form.setFieldsValue({
              [prefix]: {
                ...form.getFieldValue(prefix),
                commune: initialWard,
              }
            });
          }

        })
        .catch(err => console.error(err));
    }
  }, [selectedProvince, initialCity, initialWard, form, prefix]);

  return (
    <>
      <Form.Item
        name={[prefix, "province"]}
        label="Tỉnh / Thành phố"
        rules={[{ required: true, message: "Chọn tỉnh / thành phố!" }]}
      >
        <Select
          showSearch
          placeholder="Chọn tỉnh/thành phố"
          optionFilterProp="label"
          disabled={disableCity}
          filterOption={(input, option) =>
            (option?.label as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {provinces.map((p) => (
            <Option key={p.code} value={p.code} label={p.name}>
              {p.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name={[prefix, "commune"]}
        label="Phường / Xã"
        rules={[{ required: true, message: "Chọn phường / xã!" }]}
      >
        <Select
          showSearch
          placeholder="Chọn phường/xã"
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          disabled={!selectedProvince && !initialCity}
        >
          {communes.map((c) => (
            <Option key={c.code} value={c.code} label={c.name}>
              {c.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name={[prefix, "address"]}
        label="Chi tiết"
        rules={[{ required: true, message: "Nhập số nhà, tên đường!" }]}
      >
        <Input placeholder="Số nhà, tên đường..." />
      </Form.Item>
    </>
  );
};

export default AddressForm;