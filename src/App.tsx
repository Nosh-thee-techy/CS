import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlatformProvider } from './lib/PlatformContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';

import CoopDashboard from './pages/coop/CoopDashboard';
import LogDelivery from './pages/coop/LogDelivery';
import CoopPayments from './pages/coop/CoopPayments';

import LoopDashboard from './pages/loop/LoopDashboard';
import Scorecard from './pages/loop/Scorecard';
import MapWorkspace from './pages/loop/MapWorkspace';
import GraphView from './pages/loop/GraphView';
import PipelineLogs from './pages/loop/PipelineLogs';
import Partners from './pages/loop/Partners';
import PhoneSimulator from './pages/loop/PhoneSimulator';

import FarmerRegistry from './pages/admin/FarmerRegistry';
import FarmerProfile from './pages/admin/FarmerProfile';
import Payments from './pages/admin/Payments';
import Loans from './pages/admin/Loans';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="card-clean" style={{ textAlign: 'center', padding: 64 }}>
      <h3>{title}</h3>
      <p>This factory section is not on the officer desk.</p>
    </div>
  );
}

export default function App() {
  return (
    <PlatformProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/app/coop" element={<AppLayout portal="coop" />}>
          <Route index element={<CoopDashboard />} />
          <Route path="log" element={<LogDelivery />} />
          <Route path="farmers" element={<Placeholder title="Farmer Registry" />} />
          <Route path="payments" element={<CoopPayments />} />
          <Route path="reports" element={<Placeholder title="Reports" />} />
        </Route>

        <Route path="/app/loop" element={<AppLayout portal="loop" />}>
          <Route index element={<LoopDashboard />} />
          <Route path="scorecard/:id" element={<Scorecard />} />
          <Route path="farmers" element={<FarmerRegistry />} />
          <Route path="farmers/:id" element={<FarmerProfile />} />
          <Route path="map" element={<MapWorkspace />} />
          <Route path="phone" element={<PhoneSimulator />} />
          <Route path="logs" element={<PipelineLogs />} />
          <Route path="graph" element={<GraphView />} />
          <Route path="partners" element={<Partners />} />
          <Route path="payments" element={<Payments />} />
          <Route path="loans" element={<Loans />} />
        </Route>

        <Route path="/app/farmer/*" element={<Navigate to="/" replace />} />
        <Route path="/app" element={<Navigate to="/app/loop" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </PlatformProvider>
  );
}
