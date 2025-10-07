import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Upload, 
  message,
  Steps,
  Divider
} from 'antd';
import { 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import shipperService from '../../services/shipperService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface OrderInfo {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  status: string;
  serviceType: string;
}

const ShipperDeliveryUpdate: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [currentStep] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

useEffect(() => {
  if (id) {
    fetchOrderInfo();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  const fetchOrderInfo = async () => {
    try {
      setLoading(true);
      const orderData = await shipperService.getOrderDetail(Number(id));
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order info:', error);
      message.error('Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (values: any) => {
    try {
      setLoading(true);
      await shipperService.updateDeliveryStatus(Number(id), {
        status: values.status,
        notes: values.notes,
        proofImages: selectedImages,
        actualRecipient: values.actualRecipient,
        actualRecipientPhone: values.actualRecipientPhone,
        codCollected: values.codCollected
      });
      
      message.success('Cập nhật trạng thái giao hàng thành công');
      navigate('/shipper/orders');
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái giao hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      setSelectedImages(prev => [...prev, info.file.response.url]);
      message.success('Tải ảnh thành công');
    } else if (info.file.status === 'error') {
      message.error('Lỗi khi tải ảnh');
    }
  };

  const steps = [
    {
      title: 'Xác nhận thông tin',
      description: 'Kiểm tra thông tin đơn hàng'
    },
    {
      title: 'Cập nhật trạng thái',
      description: 'Chọn trạng thái giao hàng'
    },
    {
      title: 'Hoàn thành',
      description: 'Xác nhận cập nhật'
    }
  ];

  if (loading && !order) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '24px' }}>
        <div>Không tìm thấy thông tin đơn hàng</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Cập nhật trạng thái giao hàng</Title>
      
      {/* Thông tin đơn hàng */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Thông tin đơn hàng</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Text strong>Mã đơn hàng: </Text>
              <Text>{order.trackingNumber}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Text strong>Dịch vụ: </Text>
              <Text>{order.serviceType}</Text>
            </Space>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Text strong>Người nhận: </Text>
              <Text>{order.recipientName}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Text strong>Số điện thoại: </Text>
              <Text>{order.recipientPhone}</Text>
            </Space>
          </Col>
        </Row>
        
        <div style={{ marginTop: '16px' }}>
          <Text strong>Địa chỉ: </Text>
          <Text>{order.recipientAddress}</Text>
        </div>
        
        {order.codAmount > 0 && (
          <div style={{ marginTop: '16px' }}>
            <Text strong>COD: </Text>
            <Text style={{ color: '#f50' }}>
              {order.codAmount.toLocaleString()}đ
            </Text>
          </div>
        )}
      </Card>

      {/* Steps */}
      <Card style={{ marginBottom: '24px' }}>
        <Steps current={currentStep} items={steps} />
      </Card>

      {/* Form cập nhật */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateStatus}
        >
          <Form.Item
            name="status"
            label="Trạng thái giao hàng"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái giao hàng">
              <Option value="delivered">
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  Đã giao thành công
                </Space>
              </Option>
              <Option value="failed">
                <Space>
                  <CloseCircleOutlined style={{ color: '#f50' }} />
                  Giao hàng thất bại
                </Space>
              </Option>
              <Option value="returned">
                <Space>
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  Hoàn hàng
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actualRecipient"
                label="Người nhận thực tế"
              >
                <Input placeholder="Nhập tên người nhận thực tế" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualRecipientPhone"
                label="Số điện thoại người nhận thực tế"
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          {order.codAmount > 0 && (
            <Form.Item
              name="codCollected"
              label="Số tiền COD đã thu"
              rules={[{ required: true, message: 'Vui lòng nhập số tiền COD đã thu' }]}
            >
              <Input
                type="number"
                placeholder="Nhập số tiền COD đã thu"
                suffix="đ"
              />
            </Form.Item>
          )}

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về quá trình giao hàng..."
            />
          </Form.Item>

          <Form.Item
            name="proofImages"
            label="Hình ảnh minh chứng"
          >
            <Upload
              multiple
              listType="picture-card"
              onChange={handleImageUpload}
              beforeUpload={() => false}
            >
              <div>
                <CameraOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => navigate('/shipper/orders')}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật trạng thái
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ShipperDeliveryUpdate;