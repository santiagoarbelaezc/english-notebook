import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar';

const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, marginLeft: '280px', transition: 'margin-left 0.3s ease' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;