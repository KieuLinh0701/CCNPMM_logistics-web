import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col, Tag, Input, Space, Spin, message, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getActivePromotions, clearPromotionError } from '../store/promotionSlice';
import { Promotion } from '../types/promotion';
import HeaderHome from '../components/header/HeaderHome';
import FooterHome from '../components/footer/FooterHome';

const { Title, Text } = Typography;

const PromotionsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { promotions, loading, nextCursor, error } = useAppSelector((state) => state.promotion);

    const [searchText, setSearchText] = useState<string>('');
    const [shippingFee, setShippingFee] = useState<number>(0);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

    const loadPromotions = (reset = false) => {
        dispatch(getActivePromotions({
            limit: 10,
            searchText,
            shippingFee,
            lastId: reset ? undefined : nextCursor ?? undefined
        }));
    };

    useEffect(() => {
        loadPromotions(true);
    }, [searchText, shippingFee]);

    useEffect(() => {
        if (error) {
            message.error(error);
            dispatch(clearPromotionError());
        }
    }, [error, dispatch]);

    const openPromoModal = (promo: Promotion) => {
        setSelectedPromo(promo);
        setModalOpen(true);
    };

    return (
        <>
        <HeaderHome/>
        <div style={{ paddingTop: 20, paddingLeft: 200, paddingRight: 200, paddingBottom: 70 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                Khuyến mãi hiện có
            </Title>

            <Row justify="center" style={{ marginBottom: 24 }}>
                <Col xs={24} sm={16} md={12}>
                    <Space style={{ width: '100%' }}>
                        <Input
                            placeholder="Tìm kiếm mã hoặc mô tả..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            size="large"
                            style={{ flex: 1, height: 40, minWidth: 600 }}
                        />
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => loadPromotions(true)}
                            size="large"
                            style={{ height: 40, padding: '0 24px', backgroundColor: "#1C3D90", color: "white" }}
                        >
                            Tìm kiếm
                        </Button>
                    </Space>
                </Col>
            </Row>

            {loading && promotions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
            ) : promotions.length === 0 ? (
                <Text style={{ display: 'block', textAlign: 'center' }}>Không có chương trình khuyến mãi nào.</Text>
            ) : (
                <Row gutter={[16, 16]}>
                    {promotions.map((promo: Promotion) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={promo.id}>
                            <Card
                                hoverable
                                bordered
                                style={{ height: '100%', borderRadius: 12 }}
                                bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220, minWidth: 300 }}
                                onClick={() => openPromoModal(promo)}
                            >
                                <div>
                                    <Title level={5} style={{ color: "#1C3D90", fontWeight: 700 }}>{promo.code}</Title>
                                    <Text type="secondary">{promo.description || 'Không có mô tả'}</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color={promo.discountType === 'percentage' ? 'green' : 'blue'}>
                                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()} VNĐ`}
                                        </Tag>
                                        {promo.maxDiscountAmount && promo.discountType === 'percentage' && (
                                            <Tag color="orange">Tối đa {promo.maxDiscountAmount.toLocaleString()} VNĐ</Tag>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <Text>Đơn tối thiểu: {promo.minOrderValue.toLocaleString()} VNĐ</Text>
                                    <div>
                                        <Tag color={promo.status === 'active' ? 'green' : promo.status === 'expired' ? 'red' : 'grey'}>
                                            {promo.status === 'active' ? 'Đang hoạt động' : promo.status === 'expired' ? 'Đã hết hạn' : 'Ngưng áp dụng'}
                                        </Tag>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {nextCursor && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Button
                        onClick={() => loadPromotions()}
                        style={{ borderColor: "#1C3D90", color: "#1C3D90" }}
                        loading={loading}
                    >
                        Xem thêm
                    </Button>
                </div>
            )}

            {/* Modal chi tiết khuyến mãi */}
            <Modal
                open={modalOpen}
                title={selectedPromo?.code}
                onCancel={() => setModalOpen(false)}
                footer={null}
                bodyStyle={{ maxHeight: '70vh', overflowY: 'scroll' }}
            >
                {selectedPromo && (
                    <div>
                        <Text strong>Mô tả: </Text>
                        <Text>{selectedPromo.description || 'Không có mô tả'}</Text>
                        <div style={{ marginTop: 8 }}>
                            <Tag color={selectedPromo.discountType === 'percentage' ? 'green' : 'blue'}>
                                {selectedPromo.discountType === 'percentage' ? `${selectedPromo.discountValue}%` : `${selectedPromo.discountValue.toLocaleString()} VNĐ`}
                            </Tag>
                            {selectedPromo.maxDiscountAmount && selectedPromo.discountType === 'percentage' && (
                                <Tag color="orange">Tối đa {selectedPromo.maxDiscountAmount.toLocaleString()} VNĐ</Tag>
                            )}
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <Text>Đơn tối thiểu: {selectedPromo.minOrderValue.toLocaleString()} VNĐ</Text><br />
                            <Text>Hạn áp dụng: {new Date(selectedPromo.startDate).toLocaleDateString()} - {new Date(selectedPromo.endDate).toLocaleDateString()}</Text><br />
                            {selectedPromo.usageLimit !== null && (
                                <Text>Số lần sử dụng: {selectedPromo.usedCount}/{selectedPromo.usageLimit}</Text>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <style>
                {`
          .ant-modal-body::-webkit-scrollbar {
            display: none;
          }
        `}
            </style>
        </div>
        <FooterHome/>
        </>
    );
};

export default PromotionsPage;