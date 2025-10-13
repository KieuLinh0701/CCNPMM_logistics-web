import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Row,
  Col,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Typography,
  Card,
  message,
  Modal,
  List,
  Radio,
  Divider,
  Collapse,
  Tooltip,
  Checkbox,
  Breadcrumb,
} from "antd";
import AddressForm from "../../components/AdressForm";
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, GiftOutlined, InfoCircleOutlined, PlusOutlined, SaveOutlined, SearchOutlined, TagOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getActiveServiceTypes } from "../../store/serviceTypeSlice";
import { serviceType } from "../../types/serviceType";
import { calculateShippingFee as calculateShippingFeeThunk, createOrder, createVNPayURL } from "../../store/orderSlice";
import { product } from "../../types/product";
import { OrderProduct } from "../../types/orderProduct";
import type { ColumnsType } from "antd/es/table";
import { getActiveProductsByUser } from "../../store/productSlice";
import { getProfile } from "../../store/authSlice";
import { getOfficesByArea } from "../../store/officeSlice";
import { getActivePromotions } from "../../store/promotionSlice";
import { PromotionResponse } from "../../types/promotion";
import { Office } from "../../types/office";
import { Order } from "../../types/order";
import { useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";

const { Text } = Typography;
const { Option } = Select;

interface Province {
  code: number;
  name: string;
}

interface Commune {
  code: number;
  name: string;
}

const capitalize = (str: string) => {
  if (!str) return "";
  return str
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const CreateOrder: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [totalFee, setTotalFee] = useState<number>(0);

  // Lấy serviceType slice
  const { serviceTypes, loading: serviceLoading, error: serviceError } =
    useSelector((state: RootState) => state.serviceType);

  // Lấy order slice
  const { shippingFee, loading: orderLoading, error: orderError } =
    useSelector((state: RootState) => state.order);

  // Lấy office Slice
  const { offices = [] } = useSelector((state: RootState) => state.office);

  // Lấy products từ redux
  const { products, nextCursor } = useSelector((state: RootState) => state.product);

  // Lấy products từ redux
  const { promotions, nextCursor: promotionNextCursor } = useSelector((state: RootState) => state.promotion);

  // Quản lý lastId và searchText trong component
  const [searchText, setSearchText] = useState("");

  const [selectedServiceType, setSelectedServiceType] = useState<serviceType | null>(null);

  // Giỏ hàng tạm (OrderProduct[])
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);

  // Modal chọn sản phẩm
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const [editing, setEditing] = useState(false);

  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [wardList, setWardList] = useState<Commune[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [orderPayload, setOrderPayload] = useState<any>(null);

  const payer = Form.useWatch("payer", form);

  const [discountAmount, setDiscountAmount] = useState(0);

  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  useEffect(() => {
    dispatch(getActiveServiceTypes());
  }, [dispatch]);

  useEffect(() => {
    if (serviceError) {
      message.error(serviceError);
    }
    if (orderError) {
      message.error(orderError);
    }
  }, [serviceError, orderError]);

  useEffect(() => {
    if (serviceTypes && serviceTypes.length > 0 && !selectedServiceType) {
      setSelectedServiceType(serviceTypes[0]);
    }
  }, [serviceTypes]);

  const handleSelectProducts = () => {
    const chosen = products.filter((p: product) => selectedProductIds.includes(p.id));

    // merge tránh duplicate
    const mergedProducts = [
      ...orderProducts.map((op) => op.product),
      ...chosen.filter((c) => !orderProducts.some((op) => op.product.id === c.id)),
    ];

    const newOrderProducts: OrderProduct[] = mergedProducts.map((p) => ({
      product: p,
      quantity: 1,
      price: p.price,
      order: undefined as any,
    }));

    setOrderProducts(newOrderProducts);
    setSelectedProductIds([]);
    setShowProductModal(false);
  };

  const buildOrderPayload = (): Order => {
    const values = form.getFieldsValue(true);

    // lấy promotion object từ selectedPromo
    const promo = selectedPromo
      ? promotions.find((p) => p.code === selectedPromo)
      : null;

    return {
      senderName: values.senderName || user?.lastName + " " + user?.firstName,
      senderPhone: values.senderPhone || user?.phoneNumber,
      senderCityCode: values.sender.province,
      senderWardCode: values.sender.commune,
      senderDetailAddress: values.sender.address,

      recipientName: values.recipientName,
      recipientPhone: values.recipientPhone,
      recipientCityCode: values.recipient.province,
      recipientWardCode: values.recipient.commune,
      recipientDetailAddress: values.recipient.address,
      weight: values.weight,
      serviceType: selectedServiceType || undefined,
      cod: values.codAmount || 0,
      orderValue: values.orderValue || 0,
      payer: values.payer === "shop" ? "Shop" : "Customer",
      paymentMethod:
        values.paymentMethod === "bankTransfer"
          ? "BankTransfer"
          : values.paymentMethod === "vnpay"
            ? "VNPay"
            : values.paymentMethod === "zalopay"
              ? "ZaloPay"
              : "Cash",
      paymentStatus: "Unpaid",
      notes: values.note || "",
      user: user || undefined,
      promotion: promo || undefined,
      discountAmount: discountAmount || 0,
      shippingFee: shippingFee || 0,
      status: isDraft ? "draft" : "pending",
      orderProducts: orderProducts.map((op) => ({
        product: op.product,
        price: op.price,
        quantity: op.quantity,
      })),
      fromOffice: selectedOffice || undefined,
    } as Order;
  };

  useEffect(() => {
    let discount = 0;

    if (selectedPromo) {
      const promo = promotions.find((p) => p.code === selectedPromo);
      if (promo) {
        // Kiểm tra điều kiện minOrderValue
        if (shippingFee >= promo.minOrderValue) {
          if (promo.discountType === "percentage") {
            discount = (shippingFee * promo.discountValue) / 100;
            if (promo.maxDiscountAmount) {
              discount = Math.min(discount, promo.maxDiscountAmount);
            }
          } else {
            discount = promo.discountValue;
          }
        } else {
          // Không đủ điều kiện nữa -> bỏ khuyến mãi
          message.warning("Mã khuyến mãi không còn áp dụng được");
          setSelectedPromo(null);
        }
      }
    }

    setDiscountAmount(Math.round(discount));
    setTotalFee(Math.max(0, shippingFee - discount));
  }, [selectedPromo, shippingFee, promotions]);

  // tính tổng trọng lượng và giá trị từ orderProducts -> cập nhật form
  useEffect(() => {
    const totalWeight = orderProducts.reduce(
      (sum, p) => sum + (Number(p.product.weight) || 0) * p.quantity,
      0
    );
    const totalValue = orderProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

    const roundedWeight = Math.round(totalWeight * 100) / 100;

    form.setFieldsValue({
      weight: roundedWeight,
      orderValue: totalValue,
    });
  }, [orderProducts, form]);

  // columns cho table hiển thị sản phẩm đã chọn
  const orderColumns: ColumnsType<OrderProduct> = [
    { title: "Tên sản phẩm", render: (_: any, record: OrderProduct) => record.product.name },
    { title: "Trọng lượng (kg)", render: (_: any, record: OrderProduct) => record.product.weight },
    { title: "Giá", render: (_: any, record: OrderProduct) => record.price.toLocaleString() + "₫" },
    {
      title: "Số lượng",
      render: (_: any, record: OrderProduct) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => {
            setOrderProducts((prev) =>
              prev.map((op) =>
                op.product.id === record.product.id ? { ...op, quantity: val || 1 } : op
              )
            );
          }}
        />
      ),
    },
    {
      title: "Hành động",
      render: (_: any, record: OrderProduct) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            setOrderProducts((prev) =>
              prev.filter((op) => op.product.id !== record.product.id)
            );
          }}
        />
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
    dispatch(getActiveProductsByUser({ limit: 10, searchText: value }));
  };

  const handleLoadMoreProducts = () => {
    if (nextCursor) {
      dispatch(
        getActiveProductsByUser({
          limit: 10,
          lastId: nextCursor,
          searchText,
        })
      );
    }
  };

  const handleSearchPromo = (value: string) => {
    setSearchText(value);
    dispatch(getActivePromotions({ limit: 10, searchText: value, shippingFee: shippingFee }));
  };

  const handleLoadMorePromotions = () => {
    if (promotionNextCursor) {
      dispatch(
        getActivePromotions({
          limit: 10,
          searchText,
          lastId: promotionNextCursor,
          shippingFee
        })
      );
    }
  };

  useEffect(() => {
    const senderProvince = form.getFieldValue(['sender', 'province']);
    const city = editing ? senderProvince : user?.codeCity;

    if (city) {
      dispatch(getOfficesByArea({ codeCity: city }));
    }
  }, [editing, user?.codeCity, form, dispatch]);


  useEffect(() => {
    if (showProductModal) {
      setSearchText("");
      dispatch(getActiveProductsByUser({ limit: 10, searchText: "" }));
      const alreadySelectedIds = orderProducts.map(op => op.product.id);
      setSelectedProductIds(alreadySelectedIds);
    }
  }, [showProductModal, dispatch]);

  useEffect(() => {
    if (showPromoModal) {
      setSearchText("");
      dispatch(getActivePromotions({ limit: 10, searchText: "", shippingFee: shippingFee }));

      console.log("promotions: ", promotions);
    }
  }, [showPromoModal, dispatch]);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        senderName: capitalize(user.lastName) + " " + capitalize(user.firstName),
        senderPhone: user.phoneNumber,
        sender: {
          address: user.detailAddress,
          commune: user.codeWard,
          province: user.codeCity,
        }
      });
    }
  }, [user]);

  useEffect(() => {
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/v2/p/")
      .then(res => setProvinceList(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (user?.codeCity) {
      axios
        .get<{ wards: Commune[] }>(`https://provinces.open-api.vn/api/v2/p/${user.codeCity}?depth=2`)
        .then(res => setWardList(res.data.wards || []))
        .catch(err => console.error(err));
    }
  }, [user?.codeCity]);

  useEffect(() => {
    if (!isSubmitting) return;

    const submitOrder = async () => {
      const payload = buildOrderPayload();
      setOrderPayload(payload);

      console.log("payload", payload);

      try {
        const orderResponse = await dispatch(createOrder(payload)).unwrap();

        if (!orderResponse.order) {
          message.error("Không lấy được thông tin đơn hàng");
          return;
        }

        const order: Order = orderResponse.order;

        message.success(isDraft ? "Lưu nháp thành công!" : "Tạo đơn hàng thành công!");
        setOrderProducts([]);
        form.resetFields();

        // Kiểm tra id trước
        if (!order.id) {
          message.error("Không tìm thấy ID đơn hàng");
          return;
        }

        // Thay thế entry lịch sử bằng trang Order Success
        navigate(`/user/orders/success/${order.trackingNumber}`, { replace: true });

        // Nếu có id và paymentMethod là VNPay, không phải nháp
        if (payload.paymentMethod === "VNPay" && !isDraft) {
          try {

            // Tạo URL thanh toán VNPay
            const res = await dispatch(createVNPayURL(order.id)).unwrap();

            if (res.paymentUrl) {
              // Redirect luôn tab hiện tại sang VNPay
              window.location.href = res.paymentUrl;
            }
          } catch (err: any) {
            console.error("Lỗi tạo URL thanh toán:", err);
            message.error(err.message || "Không thể tạo URL thanh toán VNPay");
          }
        }

      } catch (err: any) {
        message.error(err.message || "Lưu đơn thất bại");
      } finally {
        setIsSubmitting(false);
        setIsDraft(false);
      }
    };

    submitOrder();
  }, [isSubmitting]);

  // Khi phí ship thay đổi load lại promotion và nếu id vẫn trùng với cái đã chọn thì giữ lại không thì set null
  useEffect(() => {
    if (shippingFee > 0) {
      console.log("shippingFee thay đổi: ", shippingFee);
      dispatch(getActivePromotions({ limit: 10, searchText: "", shippingFee: shippingFee }))
        .unwrap()
        .then((res: PromotionResponse) => {
          const promos = res.promotions || [];
          // Nếu selectedPromo không còn trong danh sách mới thì reset
          if (
            selectedPromo &&
            !promos.some((p) => p.code === selectedPromo)
          ) {
            setSelectedPromo(null);
          }
        })
        .catch((err) => {
          console.error("Lỗi load promotions:", err);
        });
    }
  }, [shippingFee, dispatch, selectedPromo]);

  useEffect(() => {
    if (payer) {
      form.setFieldsValue({
        paymentMethod: payer === "customer" ? "cash" : "bankTransfer",
      });
    }
  }, [payer, form]);

  return (
    <div className="create-order-container">
      <Row gutter={24} style={{ height: "100%" }}>
        {/* LEFT CONTENT (scroll được) */}
        <Col xs={24} lg={18} className="left-content">
          <div className="scrollable-content">
            <div className="page-header" style={{ marginBottom: 32 }}></div>

            <Form
              form={form}
              layout="vertical"
              onValuesChange={(changedValues, allValues) => {
                let senderProvince = allValues.sender?.province || user?.codeCity;
                const recipientProvince = allValues.recipient?.province;
                const weight = allValues.weight;
                const serviceTypeId = allValues.serviceType;

                // chỉ chạy khi tất cả đều có giá trị
                if (senderProvince && recipientProvince && weight && serviceTypeId) {
                  const selectedService = serviceTypes?.find(s => s.id === serviceTypeId);
                  if (selectedService) {
                    dispatch(calculateShippingFeeThunk({
                      weight,
                      serviceTypeId: selectedService.id,
                      senderCodeCity: senderProvince,
                      recipientCodeCity: recipientProvince,
                    }));
                  }
                } else {
                  setTotalFee(0); // reset nếu thiếu trường nào
                }

                if (changedValues.sender?.province) {
                  // Lấy offices theo city
                  dispatch(getOfficesByArea({ codeCity: changedValues.sender.province }));
                  // Reset officeId nếu province thay đổi
                  form.setFieldsValue({ sender: { officeId: undefined } });
                }
              }}
            >
              <div>
                <Title level={3} style={{ color: "#1C3D90", marginBottom: 8 }}>
                  Thêm đơn hàng
                </Title>

                <Breadcrumb separator="/" style={{ marginBottom: 30 }}>
                  <Breadcrumb.Item>
                    <a href="/user/orders">Danh sách đơn hàng</a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    Thêm đơn hàng
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>

              <Card className="custom-card" style={{ position: "relative" }}>
                <div className="card-title">Thông tin người gửi</div>

                <Button
                  icon={editing ? <CloseOutlined /> : <EditOutlined />}
                  type="primary"
                  style={{ position: "absolute", top: 24, right: 24, zIndex: 5, background: "#1C3D90" }}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "Hủy chỉnh sửa" : "Thay đổi địa chỉ cho đơn hàng"}
                </Button>

                {editing ? (
                  <Row gutter={16} style={{ marginTop: 48 }}>
                    <Col span={12}>
                      <Form.Item
                        name="senderName"
                        label="Tên người gửi"
                        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name="senderPhone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" },
                        {
                          pattern: /^\d{10}$/,
                          message: "Số điện thoại phải đủ 10 số",
                        },
                        ]}
                      >
                        <Input placeholder="Ví dụ: 0901234567" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <AddressForm form={form} prefix="sender" />
                    </Col>
                  </Row>
                ) : (
                  <div style={{ padding: "0 16px", lineHeight: 1.6 }}>
                    <p>
                      {capitalize(user?.lastName || "")} {capitalize(user?.firstName || "")}
                    </p>
                    <p>{user?.phoneNumber}</p>
                    <p>
                      {user?.detailAddress}, {" "}
                      {wardList.find(w => w.code === user?.codeWard)?.name || ""}, {" "}
                      {provinceList.find(p => p.code === user?.codeCity)?.name || ""}
                    </p>
                  </div>
                )}
              </Card>

              <Card className="custom-card">
                <div className="card-title">Thông tin người nhận</div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="recipientName" label="Tên người nhận" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                      <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item name="recipientPhone" label="Số điện thoại"
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại" },
                      {
                        pattern: /^\d{10}$/,
                        message: "Số điện thoại phải đủ 10 số",
                      },
                      ]}
                    >
                      <Input placeholder="Ví dụ: 0901234567" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <AddressForm form={form} prefix="recipient" />
                  </Col>
                </Row>
              </Card>

              <Card className="custom-card" style={{ position: 'relative' }}>
                <div className="card-title">Thông tin đơn hàng</div>

                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  style={{ position: "absolute", top: 24, right: 24, zIndex: 5, background: "#1C3D90" }}
                  onClick={() => setShowProductModal(true)}
                >
                  Chọn sản phẩm
                </Button>

                {orderProducts.length > 0 && (
                  <Table<OrderProduct>
                    dataSource={orderProducts}
                    rowKey={(record) => String(record.product.id)}
                    pagination={false}
                    columns={orderColumns}
                    style={{ marginBottom: 12, marginTop: 24 }}
                  />
                )}

                <Row gutter={16} style={{ marginTop: 24 }}>
                  <Col span={12}>
                    <Form.Item name="weight" label="Khối lượng (kg)" rules={[{ required: true, type: "number", min: 0, message: "Nhập khối lượng hợp lệ" }]}>
                      <InputNumber style={{ width: "100%" }} placeholder="Ví dụ: 1.5" disabled={orderProducts.length > 0} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="serviceType" label="Loại dịch vụ giao hàng" rules={[{ required: true, message: "Chọn loại dịch vụ" }]}>
                      <Select
                        placeholder="Chọn dịch vụ"
                        value={selectedServiceType?.id}
                        onChange={(value) => {
                          const selected = serviceTypes?.find((s) => s.id === value);
                          setSelectedServiceType(selected || null);
                        }}
                      >
                        {serviceLoading && <Option value="" disabled>Đang tải...</Option>}
                        {serviceTypes?.map((s) => (
                          <Option key={s.id} value={s.id}>{s.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="codAmount"
                      label={
                        <span>
                          Tổng tiền thu hộ (COD){" "}
                          <Tooltip title="Số tiền khách hàng thanh toán khi nhận hàng (chưa bao gồm phí vận chuyển)">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </span>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập tổng tiền thu hộ" },
                        { type: "number", min: 0, message: "Nhập số tiền thu hộ hợp lệ" },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Ví dụ: 20000"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="orderValue"
                      label={
                        <span>
                          Tổng giá trị hàng hóa{" "}
                          <Tooltip title="Tổng giá trị sản phẩm trong đơn hàng (chưa bao gồm phí vận chuyển)">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </span>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập tổng giá trị hàng hóa" },
                        { type: "number", min: 0, message: "Nhập tổng giá trị hàng hóa hợp lệ" },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Ví dụ: 20000"
                        disabled={orderProducts.length > 0}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card className="custom-card">
                <div className="card-title">Thanh toán</div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="payer"
                      label="Người trả phí"
                      initialValue="customer"
                      rules={[{ required: true, message: "Chọn người trả phí" }]}
                    >
                      <Select>
                        <Option value="customer">Người nhận</Option>
                        <Option value="shop">Người gửi</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="paymentMethod"
                      label="Phương thức thanh toán"
                      rules={[{ required: true, message: "Chọn phương thức thanh toán" }]}
                    >
                      <Select>
                        {payer === "customer" ? (
                          <Option value="cash">Tiền mặt</Option>
                        ) : (
                          <>
                            <Option value="bankTransfer">Chuyển khoản</Option>
                            <Option value="vnpay">VNPay</Option>
                            <Option value="zalopay">ZaloPay</Option>
                          </>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Row gutter={16}>
                <Col xs={24} lg={12} style={{ display: 'flex' }}>
                  <Card className="custom-card" style={{ flex: 1 }}>
                    <div className="card-title">Bưu cục gửi</div>
                    <Collapse ghost>
                      <Form.Item
                        name={['sender', 'officeId']}
                        label="Chọn bưu cục"
                        rules={[{ required: true, message: 'Vui lòng chọn bưu cục' }]}
                      >
                        <Select
                          placeholder="Chọn bưu cục"
                          onChange={(value) => {
                            const office = offices.find((o) => o.id === value) || null;
                            setSelectedOffice(office);
                          }}
                        >
                          {offices.map((o) => (
                            <Select.Option key={o.id} value={o.id}>
                              {o.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Collapse>
                  </Card>
                </Col>

                <Col xs={24} lg={12} style={{ display: 'flex' }}>
                  <Card className="custom-card" style={{ flex: 1 }}>
                    <div className="card-title">Ghi chú</div>
                    <Collapse ghost>
                      <Form.Item name="notes">
                        <Input.TextArea placeholder="Nhập ghi chú" autoSize={{ minRows: 3 }} />
                      </Form.Item>
                    </Collapse>
                  </Card>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>

        {/* RIGHT SIDEBAR (cố định) */}
        <Col xs={24} lg={6} className="right-sidebar">
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Phí dịch vụ:</Text>
              <div>{shippingFee.toLocaleString()} VNĐ</div>
            </div>
            {discountAmount > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Giảm giá:</Text>
                <div>-{discountAmount.toLocaleString()} VNĐ</div>
              </div>
            )}
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16 }}>Tổng phí:</Text>
              <div style={{ fontSize: 18, color: "#FF4D4F" }}>
                {totalFee.toLocaleString()} VNĐ
              </div>
            </div>

            <Button
              type="dashed"
              block
              style={{ marginBottom: 16, borderColor: "#1C3D90", color: "#1C3D90" }}
              icon={selectedPromo ? <TagOutlined /> : <GiftOutlined />}
              onClick={() => setShowPromoModal(true)}
            >
              {selectedPromo ? "Đổi mã khuyến mãi" : "Chọn mã khuyến mãi"}
            </Button>

            {selectedPromo && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "8px 12px",
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Text strong style={{ color: "#389e0d" }}>
                    1 mã giảm giá đã áp dụng:
                  </Text>
                  <div>{selectedPromo}</div>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setSelectedPromo(null)}
                />
              </div>
            )}
          </div>

          {/* NHÓM NÚT DƯỚI CÙNG */}
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            <Button
              block
              style={{ borderColor: "#1C3D90", color: "#1C3D90" }}
              icon={<SaveOutlined />}
              onClick={async () => {
                setIsDraft(true);
                try {
                  await form.validateFields();
                  setIsSubmitting(true);
                } catch (err) {
                  console.log("Validation Failed:", err);
                  message.error("Vui lòng điền đầy đủ các trường bắt buộc");
                }
              }}
            >
              Lưu nháp
            </Button>

            <Button
              type="primary"
              block
              style={{ background: "#1C3D90" }}
              icon={<CheckOutlined />}
              onClick={async () => {
                setIsDraft(false);
                try {
                  await form.validateFields();
                  setIsSubmitting(true);
                } catch (err) {
                  console.log("Validation Failed:", err);
                  message.error("Vui lòng điền đầy đủ các trường bắt buộc");
                }
              }}
            >
              Tạo đơn
            </Button>
          </div>
        </Col>
      </Row>

      <Modal
        title="Chọn sản phẩm"
        open={showProductModal}
        onCancel={() => setShowProductModal(false)}
        footer={null}
        width={800}
      >
        <Input.Search
          placeholder="Tìm sản phẩm..."
          allowClear
          onSearch={handleSearch}
          style={{ marginBottom: 12 }}
        />

        <Table
          rowKey="id"
          dataSource={products}
          pagination={false}
          rowSelection={{
            selectedRowKeys: selectedProductIds,
            onChange: (selectedRowKeys) => {
              setSelectedProductIds(selectedRowKeys as number[]);
            },
          }}
          columns={[
            {
              title: "Tên sản phẩm",
              dataIndex: "name",
              key: "name",
            },
            {
              title: "Trọng lượng (Kg)",
              dataIndex: "weight",
              key: "weight",
            },
            {
              title: "Giá (VNĐ)",
              dataIndex: "price",
              key: "price",
              render: (price: number) => `${price.toLocaleString()}`,
            },
            {
              title: "Loại",
              dataIndex: "type",
              key: "type",
            },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
            },
          ]}
        />

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Button
            onClick={handleLoadMoreProducts}
            disabled={!nextCursor}
            style={{
              marginRight: 8,
              background: "#1C3D90",
              color: "#fff",
              borderColor: "#1C3D90",
            }}
          >
            Xem thêm
          </Button>
        </div>

        {/* Footer tùy chỉnh */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button
            style={{ borderColor: "#1C3D90", color: "#1C3D90" }}
            onClick={() => setShowProductModal(false)}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            style={{ background: "#1C3D90", borderColor: "#1C3D90" }}
            onClick={handleSelectProducts}
          >
            Chọn
          </Button>
        </div>
      </Modal>

      {/* MODAL PROMO */}
      <Modal
        title="Chọn khuyến mãi"
        open={showPromoModal}
        onCancel={() => setShowPromoModal(false)}
        footer={null}
      >
        <Input.Search
          placeholder="Tìm khuyến mãi..."
          allowClear
          onSearch={handleSearchPromo}
          style={{ marginBottom: 12 }}
        />

        <Radio.Group
          onChange={(e) => setSelectedPromo(e.target.value)}
          value={selectedPromo}
          style={{ width: "100%" }}
        >
          <List
            dataSource={promotions}
            renderItem={(promo) => (
              <List.Item>
                <Radio value={promo.code} style={{ width: "100%" }}>
                  <div>
                    <strong>{promo.code}</strong>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      <div>{promo.description}</div>
                    </div>
                  </div>
                </Radio>
              </List.Item>
            )}
          />
        </Radio.Group>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Button
            onClick={handleLoadMorePromotions}
            disabled={!promotionNextCursor}
            style={{
              marginRight: 8,
              background: "#1C3D90",
              color: "#fff",
              borderColor: "#1C3D90",
            }}
          >
            Xem thêm
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button
            style={{ borderColor: "#1C3D90", color: "#1C3D90" }}
            onClick={() => setShowPromoModal(false)}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            style={{ background: "#1C3D90", borderColor: "#1C3D90" }}
            onClick={() => setShowPromoModal(false)}
          >
            Chọn
          </Button>
        </div>
      </Modal>

      <style>{`
        .create-order-container { display: flex; flex-direction: column; height: calc(100vh - 120px); padding: 0 16px; background: #fafafa; }
        .left-content { height: 100%; display: flex; flex-direction: column; }
        .scrollable-content { flex: 1; overflow-y: auto; padding-right: 8px; scrollbar-width: none; -ms-overflow-style: none; }
        .custom-card { border-radius: 12px; margin-bottom: 30px; position: relative; border: 1px solid #e4e6eb; box-shadow: 0 4px 10px rgba(0,0,0,0.06); }
        .card-title { position: absolute; top: -12px; left: 16px; background: white; padding: 0 8px; font-weight: 600; color: #1C3D90; font-size: 16px; }
        .right-sidebar { display: flex; flex-direction: column; justify-content: space-between; height: 100%; }
      `}</style>
    </div >
  );
};

export default CreateOrder;