import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Button,
  Layout,
  Spin,
  Input,
} from "antd";
import {
  BellOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  NotificationItem,
  notificationService,
} from "../services/notificationService";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        page: 1,
        limit: 50,
      });
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };;

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }
    navigate(`/${user.role}/notifications/${notification.id}`, {
      state: { notification },
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: (
        <div
          style={{
            backgroundColor: "#1C3D90",
            color: "white",
            fontWeight: "bold",
            padding: "3px 6px",
            textAlign: "left",
          }}
        >
          Tiêu đề
        </div>
      ),
      dataIndex: "title",
      key: "title",
      render: (title: string, record: NotificationItem) => (
        <Text
          strong={!record.isRead}
          style={{ color: record.isRead ? "#555" : "#000" }}
        >
          {title}
        </Text>
      ),
    },
    {
      title: (
        <div
          style={{
            backgroundColor: "#1C3D90",
            color: "white",
            fontWeight: "bold",
            padding: "3px 6px",
            textAlign: "left",
          }}
        >
          Thời gian gửi
        </div>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 250,
      render: (createdAt: string, record: NotificationItem) => (
        <Text
          strong={!record.isRead}
          style={{ color: record.isRead ? "#555" : "#000" }}
        >
          {new Date(createdAt).toLocaleString("vi-VN")}
        </Text>
      ),
    },
  ];

  return (
    <Layout style={{ background: "#fff", paddingLeft: 24, paddingRight: 24, minHeight: "100vh" }}>
      <Content>
        {/* --- Tiêu đề --- */}
        <Title level={3} style={{ color: "#1C3D90", marginBottom: 10 }}>
          Thông báo
        </Title>

        {/* --- Thanh tìm kiếm + nút tải lại --- */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 12 }}>
          <Search
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            allowClear
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="large"
            style={{ flex: 1 }}
          />
          <Button
            onClick={fetchNotifications}
            size="large"
            style={{ backgroundColor: "#1C3D90", color: "white" }}
            icon={<ReloadOutlined />}
          >
            Làm mới
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: 100 }}>
            <Spin size="large" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 100, color: "#888" }}>
            <BellOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <div>Không có thông báo nào phù hợp</div>
          </div>
        ) : (
          <Table
            dataSource={filteredNotifications}
            columns={columns}
            rowKey="id"
            components={{
              header: {
                cell: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
                  <th
                    {...props}
                    style={{
                      backgroundColor: "#1C3D90",
                      color: "white",
                      fontWeight: "bold",
                      padding: "8px 12px",
                      textAlign: "left",
                    }}
                  />
                ),
              },
            }}
            rowClassName={(record) => (record.isRead ? "" : "unread-row")}
            onRow={(record) => ({
              onClick: () => handleClick(record),
            })}
            pagination={false}
          />
        )}
      </Content>
    </Layout>
  );
};

export default NotificationList;