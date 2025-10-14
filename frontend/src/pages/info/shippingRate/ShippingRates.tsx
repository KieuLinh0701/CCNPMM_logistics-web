import React from "react";
import HeaderHome from "../../../components/header/HeaderHome";
import ShippingRatesBody from "./shippingRatesBody";
import FooterHome from "../../../components/footer/FooterHome";
import ShippingRatesTools from "./ShippingRatesTools";
import ShippingRatesPolicies from "./ShippingRatesPolicies";

const ShippingRates: React.FC = () => {
  return (
    <div>
      <HeaderHome />
      <ShippingRatesBody />
      <ShippingRatesTools />
      <ShippingRatesPolicies />
      <FooterHome />
    </div>
  );
};

export default ShippingRates;