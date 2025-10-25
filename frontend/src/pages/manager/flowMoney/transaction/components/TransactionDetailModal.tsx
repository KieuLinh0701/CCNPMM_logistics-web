import React, { useState } from "react";
import { Modal, Descriptions, Tag, Typography, Button } from "antd";
import { LeftOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Transaction } from "../../../../../types/transaction";
import { translateTransactionMethod, translateTransactionPurpose, translateTransactionStatus, translateTransactionType } from "../../../../../utils/transactionUtils";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface Props {
  transaction: Transaction | null;
  visible: boolean;
  onClose: () => void;
  role: string;
}

const TransactionDetailModal: React.FC<Props> = ({ transaction, visible, onClose, role }) => {
  const [imagePreviewIndex, setImagePreviewIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  if (!transaction) return null;

  const images = transaction.images || [];

  const handleImageClick = (index: number) => setImagePreviewIndex(index);
  const closeImagePreview = () => setImagePreviewIndex(null);

  const showPrevImage = () => {
    if (imagePreviewIndex !== null) {
      setImagePreviewIndex((imagePreviewIndex - 1 + images.length) % images.length);
    }
  };

  const showNextImage = () => {
    if (imagePreviewIndex !== null) {
      setImagePreviewIndex((imagePreviewIndex + 1) % images.length);
    }
  };

  const typeTag = (type: string) => {
    switch (type) {
      case "Income": return <Tag color="green">{translateTransactionType(type)}</Tag>;
      case "Expense": return <Tag color="orange">{translateTransactionType(type)}</Tag>;
      default: return <Tag>{type}</Tag>;
    }
  };

  const statusTag = (status: string) => {
    switch (status) {
      case "Pending": return <Tag color="orange">{translateTransactionStatus(status)}</Tag>;
      case "Confirmed": return <Tag color="green">{translateTransactionStatus(status)}</Tag>;
      case "Rejected": return <Tag color="red">{translateTransactionStatus(status)}</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const purposeTag = (purpose: string) => (
    <Tag color="blue">{translateTransactionPurpose(purpose)}</Tag>
  );

  return (
    <Modal
      title={<span style={{ color: '#1C3D90', fontWeight: 'bold', fontSize: 18 }}>Chi tiết giao dịch #{transaction.id}</span>}
      open={visible}
      onCancel={onClose}
      width={800}
      centered
      footer={null}
      className="hidden-scroll-modal"
      bodyStyle={{ maxHeight: '80vh', overflowY: 'scroll', padding: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 'bold', width: 200 }}>
        {transaction.order?.trackingNumber && (
          <Descriptions.Item label="Mã đơn hàng">
            <Text
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                navigate(`${role}/orders/detail/${transaction.order?.trackingNumber}`);
              }}
            >
              {transaction.order.trackingNumber}
            </Text>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Tiêu đề"><Text>{transaction.title}</Text></Descriptions.Item>
        <Descriptions.Item label="Khoảng tiền"><Text>{transaction.amount.toLocaleString()} VNĐ</Text></Descriptions.Item>
        <Descriptions.Item label="Loại giao dịch">{typeTag(transaction.type)}</Descriptions.Item>
        <Descriptions.Item label="Mục đích">{purposeTag(transaction.purpose)}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái"><Text>{statusTag(transaction.status)}</Text></Descriptions.Item>
        {transaction.purpose !== "OfficeExpense" &&
          <Descriptions.Item label="Phương thức"><Text>{translateTransactionMethod(transaction.method)}</Text></Descriptions.Item>
        }
        <Descriptions.Item label="Thời điểm tạo"><Text>{transaction.createdAt ? dayjs(transaction.createdAt).format('DD/MM/YYYY HH:mm:ss') : <Tag color="default">N/A</Tag>}</Text></Descriptions.Item>
        <Descriptions.Item label="Thời điểm giao dịch"><Text>{transaction.confirmedAt ? dayjs(transaction.confirmedAt).format('DD/MM/YYYY HH:mm:ss') : <Tag color="default">N/A</Tag>}</Text></Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          <div
            style={{
              backgroundColor: '#e6f7ff',
              padding: 10,
              borderRadius: 6,
              whiteSpace: 'pre-wrap'
            }}
          >
            <Text>{transaction.notes || 'N/A'}</Text>
          </div>
        </Descriptions.Item>
        {images.length > 0 && (
          <Descriptions.Item label="Hóa đơn chứng từ">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {images.map((img, index) => (
                <img
                  key={img.url}
                  src={img.url}
                  alt="Transaction"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0'
                  }}
                  onClick={() => handleImageClick(index)}
                />
              ))}
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Ảnh full overlay */}
      {imagePreviewIndex !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={closeImagePreview}
            style={{ position: 'absolute', top: 20, right: 20, color: '#fff', fontSize: 24 }}
          />
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={showPrevImage}
            style={{ position: 'absolute', left: 20, color: '#fff', fontSize: 36 }}
          />
          <img
            src={images[imagePreviewIndex].url}
            alt="Preview"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
          />
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={showNextImage}
            style={{ position: 'absolute', right: 20, color: '#fff', fontSize: 36 }}
          />
        </div>
      )}
      <style>
        {`
          .hidden-scroll-modal::-webkit-scrollbar {
            display: none; 
          }
        `}
      </style>
    </Modal>
  );
};

export default TransactionDetailModal;