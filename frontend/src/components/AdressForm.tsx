import React, { useEffect, useState } from 'react';
import { Form, Input, Select } from 'antd';
import axios from 'axios';

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
  initialProvince?: number;
  initialCommune?: number;
}

const AddressForm: React.FC<AddressFormProps> = ({
  form,
  initialProvince,
  initialCommune
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);

  // Lấy giá trị đang chọn
  const selectedProvince = Form.useWatch("province", form);

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    axios.get<Province[]>("https://provinces.open-api.vn/api/v2/p/")
      .then(res => setProvinces(res.data))
      .catch(err => console.error(err));
  }, []);

  // Lấy danh sách phường/xã khi chọn province
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
    const provinceCode = selectedProvince || initialProvince;
    if (provinceCode) {
      axios.get<ProvinceDetail>(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`)
        .then((res) => {
          const wards: Commune[] = (res.data.wards || []).map((w) => ({
            code: w.code,
            name: w.name
          }));
          setCommunes(wards);

          // Nếu ban đầu có initialCommune và chưa chọn province, set default
          if (initialCommune && !selectedProvince) {
            form.setFieldsValue({ province: provinceCode, commune: initialCommune });
          }

          // Nếu đã chọn province mới mà commune cũ không thuộc, reset commune
          const currentCommune = form.getFieldValue('commune');
          if (currentCommune && !wards.some(w => w.code === currentCommune)) {
            form.setFieldsValue({ commune: undefined });
          }
        })
        .catch(err => console.error(err));
    } else {
      setCommunes([]);
      form.setFieldsValue({ commune: undefined });
    }
  }, [selectedProvince, initialProvince, initialCommune, form]);

  return (
    <>
      <Form.Item name="province" label="Tỉnh / Thành phố" rules={[{ required: true, message: 'Chọn tỉnh / thành phố!' }]}>
        <Select
          showSearch
          placeholder="Chọn tỉnh/thành phố"
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label as string).toLowerCase().includes(input.toLowerCase())
          }
        >
          {provinces.map(p => (
            <Option key={p.code} value={p.code} label={p.name}>
              {p.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="commune" label="Phường / Xã" rules={[{ required: true, message: 'Chọn phường / xã!' }]}>
        <Select
          showSearch
          placeholder="Chọn phường/xã"
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label as string).toLowerCase().includes(input.toLowerCase())
          }
          disabled={!selectedProvince && !initialProvince}
        >
          {communes.map(c => (
            <Option key={c.code} value={c.code} label={c.name}>
              {c.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="address" label="Chi tiết" rules={[{ required: true, message: 'Nhập số nhà, tên đường!' }]}>
        <Input placeholder="Số nhà, tên đường..." />
      </Form.Item>
    </>
  );
};

export default AddressForm;