import React from 'react';
import { Modal, Table, Tag } from 'antd';

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
  return (
    <Modal
      title="Kết quả Import sản phẩm"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
    >
      <Table
        dataSource={results.map((r, i) => ({
          key: i,
          name: r.name || 'Không có tên',
          success: r.success ?? false,
          message: r.message || '',
        }))}
        columns={[
          { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
          {
            title: 'Trạng thái',
            dataIndex: 'success',
            key: 'success',
            render: (success: boolean) =>
              success ? <Tag color="green">Thành công</Tag> : <Tag color="red">Thất bại</Tag>,
          },
          { title: 'Message', dataIndex: 'message', key: 'message' },
        ]}
        pagination={false}
      />
    </Modal>
  );
};

export default ImportResults;