import React from "react";
import HeaderHome from "../../../components/header/HeaderHome";
import FooterHome from "../../../components/footer/FooterHome";
import OfficeSearchBody from "./OfficeSearchBody";

const OfficeSearch: React.FC = () => {
  return (
    <div>
      <HeaderHome />
      <OfficeSearchBody />
      <FooterHome />
    </div>
  );
};

export default OfficeSearch;