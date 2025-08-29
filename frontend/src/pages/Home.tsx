import React from 'react';
import HeaderHome from '../components/header/HeaderHome';
import FooterHome from '../components/footer/FooterHome';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeaderHome />
      <div style={{ padding: '20px' }}>
        <h1>Home page</h1>
        <p>Chào mừng bạn đến với hệ thống Logistic!</p>
      </div>
      <FooterHome />
    </div>
  );
};

export default HomePage;