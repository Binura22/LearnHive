// components/common/Layout.js
import React from 'react';
import Navbar from './Navbar'; // adjust the path if needed
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
