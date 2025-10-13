import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Input,
  message,
  Upload,
  Select,
  DatePicker,
  Row,
  Col,
  Tag,
  Form,
} from "antd";
import {
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  addEmployee,
  getEmployeesByOffice,
  getShiftEnum,
  getStatusEnum,
  checkBeforeAddEmployee,
  updateEmployee,
  importEmployees,
} from "../../store/employeeSlice";
import { getAssignableRoles } from "../../store/authSlice";
import { getByUserId } from "../../store/officeSlice";
import { Employee, EmployeeCheckResult } from "../../types/employee"; // import interface từ slice

// Interface thêm key cho bảng
interface EmployeeTable extends Employee {
  key: string;
}

const EmployeeForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [searchText, setSearchText] = useState("");
  const [filterShift, setFilterShift] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hover, setHover] = useState(false);
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const {
    shifts = [],
    statuses = [],
    employees = [],
    total = 0,
  } = useAppSelector((state) => state.employee);
  const { roles = [], user } = useAppSelector((state) => state.auth);
  const { office } = useAppSelector((state) => state.office);
  const { checkResult } = useAppSelector((state) => state.employee);

  // Dữ liệu bảng
  const tableData: EmployeeTable[] = employees.map((emp, index) => ({
    ...emp,
    key: String(index + 1 + (currentPage - 1) * pageSize),
  }));

  // Sửa nhân viên
  const handleEdit = async () => {
    try {
      const data = await dispatch(updateEmployee({ employee: newEmployee })).unwrap();
      if (data.success) {
        message.success(data.message || "Cập nhật thành công");
        setIsModalOpen(false);
        setNewEmployee({});
        form.resetFields();
      } else {
        message.error(data.message || "Cập nhật thất bại");
      }
    } catch (err: any) {
      message.error(err.message || "Có lỗi xảy ra");
    }
  };

  // Thêm nhân viên
  const handleAddEmployee = async () => {
    if (
      !newEmployee.user?.firstName ||
      !newEmployee.user?.lastName ||
      !newEmployee.user?.email ||
      !newEmployee.user?.phoneNumber ||
      !newEmployee.user?.role
    ) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      // 1. Gọi check API trước
      const resultAction = await dispatch(
        checkBeforeAddEmployee({
          email: newEmployee.user?.email,
          phoneNumber: newEmployee.user?.phoneNumber,
          officeId: office?.id,
        })
      );

      const result = resultAction.payload as EmployeeCheckResult;

      if (!result.success) {
        message.error(result.message);
        return;
      }

      // Nếu cần xác nhận (user đã tồn tại hoặc đã từng là employee)
      if (result.exists) {
        Modal.confirm({
          title: "Xác nhận thêm nhân viên",
          content: (
            <div>
              <p>{result.message}</p>
              {result.user && (
                <ul>
                  <li><b>Tên cũ:</b> {result.user.lastName} {result.user.firstName}</li>
                  <li><b>Email:</b> {result.user.email}</li>
                  <li><b>Số điện thoại cũ:</b> {result.user.phoneNumber}</li>
                  <li><b>Chức vụ cũ:</b> {result.user.role}</li>
                </ul>
              )}
              <p>Bạn có chắc chắn muốn tiếp tục thêm nhân viên này và chỉnh sửa lại
                theo thông tin bạn vừa nhập không?</p>
            </div>
          ),
          okText: "Tiếp tục",
          cancelText: "Hủy",
          onOk: async () => {
            await dispatch(addEmployee({ employee: newEmployee }));
            message.success("Thêm nhân viên thành công!");
            setIsModalOpen(false);
            setNewEmployee({});
            form.resetFields();
          },
        });
      } else {
        // Không có cảnh báo → thêm luôn
        await dispatch(addEmployee({ employee: newEmployee }));
        message.success("Thêm nhân viên thành công!");
        setIsModalOpen(false);
        setNewEmployee({});
        form.resetFields();
      }
    } catch (error) {
      message.error("Có lỗi khi thêm nhân viên!");
    }
  };

  // Nhập Excel
  const handleExcelUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      const newEmployees: Partial<Employee>[] = rows.map((row) => ({
        shift: row["Ca làm"] || "Full Day",
        status: row["Trạng thái"] || "Active",
        hireDate: row["Ngày tuyển dụng"]
          ? dayjs(row["Ngày tuyển dụng"]).toDate()
          : new Date(),
        user: {
          id: 0,
          firstName: row["Tên"] || "",
          lastName: row["Họ"] || "",
          email: row["Email"] || "",
          phoneNumber: row["Số điện thoại"] || "",
          role: row["Chức vụ"] || "Shipper",
        },
      }));

      if (newEmployees.length === 0) {
        message.error("Không tìm thấy dữ liệu nhân viên trong file Excel!");
        return;
      }

      try {
        const resultAction = await dispatch(importEmployees({ employees: newEmployees })).unwrap();

        // Lấy object result nested từ backend
        const importResultData = resultAction.result;

        if (importResultData?.success) {
          message.success(
            importResultData.message ||
            `Import hoàn tất: ${importResultData.totalImported} thành công, ${importResultData.totalFailed} thất bại`
          );

          setImportResults(importResultData.results ?? []);
          setImportModalOpen(true);
        } else {
          message.error(importResultData?.message || "Import thất bại");
        }
      } catch (err: any) {
        message.error(err.message || "Có lỗi xảy ra khi import nhân viên");
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    const data = [
      {
        "Họ": "Nguyễn",
        "Tên": "Văn A",
        "Email": "example@gmail.com",
        "Số điện thoại": "0123456789",
        "Chức vụ": roles!.join("/"),
        "Ca làm": shifts!.join("/"),
        "Trạng thái": statuses!.join("/"),
        "Ngày tuyển dụng": "YYYY-MM-DD",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const header = [
      "Họ",
      "Tên",
      "Email",
      "Số điện thoại",
      "Chức vụ",
      "Ca làm",
      "Trạng thái",
      "Ngày tuyển dụng",
    ];
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: 0 });
    ws["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "employee_template.xlsx");
  };

  const statusTag = (status: string) => {
    switch (status) {
      case "Active":
        return <Tag color="green">{status}</Tag>;
      case "Inactive":
        return <Tag color="red">{status}</Tag>;
      case "Leave":
        return <Tag color="orange">{status}</Tag>;
      default:
        return <Tag color="blue">{status}</Tag>;
    }
  };

  const columns: ColumnsType<EmployeeTable> = [
    { title: "Mã NV", dataIndex: "id", key: "id", align: "center" },
    { title: "Họ", dataIndex: ["user", "lastName"], key: "lastName", align: "center" },
    { title: "Tên", dataIndex: ["user", "firstName"], key: "firstName", align: "center" },
    { title: "Email", dataIndex: ["user", "email"], key: "email", align: "center" },
    { title: "Số điện thoại", dataIndex: ["user", "phoneNumber"], key: "phoneNumber", align: "center" },
    { title: "Chức vụ", dataIndex: ["user", "role"], key: "role", align: "center" },
    { title: "Ca làm", dataIndex: "shift", key: "shift", align: "center" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => statusTag(status),
    },
    {
      title: "Ngày tuyển dụng",
      dataIndex: "hireDate",
      key: "hireDate",
      align: "center",
      render: (date: Date) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record: EmployeeTable) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setModalMode("edit");
              setNewEmployee(record);
              setIsModalOpen(true);

              // load dữ liệu vào Form
              form.setFieldsValue({
                id: record.id,
                lastName: record.user?.lastName,
                firstName: record.user?.firstName,
                email: record.user?.email,
                phoneNumber: record.user?.phoneNumber,
                role: record.user?.role,
                hireDate: record.hireDate ? dayjs(record.hireDate) : null,
                shift: record.shift,
                status: record.status,
              });
            }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const fetchEmployees = (page = currentPage) => {
    if (!office?.id) return;

    const payload: any = {
      officeId: office.id,
      page,
      limit: pageSize,
      searchText: searchText || undefined,
      shift: filterShift !== "All" ? filterShift : undefined,
      status: filterStatus !== "All" ? filterStatus : undefined,
      role: filterRole !== "All" ? filterRole : undefined,
    };

    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }

    dispatch(getEmployeesByOffice(payload));
  };

  // Load data
  useEffect(() => {
    if (user?.id) {
      dispatch(getByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (office?.id) {
      dispatch(
        getEmployeesByOffice({
          officeId: office.id,
          page: currentPage,
          limit: pageSize,
          searchText,
          shift: filterShift === "All" ? undefined : filterShift,
          status: filterStatus === "All" ? undefined : filterStatus,
          role: filterRole === "All" ? undefined : filterRole,
          startDate: dateRange
            ? dayjs(dateRange[0]).format("YYYY-MM-DD")
            : undefined,
          endDate: dateRange
            ? dayjs(dateRange[1]).format("YYYY-MM-DD")
            : undefined,
        })
      );
    }
  }, [
    dispatch,
    office?.id,
    currentPage,
    pageSize,
    searchText,
    filterShift,
    filterStatus,
    filterRole,
    dateRange,
  ]);

  useEffect(() => {
    dispatch(getShiftEnum());
    dispatch(getStatusEnum());
    dispatch(getAssignableRoles());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
    fetchEmployees(1);
  }, [searchText, filterShift, filterStatus, filterRole, dateRange, office?.id]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 40 }}>
        <Col span={24}>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <Input
              placeholder="Tìm theo mã nhân viên, họ và tên, email, số điện thoại"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ flex: 1, height: 36, borderRadius: 8 }}
            />


            {/* Lọc theo ca */}
            <Select
              value={filterShift}
              onChange={(val) => setFilterShift(val)}
              style={{ width: 150, height: 36 }}
            >
              <Select.Option value="All">Tất cả ca</Select.Option>
              {shifts?.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>

            <Select
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              style={{ width: 150, height: 36 }}>
              <Select.Option value="All">Tất cả trạng thái</Select.Option>
              {statuses?.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
            <Select value={filterRole} onChange={(val) => setFilterRole(val)} style={{ width: 150, height: 36 }}>
              <Select.Option value="All">Tất cả chức vụ</Select.Option>
              {roles?.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
            <DatePicker.RangePicker style={{ width: 300, height: 36 }} onChange={(val) => setDateRange(val as any)} />

            <Button
              type="default"
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSearchText("");
                setFilterShift("All");
                setFilterStatus("All");
                setFilterRole("All");
                setDateRange(null);
                setCurrentPage(1);
              }}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                height: 36,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "width 0.2s",
                width: hover ? 110 : 36, // chỉ mở rộng khi hover
                justifyContent: hover ? "center" : "center",
              }}
            >
              {hover && "Bỏ lọc"}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Các nút thao tác */}
      <Row justify="end" style={{ marginBottom: 25 }}>
        <Space>
          <Button
            type="primary"
            style={{ backgroundColor: "#1976D2", borderColor: "#1976D2", height: 36, borderRadius: 8 }}
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalOpen(true);
              setModalMode("create");
              setNewEmployee({});
              form.resetFields();
            }}
          >
            Thêm nhân viên
          </Button>

          <Upload beforeUpload={handleExcelUpload} showUploadList={false}>
            <Button
              style={{ backgroundColor: "#43A047", borderColor: "#43A047", color: "#fff", height: 36, borderRadius: 8 }}
              icon={<UploadOutlined />}
            >
              Nhập từ Excel
            </Button>
          </Upload>

          <Button
            style={{ backgroundColor: "#FB8C00", borderColor: "#FB8C00", color: "#fff", height: 36, borderRadius: 8 }}
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
          >
            File mẫu
          </Button>
        </Space>
      </Row>

      {/* Bảng */}
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="key"
        bordered
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: (page, size) => {
            setCurrentPage(page);
            if (size) setPageSize(size);
            fetchEmployees(page);
          },
        }}
        style={{ borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      />

      <Modal
        title={
          <span
            style={{
              color: "#1C3D90",
              fontWeight: "bold",
              fontSize: "18px",
              display: "flex",
              justifyContent: "left",
            }}
          >
            {modalMode === "edit" ? `Chỉnh sửa thông tin nhân viên #${newEmployee.id}` : "Thêm nhân viên mới"}
          </span>
        }
        open={isModalOpen}
        onOk={modalMode === "edit" ? handleEdit : handleAddEmployee}
        onCancel={() => setIsModalOpen(false)}
        okButtonProps={{
          style: {
            backgroundColor: "#1C3D90",
            borderRadius: "8px",
            color: "#fff",
          },
        }}
        cancelButtonProps={{
          style: {
            border: "1px solid #1C3D90",
            borderRadius: "8px",
            color: "#1C3D90",
          },
        }}
        width={800}
        centered
        okText={modalMode === "edit" ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        bodyStyle={{
          maxHeight: "70vh",
          overflowY: "auto",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ"
                name="lastName"
                rules={[{ required: true, message: "Nhập họ nhân viên!" }]}
                style={{ marginBottom: 12 }}
              >
                <Input
                  placeholder="Nhập họ..."
                  value={newEmployee.user?.lastName || ""}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      user: { ...newEmployee.user, lastName: e.target.value },
                    })
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tên"
                name="firstName"
                rules={[{ required: true, message: "Nhập tên nhân viên!" }]}
                style={{ marginBottom: 12 }}
              >
                <Input
                  placeholder="Nhập tên..."
                  value={newEmployee.user?.firstName || ""}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      user: { ...newEmployee.user, firstName: e.target.value },
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[{ required: true, message: "Nhập số điện thoại!" }]}
                style={{ marginBottom: 12 }}
              >
                <Input
                  placeholder="Nhập số điện thoại..."
                  value={newEmployee.user?.phoneNumber || ""}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      user: { ...newEmployee.user, phoneNumber: e.target.value },
                    })
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Nhập email nhân viên!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
                style={{ marginBottom: 12 }}
              >
                <Input
                  placeholder="Nhập email..."
                  value={newEmployee.user?.email || ""}
                  disabled={modalMode === 'edit'}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      user: { ...newEmployee.user, email: e.target.value },
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chức vụ"
                name="role"
                rules={[{ required: true, message: "Chọn chức vụ!" }]}
                style={{ marginBottom: 12 }}
              >
                <Select
                  value={newEmployee.user?.role || roles?.[0]}
                  onChange={(value) =>
                    setNewEmployee({
                      ...newEmployee,
                      user: { ...newEmployee.user, role: value },
                    })
                  }
                  placeholder="Chọn chức vụ..."
                >
                  {roles?.map((item) => (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ca làm"
                name="shift"
                style={{ marginBottom: 12 }}
              >
                <Select
                  value={newEmployee.shift || shifts?.[0]}
                  onChange={(val) => setNewEmployee({ ...newEmployee, shift: val })}
                  placeholder="Chọn ca làm..."
                >
                  {shifts?.map((item) => (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày tuyển dụng" name="hireDate" style={{ marginBottom: 12 }}>
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày thuê..."
                  value={newEmployee.hireDate ? dayjs(newEmployee.hireDate) : null}
                  onChange={(date) =>
                    setNewEmployee({ ...newEmployee, hireDate: date?.toDate() || null })
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
                <Form.Item label="Trạng thái" name="status" style={{ marginBottom: 12 }}>
                  <Select
                    value={newEmployee.status || statuses?.[0]}
                    onChange={(val) =>
                      setNewEmployee({ ...newEmployee, status: val })
                    }
                    placeholder="Chọn trạng thái..."
                  >
                    {statuses?.map((item) => (
                      <Select.Option key={item} value={item}>
                        {item}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Kết quả import */}
      <Modal
        title="Kết quả Import nhân viên"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setImportModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        centered
      >
        <Table
          dataSource={importResults.map((r, i) => ({
            key: i,
            email: r.email || "Không có email",
            success: r.success ?? false,
            message: r.message || "",
          }))}
          columns={[
            { title: "Email", dataIndex: "email", key: "email" },
            {
              title: "Trạng thái",
              dataIndex: "success",
              key: "success",
              render: (success: boolean) =>
                success ? <Tag color="green">Thành công</Tag> : <Tag color="red">Thất bại</Tag>
            },
            { title: "Message", dataIndex: "message", key: "message" },
          ]}
        />
      </Modal>
    </div>
  );
};

export default EmployeeForm;