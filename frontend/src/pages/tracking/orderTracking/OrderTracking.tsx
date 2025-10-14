import React from "react";
import HeaderHome from "../../../components/header/HeaderHome";
import FooterHome from "../../../components/footer/FooterHome";
import OrderTrackingBody from "./OrderTrackingBody";

const OrderTracking: React.FC = () => {
  return (
    <div>
      <HeaderHome />
      <OrderTrackingBody />
      <FooterHome />
    </div>
  );
};

export default OrderTracking;