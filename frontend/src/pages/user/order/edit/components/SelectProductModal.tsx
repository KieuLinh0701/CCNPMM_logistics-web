import React, { useEffect, useState } from "react";
import { Modal, Input, Table, Button } from "antd";
import { SearchOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { product } from "../../../../../types/product";

interface Props {
  open: boolean;
  products: product[];
  nextCursor: number | null;
  selectedProductIds: number[];
  loading?: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onSelectProducts: (selected: product[]) => void;
  onLoadMore: () => void;
  setSelectedProductIds: React.Dispatch<React.SetStateAction<number[]>>;
  initialSelectedProducts?: product[];
}

const SelectProductModal: React.FC<Props> = ({
  open,
  products,
  nextCursor,
  selectedProductIds,
  loading,
  onClose,
  onSearch,
  onSelectProducts,
  onLoadMore,
  setSelectedProductIds,
  initialSelectedProducts = [],
}) => {

  // Đồng bộ tick sẵn khi mở modal
  useEffect(() => {
  }, [open, selectedProductIds]);

  const handleConfirm = () => {
    const selectedProducts = products.filter((p) =>
      selectedProductIds.includes(p.id)
    );
    onSelectProducts(selectedProducts);
  };

  return (
    <Modal
      title="Chọn sản phẩm"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {/* Ô tìm kiếm */}
      <Input.Search
        placeholder="Tìm sản phẩm..."
        allowClear
        onSearch={onSearch}
        style={{ marginBottom: 12 }}
      />

      {/* Bảng sản phẩm */}
      <Table
        rowKey="id"
        dataSource={products}
        loading={loading}
        pagination={false}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedProductIds,
          onChange: (keys) => setSelectedProductIds(keys as number[]),
          getCheckboxProps: (record) => ({
          }),
        }}
        columns={[
          { title: "Tên sản phẩm", dataIndex: "name", key: "name", align: "center",},
          { title: "Trọng lượng (Kg)", dataIndex: "weight", key: "weight", align: "center", },
          {
            title: "Giá (VNĐ)",
            dataIndex: "price",
            key: "price",
            align: "center",
            render: (p: number) => p.toLocaleString("vi-VN"),
          },
          { title: "Loại", dataIndex: "type", key: "type", align: "center", },
          {
            title: "Tồn kho",
            dataIndex: "stock",
            key: "stock",
            align: "center",
            render: (s: number) => s.toLocaleString("vi-VN"),
          },
        ]}
      />

      {/* Nút hành động */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <Button
          icon={nextCursor ? <PlusOutlined /> : <ReloadOutlined />}
          onClick={onLoadMore}
          disabled={!nextCursor}
          loading={loading}
          style={{
            background: "#1C3D90",
            color: "#fff",
            borderColor: "#1C3D90",
          }}
        >
          {nextCursor ? "Xem thêm" : "Hết sản phẩm"}
        </Button>

        <div style={{ display: "flex", gap: 8 }}>
          <Button
            style={{ borderColor: "#1C3D90", color: "#1C3D90" }}
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            style={{ background: "#1C3D90", borderColor: "#1C3D90" }}
            onClick={handleConfirm}
          >
            Chọn
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectProductModal;