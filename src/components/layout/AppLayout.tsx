import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

type Portal = 'farmer' | 'coop' | 'loop';

export default function AppLayout({ portal }: { portal: Portal }) {
  return (
    <div className="app-layout app-shell">
      <Sidebar portal={portal} />
      <div className="app-main main-content">
        <TopBar portal={portal} />
        <div className="app-content page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
