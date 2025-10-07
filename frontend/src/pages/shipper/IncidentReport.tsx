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
  Modal,
  Table,
  Tag,
  Image
} from 'antd';
import { 
  ExclamationCircleOutlined,
  CameraOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import shipperService from '../../services/shipperService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface IncidentReport {
  id: number;
  trackingNumber: string;
  incidentType: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  recipientName: string;
  recipientPhone: string;
  images: string[];
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
}

const ShipperIncidentReport: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [submitModal, setSubmitModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call for incident reports
      setReports([]);
    } catch (error) {
      console.error('Error fetching incident reports:', error);
      message.error('Lỗi khi tải danh sách báo cáo sự cố');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (values: any) => {
    try {
      setLoading(true);
      await shipperService.reportIncident({
        trackingNumber: values.trackingNumber,
        incidentType: values.incidentType,
        title: values.title,
        description: values.description,
        location: values.location,
        priority: values.priority,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        images: selectedImages
      });
      
      message.success('Đã gửi báo cáo sự cố thành công');
      setSubmitModal(false);
      form.resetFields();
      setSelectedImages([]);
      fetchReports();
    } catch (error) {
      message.error('Lỗi khi gửi báo cáo sự cố');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'processing': return 'processing';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      width: 140,
      render: (text: string) => (
        <Text strong style={{ fontSize: '13px' }}>{text}</Text>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 200 }}>{text}</Text>
      ),
    },
    {
      title: 'Loại sự cố',
      dataIndex: 'incidentType',
      key: 'incidentType',
      width: 120,
      render: (text: string) => (
        <Tag>{text}</Tag>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (time: string) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {dayjs(time).format('DD/MM/YYYY')}
          </Text>
          <Text style={{ fontSize: '11px', color: '#666' }}>
            {dayjs(time).format('HH:mm')}
          </Text>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Báo cáo sự cố</Title>
      
      {/* Nút tạo báo cáo mới */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
              <div>
                <Text strong>Báo cáo sự cố trong quá trình giao hàng</Text>
                <br />
                <Text type="secondary">Gửi báo cáo khi gặp sự cố để được hỗ trợ kịp thời</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => setSubmitModal(true)}
            >
              Tạo báo cáo mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bảng báo cáo */}
      <Card>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} báo cáo`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal tạo báo cáo */}
      <Modal
        title="Tạo báo cáo sự cố"
        open={submitModal}
        onCancel={() => setSubmitModal(false)}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitReport}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="trackingNumber"
                label="Mã đơn hàng"
                rules={[{ required: true, message: 'Vui lòng nhập mã đơn hàng' }]}
              >
                <Input placeholder="Nhập mã đơn hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="incidentType"
                label="Loại sự cố"
                rules={[{ required: true, message: 'Vui lòng chọn loại sự cố' }]}
              >
                <Select placeholder="Chọn loại sự cố">
                  <Option value="recipient_not_available">Người nhận không có mặt</Option>
                  <Option value="wrong_address">Sai địa chỉ</Option>
                  <Option value="package_damaged">Hàng hóa bị hỏng</Option>
                  <Option value="recipient_refused">Người nhận từ chối</Option>
                  <Option value="security_issue">Vấn đề an ninh</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề báo cáo" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết sự cố đã xảy ra..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Vị trí xảy ra sự cố"
                rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
              >
                <Input placeholder="Nhập địa chỉ cụ thể" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
              >
                <Select placeholder="Chọn mức độ ưu tiên">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="recipientName"
                label="Tên người nhận"
                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
              >
                <Input placeholder="Nhập tên người nhận" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recipientPhone"
                label="Số điện thoại người nhận"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="images"
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
        </Form>
      </Modal>
    </div>
  );
};

export default ShipperIncidentReport;