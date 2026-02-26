import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar';
import LoadingScreen from '../components/common/LoadingScreen';

const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000000' }}>
      <Navbar />
      <main style={{ flex: 1, marginLeft: '280px', transition: 'margin-left 0.3s ease', position: 'relative' }}>
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default MainLayout;