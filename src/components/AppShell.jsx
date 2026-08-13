import { Bell, BriefcaseBusiness, Building2, CreditCard, FileCheck2, Gauge, LayoutDashboard, MessageSquare, ReceiptText, Search, Settings, ShieldCheck, UserRound, Users, ClipboardCheck, Scale, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

const workerNav = [
  ['Dashboard', '/app/worker', LayoutDashboard],
  ['Find Work', '/app/worker#find', Search],
  ['My Bids', '/app/worker#bids', ReceiptText],
  ['Work Passport', '/app/passport', FileCheck2],
  ['Work Score', '/app/worker#score', Gauge],
  ['Messages', '/app/worker#messages', MessageSquare],
  ['Jobs', '/app/worker#jobs', BriefcaseBusiness],
  ['Payments', '/app/worker#payments', CreditCard],
  ['Settings', '/app/worker#settings', Settings],
  ['Security', '/app/security', ShieldCheck],
];

const contractorNav = [
  ['Dashboard', '/app/contractor', LayoutDashboard],
  ['Post a Job', '/app/post-job', BriefcaseBusiness],
  ['My Projects', '/app/contractor#projects', Building2],
  ['Bids Received', '/app/contractor#bids', ReceiptText],
  ['Subcontractors', '/app/contractor#subs', Users],
  ['Messages', '/app/contractor#messages', MessageSquare],
  ['Company Profile', '/app/contractor#company', UserRound],
  ['Work Score', '/app/contractor#score', Gauge],
  ['Settings', '/app/contractor#settings', Settings],
  ['Security', '/app/security', ShieldCheck],
];

const adminNav = [
  ['Operations Command Center', '/app/admin', LayoutDashboard],
  ['Users', '/app/admin#users', Users],
  ['Organizations', '/app/admin#organizations', Building2],
  ['Jobs', '/app/admin#jobs', BriefcaseBusiness],
  ['Work Scores', '/app/admin#scores', Gauge],
  ['Verification Queue', '/app/admin#verification', ClipboardCheck],
  ['Disputes', '/app/admin#disputes', Scale],
  ['Billing & Memberships', '/app/admin#billing', CreditCard],
  ['Growth & Analytics', '/app/admin#growth', BarChart3],
  ['System Settings', '/app/admin#settings', Settings],
];

export default function AppShell({ role = 'worker', children, user = { initials: 'AA', name: 'Austin A.' } }) {
  const items = role === 'admin' ? adminNav : role === 'contractor' ? contractorNav : workerNav;
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
              <div className="avatar">{user.initials}</div>
              <div>
                <strong>{user.name}</strong>
                <span>{role === 'admin' ? 'SUPER_ADMIN · BlueJob Administration' : role === 'contractor' ? 'Chrome Construction' : 'Subcontractor'}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
