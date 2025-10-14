import React from "react";
import ShippingFeeBody from "./ShippingFeeBody";
import HeaderHome from "../../../components/header/HeaderHome";
import FooterHome from "../../../components/footer/FooterHome";

const ShippingFee: React.FC = () => {
  return (
    <div>
      <HeaderHome />
      <ShippingFeeBody />
      <FooterHome />
    </div>
  );
};

export default ShippingFee;