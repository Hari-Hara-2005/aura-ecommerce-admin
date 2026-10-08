import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar with state */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
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
