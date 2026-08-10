import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ChoosePathPage } from "./pages/ChoosePathPage";
import { WorkerSetupPage } from "./pages/WorkerSetupPage";
import { ContractorSetupPage } from "./pages/ContractorSetupPage";
import { WorkerDashboard } from "./pages/WorkerDashboard";
import { ContractorDashboard } from "./pages/ContractorDashboard";
export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/signin" element={<SignInPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/setup/path" element={<ChoosePathPage />} />
    <Route path="/setup/worker" element={<WorkerSetupPage />} />
    <Route path="/setup/contractor" element={<ContractorSetupPage />} />
    <Route path="/app/worker" element={<WorkerDashboard />} />
    <Route path="/app/contractor" element={<ContractorDashboard />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
