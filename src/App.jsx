import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import ChoosePathPage from './pages/ChoosePathPage';
import WorkerDashboard from './pages/WorkerDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import PostJobPage from './pages/PostJobPage';
import BidDetailPage from './pages/BidDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import PassportPage from './pages/PassportPage';
import PassportEditPage from './pages/PassportEditPage';
import VerificationPage from './pages/VerificationPage';
import { api } from './lib/api';

function AdminRoute() {
  const [allowed, setAllowed] = React.useState(null);
  React.useEffect(() => { api.me().then(({ user }) => setAllowed(user.role === 'SUPER_ADMIN')).catch(() => setAllowed(false)); }, []);
  return allowed ? <AdminDashboard /> : allowed === false ? <Navigate to="/signin" replace /> : null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/choose-path" element={<ChoosePathPage />} />
      <Route path="/app/worker" element={<WorkerDashboard />} />
      <Route path="/app/passport" element={<PassportPage />} />
      <Route path="/app/passport/edit" element={<PassportEditPage />} />
      <Route path="/app/verification" element={<VerificationPage />} />
      <Route path="/app/contractor" element={<ContractorDashboard />} />
      <Route path="/app/post-job" element={<PostJobPage />} />
      <Route path="/app/jobs/:jobId/bids" element={<BidDetailPage />} />
      <Route path="/app/admin" element={<AdminRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
