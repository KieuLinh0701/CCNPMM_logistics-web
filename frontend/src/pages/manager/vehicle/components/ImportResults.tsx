import React from 'react';
import { Modal, Table, Tag, Statistic, Row, Col } from 'antd';
import { ImportVehicleResult } from '../../../../types/vehicle';

interface ImportResultsProps {
  open: boolean;
  importResults: ImportVehicleResult[];
  totalImported: number;
  totalFailed: number;
  onClose: () => void;
}

const ImportResults: React.FC<ImportResultsProps> = ({
  open,
  importResults,
  totalImported,
  totalFailed,
  onClose,
}) => {
  return (
    <Modal
      title="Kết quả Import phương tiện"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
    >
      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="Tổng số" value={totalImported + totalFailed} />
        </Col>
        <Col span={8}>
          <Statistic title="Thành công" value={totalImported} valueStyle={{ color: '#3f8600' }} />
        </Col>
        <Col span={8}>
          <Statistic title="Thất bại" value={totalFailed} valueStyle={{ color: '#cf1322' }} />
        </Col>
      </Row>

      <Table
        dataSource={importResults.map((r, i) => ({ 
          key: i,
          licensePlate: r.licensePlate || 'Không có biển số',
          success: r.success ?? false,
          message: r.message || '',
        }))}
        columns={[
          {
            title: 'Biển số xe',
            dataIndex: 'licensePlate',
            key: 'licensePlate',
            render: (text: string, record: any) =>
              record.success ?
                <strong style={{ color: '#3f8600' }}>{text}</strong> :
                <span style={{ color: '#cf1322' }}>{text}</span>
          },
          {
            title: 'Trạng thái',
            dataIndex: 'success',
            key: 'success',
            render: (success: boolean) =>
              success ?
                <Tag color="green">Thành công</Tag> :
                <Tag color="red">Thất bại</Tag>,
          },
          {
            title: 'Thông báo',
            dataIndex: 'message',
            key: 'message',
            render: (text: string, record: any) =>
              record.success ?
                <span style={{ color: '#3f8600' }}>{text}</span> :
                <span style={{ color: '#cf1322' }}>{text}</span>
          },
        ]}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: false,
        }}
      />
    </Modal>
  );
};

export default ImportResults;