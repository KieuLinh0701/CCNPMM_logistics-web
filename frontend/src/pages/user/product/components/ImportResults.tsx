import React from 'react';
import { Modal, Table, Tag, Typography, Row, Col, Statistic, Card } from 'antd';

const { Text } = Typography;

interface ImportResult {
  name: string;
  success: boolean;
  message: string;
}

interface ImportResultsProps {
  open: boolean;
  results: ImportResult[];
  onClose: () => void;
}

const ImportResults: React.FC<ImportResultsProps> = ({
  open,
  results,
  onClose,
}) => {
  // Tính tổng số sản phẩm thành công và thất bại
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const totalCount = results.length;

  return (
    <Modal
      title="Kết quả Import sản phẩm"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      styles={{
        body: { 
          maxHeight: '70vh', 
          overflowY: 'auto', 
          padding: '16px 24px',
          // Ẩn scrollbar nhưng vẫn scroll được
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
        } as any
      }}
      className="hide-scrollbar" // Thêm class cho CSS custom
    >
      {/* CSS để ẩn scrollbar trên Chrome, Safari, Opera */}
      <style>
        {`
          .hide-scrollbar ::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Tổng sản phẩm" value={totalCount} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Thành công" value={successCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Thất bại" value={failCount} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      {/* Bảng chi tiết */}
      <Table
        dataSource={results.map((r, i) => ({
          key: i,
          name: r.name || 'Không có tên',
          success: r.success ?? false,
          message: r.message || '',
        }))}
        columns={[
          { 
            title: 'Tên sản phẩm', 
            dataIndex: 'name', 
            key: 'name', 
            width: 200,
            ellipsis: true 
          },
          {
            title: 'Trạng thái',
            dataIndex: 'success',
            key: 'success',
            width: 120,
            render: (success: boolean) =>
              success ? 
                <Tag color="green" style={{ margin: 0 }}>Thành công</Tag> : 
                <Tag color="red" style={{ margin: 0 }}>Thất bại</Tag>,
          },
          { 
            title: 'Thông báo', 
            dataIndex: 'message', 
            key: 'message',
            ellipsis: true
          },
        ]}
        pagination={false}
        size="middle"
        scroll={{ x: 'max-content' }}
        style={{ marginBottom: 0 }}
      />
    </Modal>
  );
};

export default ImportResults;