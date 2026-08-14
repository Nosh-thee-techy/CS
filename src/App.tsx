import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';

// Farmer portal
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerDeliveries from './pages/farmer/FarmerDeliveries';

// Cooperative portal
import CoopDashboard from './pages/coop/CoopDashboard';
import LogDelivery from './pages/coop/LogDelivery';
import CoopPayments from './pages/coop/CoopPayments';

// Loop portal
import LoopDashboard from './pages/loop/LoopDashboard';

// Reused admin pages (loop portal)
import FarmerRegistry from './pages/admin/FarmerRegistry';
import FarmerProfile from './pages/admin/FarmerProfile';
import Payments from './pages/admin/Payments';
import Loans from './pages/admin/Loans';

function Placeholder({ title, emoji = '🌿' }: { title: string; emoji?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
      <div style={{ fontSize: '2.5rem' }}>{emoji}</div>
      <h3 style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>This section is coming soon.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Farmer portal */}
        <Route path="/app/farmer" element={<AppLayout portal="farmer" />}>
          <Route index element={<FarmerDashboard />} />
          <Route path="deliveries" element={<FarmerDeliveries />} />
          <Route path="payments" element={<Placeholder title="My Payments" emoji="💸" />} />
          <Route path="score" element={<Placeholder title="My Credit Score" emoji="📊" />} />
          <Route path="loans" element={<Placeholder title="Apply for Loan" emoji="🏦" />} />
        </Route>

        {/* Cooperative portal */}
        <Route path="/app/coop" element={<AppLayout portal="coop" />}>
          <Route index element={<CoopDashboard />} />
          <Route path="log" element={<LogDelivery />} />
          <Route path="farmers" element={<Placeholder title="Farmer Registry" emoji="👥" />} />
          <Route path="payments" element={<CoopPayments />} />
          <Route path="reports" element={<Placeholder title="Reports" emoji="📈" />} />
        </Route>

        {/* Loop portal */}
        <Route path="/app/loop" element={<AppLayout portal="loop" />}>
          <Route index element={<LoopDashboard />} />
          <Route path="farmers" element={<FarmerRegistry />} />
          <Route path="farmers/:id" element={<FarmerProfile />} />
          <Route path="payments" element={<Payments />} />
          <Route path="loans" element={<Loans />} />
          <Route path="analytics" element={<Placeholder title="Analytics" emoji="📊" />} />
          <Route path="settings" element={<Placeholder title="Settings" emoji="⚙️" />} />
        </Route>

        {/* Legacy fallback */}
        <Route path="/app" element={<Navigate to="/app/loop" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
