import React from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import { Vehicle } from '../../../../types/vehicle';
import { translateVehicleStatus, translateVehicleType } from '../../../../utils/vehicleUtils';

const { TextArea } = Input;

interface AddOrEditModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  vehicle: Partial<Vehicle>;
  onOk: () => void;
  onCancel: () => void;
  onVehicleChange: (vehicle: Partial<Vehicle>) => void;
  form: any;
  statuses: string[];
  types: string[];
}

const AddOrEditModal: React.FC<AddOrEditModalProps> = ({
  open,
  mode,
  vehicle,
  onOk,
  onCancel,
  onVehicleChange,
  form,
  statuses,
  types,
}) => {

  // Filter statuses - khi edit thì ẩn InUse
  const filteredStatuses = mode === 'edit'
    ? statuses.filter(status => status !== 'InUse')
    : [];

  return (
    <Modal
      title={
        <span
          style={{
            color: '#1C3D90',
            fontWeight: 'bold',
            fontSize: '18px',
            display: 'flex',
            justifyContent: 'left',
          }}
        >
          {mode === 'edit' ? `Chỉnh sửa phương tiện #${vehicle.id}` : 'Thêm phương tiện mới'}
        </span>
      }
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={mode === 'edit' ? 'Cập nhật' : 'Thêm'}
      okButtonProps={{
        style: {
          backgroundColor: '#1C3D90',
          borderRadius: '8px',
          color: '#fff',
        },
      }}
      cancelButtonProps={{
        style: {
          border: '1px solid #1C3D90',
          borderRadius: '8px',
          color: '#1C3D90',
        },
      }}
      cancelText="Hủy"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Biển số xe"
          name="licensePlate"
          rules={[{ required: true, message: 'Nhập biển số xe!' }]}
        >
          <Input
            value={vehicle.licensePlate}
            onChange={(e) => onVehicleChange({ ...vehicle, licensePlate: e.target.value })}
            placeholder="VD: 51A-123.45"
          />
        </Form.Item>

        <Form.Item
          label="Loại xe"
          name="type"
          rules={[{ required: true, message: 'Chọn loại xe!' }]}
        >
          <Select
            value={vehicle.type}
            onChange={(val) => onVehicleChange({ ...vehicle, type: val })}
            placeholder="Chọn loại xe..."
          >
            {types.map((s) => <Select.Option key={s} value={s}> {translateVehicleType(s)}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tải trọng (kg)"
          name="capacity"
          rules={[{ required: true, message: 'Nhập tải trọng!' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            value={vehicle.capacity}
            onChange={(val) => onVehicleChange({ ...vehicle, capacity: val ?? 0 })}
            placeholder="VD: 1000"
          />
        </Form.Item>

        {mode === 'edit' && (
          <Form.Item
            label="Trạng thái"
            name="status"
          >
            <Select
              value={vehicle.status}
              onChange={(val) => onVehicleChange({
                ...vehicle,
                status: val
              })}
              placeholder="Chọn trạng thái..."
            >
              {filteredStatuses.map((s) => (
                <Select.Option key={s} value={s}>
                  {translateVehicleStatus(s)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item label="Mô tả" name="description">
          <TextArea
            rows={3}
            value={vehicle.description}
            onChange={(e) => onVehicleChange({ ...vehicle, description: e.target.value })}
            placeholder="Ghi chú về phương tiện..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddOrEditModal;