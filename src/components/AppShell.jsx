import { Bell, BriefcaseBusiness, Building2, FileCheck2, Gauge, LayoutDashboard, MessageSquare, ReceiptText, Search, Settings, ShieldCheck, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

const workerNav = [
  ['Dashboard', '/app/worker', LayoutDashboard],
  ['Find Work', '/app/worker#find', Search],
  ['My Bids', '/app/worker#bids', ReceiptText],
  ['Work Passport', '/app/worker#passport', FileCheck2],
  ['Work Score', '/app/worker#score', Gauge],
  ['Messages', '/app/worker#messages', MessageSquare],
  ['Jobs', '/app/worker#jobs', BriefcaseBusiness],
  ['Payments', '/app/worker#payments', ShieldCheck],
  ['Settings', '/app/worker#settings', Settings],
];

const contractorNav = [
  ['Dashboard', '/app/contractor', LayoutDashboard],
  ['Post a Job', '/app/post-job', BriefcaseBusiness],
  ['My Projects', '/app/contractor#projects', Building2],
  ['Bids Received', '/app/contractor#bids', ReceiptText],
  ['Subcontractors', '/app/contractor#subs', Users],
  ['Messages', '/app/contractor#messages', MessageSquare],
  ['Company Profile', '/app/contractor#company', Building2],
  ['Work Score', '/app/contractor#score', Gauge],
  ['Settings', '/app/contractor#settings', Settings],
];

export default function AppShell({ role = 'worker', children }) {
  const items = role === 'contractor' ? contractorNav : workerNav;
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Logo />
        <nav>
          {items.map(([label, to, Icon]) => (
            <NavLink key={label} to={to} className={({ isActive }) => isActive && !to.includes('#') ? 'active' : ''}>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div />
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={19}/></button>
            <div className="account-pill">
              <div className="avatar">AA</div>
              <div>
                <strong>Austin A.</strong>
                <span>{role === 'contractor' ? 'Chrome Construction' : 'Subcontractor'}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
