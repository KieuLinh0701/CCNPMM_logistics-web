import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, Typography, Card, Row, Col, message, Spin } from "antd";
import { SearchOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;
const { Title, Text } = Typography;

interface Province {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

interface ProvinceDetailResponse {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
  wards?: Ward[];
}

interface Office {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  openingTime: string;
  closingTime: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface OfficeSearchBodyProps {
  // Có thể thêm props nếu cần
}

const OfficeSearchBody: React.FC<OfficeSearchBodyProps> = () => {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);

  useEffect(() => {
    // Load provinces
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/v2/p/")
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleProvinceChange = (provinceCode: number) => {
    setSelectedProvince(provinceCode);
    setWards([]);
    form.setFieldsValue({ ward: undefined });

    // Load wards for selected province
    axios
      .get<ProvinceDetailResponse>(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`)
      .then((res) => {
        const allWards: Ward[] = res.data?.wards || [];
        setWards(allWards);
      })
      .catch((err) => console.error(err));
  };

  const searchOffices = async (values: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (values.province) params.append('city', values.province);
      if (values.ward) params.append('ward', values.ward);
      if (values.search) params.append('search', values.search);

      const response = await axios.get(`/api/public/offices/search?${params.toString()}`);
      if ((response.data as any).success) {
        setOffices((response.data as any).data);
        if ((response.data as any).data.length === 0) {
          message.info("Không tìm thấy bưu cục nào phù hợp");
        }
      } else {
        message.error("Có lỗi xảy ra khi tìm kiếm");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi tìm kiếm bưu cục");
    } finally {
      setLoading(false);
    }
  };

  const getOfficeTypeText = (type: string) => {
    return type === "Head Office" ? "Trụ sở chính" : "Bưu cục";
  };

  return (
    <div style={{ padding: "20px", maxWidth: 1000, margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
        Tra cứu bưu cục
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={searchOffices}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: "Chọn tỉnh/thành phố!" }]}
              >
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  size="large"
                  onChange={handleProvinceChange}
                  style={{ height: 45 }}
                >
                  {provinces.map((p) => (
                    <Option key={p.code} value={p.code}>
                      {p.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="ward"
                label="Xã/Phường"
              >
                <Select
                  placeholder="Chọn xã/phường"
                  size="large"
                  disabled={!selectedProvince}
                  style={{ height: 45 }}
                >
                  {wards.map((w) => (
                    <Option key={w.code} value={w.code}>
                      {w.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="search"
                label="Tìm kiếm"
              >
                <Input
                  placeholder="Tên bưu cục, địa chỉ..."
                  size="large"
                  prefix={<SearchOutlined />}
                  style={{ height: 45 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                background: "#1C3D90",
                color: "white",
                width: "100%",
                height: 50,
                fontSize: 16
              }}
            >
              Tìm kiếm
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tìm kiếm bưu cục...</div>
        </div>
      )}

      {offices.length > 0 && (
        <div>
          <Title level={4}>Kết quả tìm kiếm ({offices.length} bưu cục)</Title>
          <Row gutter={[16, 16]}>
            {offices.map((office) => (
              <Col span={24} key={office.id}>
                <Card>
                  <Row gutter={16}>
                    <Col span={18}>
                      <div style={{ marginBottom: 8 }}>
                        <Title level={5} style={{ margin: 0, color: "#1C3D90" }}>
                          {office.name}
                        </Title>
                        <Text type="secondary">{getOfficeTypeText(office.type)}</Text>
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <EnvironmentOutlined style={{ marginRight: 8, color: "#666" }} />
                        <Text>{office.address}</Text>
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <PhoneOutlined style={{ marginRight: 8, color: "#666" }} />
                        <Text>{office.phoneNumber}</Text>
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <MailOutlined style={{ marginRight: 8, color: "#666" }} />
                        <Text>{office.email}</Text>
                      </div>

                      <div>
                        <ClockCircleOutlined style={{ marginRight: 8, color: "#666" }} />
                        <Text>Giờ làm việc: {office.openingTime} - {office.closingTime}</Text>
                      </div>
                    </Col>

                    <Col span={6} style={{ textAlign: "right" }}>
                      <Button
                        type="primary"
                        size="small"
                        style={{ background: "#1C3D90", marginBottom: 8 }}
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${office.latitude},${office.longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        Xem bản đồ
                      </Button>
                      <br />
                      <Button
                        size="small"
                        onClick={() => {
                          window.open(`tel:${office.phoneNumber}`);
                        }}
                      >
                        Gọi điện
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default OfficeSearchBody;