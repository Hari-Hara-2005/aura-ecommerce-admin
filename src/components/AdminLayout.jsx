import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080C14] dark:text-slate-100 flex transition-colors duration-200">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out min-w-0 ${
          collapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}
