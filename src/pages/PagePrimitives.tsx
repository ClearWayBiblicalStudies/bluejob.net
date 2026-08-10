import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Logo } from "../components/UI.jsx";
import { useBlueJob } from "../context/BlueJobContext";
export function Page({ children }: { children: ReactNode }) {
  return <main className="page route-page"><header className="onboard-header"><Logo /></header>{children}</main>;
}
export function Action({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="button" to={to}>{children}</Link>;
}
export function DemoAccount({ role }: { role: "WORKER" | "CONTRACTOR" }) {
  const { signIn, setRole } = useBlueJob(); const navigate = useNavigate();
  const enter = () => { setRole(role); signIn({ id: `demo-${role.toLowerCase()}`, name: role === "WORKER" ? "Jordan Reyes" : "Demo Contractor", email: "demo@bluejob.net", role, onboardingComplete: true }); navigate(role === "WORKER" ? "/app/worker" : "/app/contractor"); };
  return <button className="button" onClick={enter}>Continue with Demo account</button>;
}
