import React, { useEffect, useState } from 'react';
import { Button, Typography, Row, Col, Space, Tag, Modal, Form, Input, TimePicker, Select, message } from 'antd';
import {
  EditOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, IdcardOutlined,
  LinkOutlined, ClockCircleOutlined, BankOutlined, CheckCircleOutlined, CloseCircleOutlined, ToolOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateOffice, getByUserId } from '../../store/officeSlice';
import dayjs from 'dayjs';
import AddressForm from '../../components/AdressForm';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Fix icon Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
});

const { Title, Text } = Typography;
const { Option } = Select;

const Office = () => {
  const dispatch = useAppDispatch();
  const { office, loading } = useAppSelector(state => state.office);
  const { user } = useAppSelector(state => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [cityName, setCityName] = useState('');
  const [wardName, setWardName] = useState('');
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([10.762622, 106.660172]); // default HCMC

  // Lấy tên city và ward
  useEffect(() => {
    const fetchCityAndWard = async () => {
      try {
        if (office?.codeCity) {
          const cityRes = await axios.get<{ name: string }>(`https://provinces.open-api.vn/api/v2/p/${office.codeCity}`);
          setCityName(cityRes.data.name);
        }
        if (office?.codeWard) {
          const wardRes = await axios.get<{ name: string }>(`https://provinces.open-api.vn/api/v2/w/${office.codeWard}`);
          setWardName(wardRes.data.name);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCityAndWard();
  }, [office?.codeCity, office?.codeWard]);

  useEffect(() => {
    if (!office && user?.id !== undefined) {
      dispatch(getByUserId(user.id));
    } else if (office?.latitude && office?.longitude) {
      setMarkerPosition([office.latitude, office.longitude]);
    }
  }, [dispatch, office, user?.id]);

  const getType = (type: string) => {
    switch (type) {
      case 'Head Office': return 'Trụ sở chính';
      case 'Post Office': return 'Chi nhánh';
      default: return 'Không xác định';
    }
  };

  const getStatus = (status: string) => {
    switch (status) {
      case 'Active': return <Tag icon={<CheckCircleOutlined />} color="green">Đang hoạt động</Tag>;
      case 'Inactive': return <Tag icon={<CloseCircleOutlined />} color="red">Ngừng hoạt động</Tag>;
      case 'Maintenance': return <Tag icon={<ToolOutlined />} color="orange">Bảo trì</Tag>;
      default: return <Tag color="default">Không xác định</Tag>;
    }
  };

  const showModal = () => {
    if (office) {
      form.resetFields();
      form.setFieldsValue({
        name: office.name,
        phoneNumber: office.phoneNumber,
        email: office.email,
        address: office.address,
        cityName,
        wardName,
        openingTime: office.openingTime ? dayjs(office.openingTime, "HH:mm") : null,
        closingTime: office.closingTime ? dayjs(office.closingTime, "HH:mm") : null,
        type: office.type,
        status: office.status
      });

      if (office.latitude && office.longitude) {
        setMarkerPosition([office.latitude, office.longitude]);
      }
    }
    setIsModalOpen(true);
  };

  // Map marker drag component
  const DraggableMarker: React.FC = () => {
    const [position, setPosition] = useState(markerPosition);

    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
      }
    });

    return (
      <Marker
        draggable
        eventHandlers={{
          dragend: (e) => {
            const latLng = e.target.getLatLng();
            setPosition([latLng.lat, latLng.lng]);
            setMarkerPosition([latLng.lat, latLng.lng]);
          },
        }}
        position={position}
      />
    );
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!office) return;

      await dispatch(updateOffice({
        id: office.id,
        name: values.name,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.office.address,
        codeCity: values.office.province,
        codeWard: values.office.commune,
        latitude: markerPosition[0],
        longitude: markerPosition[1],
        openingTime: values.openingTime?.format("HH:mm:ss"),
        closingTime: values.closingTime?.format("HH:mm:ss"),
        type: values.type,
        status: values.status,
      })).unwrap();

      message.success("Cập nhật thành công!");
      setIsModalOpen(false);

    } catch (error) {
      console.error(error);
      message.error("Cập nhật thất bại!");
    }
  };

  const handleCancel = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Đang tải thông tin bưu cục...</Text>
      </div>
    );
  }

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={16} lg={12}>
        <div style={{ padding: 24 }}>
          <Title level={3} style={{ textAlign: 'center', color: "#1C3D90" }}>
            <BankOutlined style={{ marginRight: 8 }} />
            {office?.name || "Bưu cục chưa có tên"}
          </Title>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text><IdcardOutlined /> <b>Mã bưu cục:</b> {office?.code || "Chưa có"}</Text>
            <Text><PhoneOutlined /> <b>Số điện thoại:</b> {office?.phoneNumber || "Chưa có"}</Text>
            <Text><MailOutlined /> <b>Email:</b> {office?.email || "Chưa có"}</Text>
            <Text><EnvironmentOutlined /> <b>Địa chỉ:</b> {office ? `${office.address}, ${wardName}, ${cityName}` : "Chưa có"}</Text>
            <Text><ClockCircleOutlined /> <b>Giờ mở cửa:</b> {office?.openingTime || "Chưa có"}</Text>
            <Text><ClockCircleOutlined /> <b>Giờ đóng cửa:</b> {office?.closingTime || "Chưa có"}</Text>
            <Text><BankOutlined /> <b>Loại bưu cục:</b> {getType(office?.type || "")}</Text>
            <Text><b>Trạng thái:</b> {getStatus(office?.status || "")}</Text>

            <div style={{ marginTop: 8 }}>
              <Text><LinkOutlined /> <b>Bản đồ:</b></Text>
              <div style={{ marginTop: 8 }}>
                <iframe
                  width="100%"
                  height="250"
                  style={{ border: 0, borderRadius: "8px" }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${markerPosition[0]},${markerPosition[1]}&hl=vi&z=15&output=embed`}
                />
              </div>
            </div>
          </Space>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              shape="round"
              size="large"
              onClick={showModal}
              style={{ backgroundColor: "#1C3D90" }}
            >
              Chỉnh sửa thông tin
            </Button>
          </div>
        </div>

        <Modal
          title={<span style={{ color: '#1C3D90', fontWeight: 'bold', fontSize: '18px', display: 'flex', justifyContent: 'center' }}>Chỉnh sửa thông tin bưu cục</span>}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Lưu"
          cancelText="Hủy"
          okButtonProps={{ style: { backgroundColor: '#1C3D90', borderRadius: '8px', color: '#fff' } }}
          cancelButtonProps={{ style: { border: '1px solid #1C3D90', borderRadius: '8px', color: '#1C3D90' } }}
          centered
          width={700}
          bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px', boxSizing: 'border-box' }}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Tên bưu cục" rules={[{ required: true, message: 'Nhập tên bưu cục!' }]}><Input /></Form.Item>
            <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}><Input /></Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }]}><Input /></Form.Item>
            <AddressForm form={form} initialCity={office?.codeCity} initialWard={office?.codeWard} initialDetail={office?.address} prefix="office"/>
            <Form.Item name="openingTime" label="Giờ mở cửa"><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="closingTime" label="Giờ đóng cửa"><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="type" label="Loại bưu cục">
              <Select><Option value="Head Office">Trụ sở chính</Option><Option value="Post Office">Chi nhánh</Option></Select>
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Option value="Active">Đang hoạt động</Option>
                <Option value="Inactive">Ngừng hoạt động</Option>
                <Option value="Maintenance">Bảo trì</Option>
              </Select>
            </Form.Item>

            {/* Map chỉnh tọa độ */}
            <div style={{ marginTop: 16 }}>
              <Text><LinkOutlined /> <b>Kéo marker để chỉnh tọa độ:</b></Text>
              <MapContainer center={markerPosition} zoom={15} style={{ height: 300, width: '100%', marginTop: 8 }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <DraggableMarker />
              </MapContainer>
            </div>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};

export default Office;