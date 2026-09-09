import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChoosePathPage from './pages/ChoosePathPage';
import WorkerDashboard from './pages/WorkerDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import PostJobPage from './pages/PostJobPage';
import BidDetailPage from './pages/BidDetailPage';
import AdminJobs from './pages/AdminJobs';
import PassportPage from './pages/PassportPage';
import PassportEditPage from './pages/PassportEditPage';
import VerificationPage from './pages/VerificationPage';
import AccountSecurityPage from './pages/AccountSecurityPage';
import RatingPage from './pages/RatingPage';
import MembershipSuccessPage from './pages/MembershipSuccessPage';
import MembershipCancelPage from './pages/MembershipCancelPage';
import { api } from './lib/api';

function AdminRoute() {
  const [allowed, setAllowed] = React.useState(null);
  React.useEffect(() => { api.me().then(({ user }) => setAllowed(['ADMIN','SUPER_ADMIN'].includes(user.role))).catch(() => setAllowed(false)); }, []);
  return allowed ? <AdminJobs /> : allowed === false ? <Navigate to="/signin" replace /> : null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/choose-path" element={<ChoosePathPage />} />
      <Route path="/membership/success" element={<MembershipSuccessPage />} />
      <Route path="/membership/cancel" element={<MembershipCancelPage />} />
      <Route path="/app/worker" element={<WorkerDashboard />} />
      <Route path="/app/passport" element={<PassportPage />} />
      <Route path="/app/passport/edit" element={<PassportEditPage />} />
      <Route path="/app/verification" element={<VerificationPage />} />
      <Route path="/app/security" element={<AccountSecurityPage />} />
      <Route path="/app/contractor" element={<ContractorDashboard />} />
      <Route path="/app/post-job" element={<PostJobPage />} />
      <Route path="/app/jobs/:jobId/bids" element={<BidDetailPage />} />
      <Route path="/app/jobs/:jobId/rating" element={<RatingPage />} />
      <Route path="/app/admin" element={<AdminRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
