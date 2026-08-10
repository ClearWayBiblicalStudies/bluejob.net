import React from 'react'
import {
  Users, Briefcase, ShieldCheck, AlertTriangle, CheckCircle2, Clock,
  ArrowLeft, Eye, Database
} from 'lucide-react'
import { Card, Eyebrow, SEOMeta, DemoLabel } from '../../components/UI.jsx'
import { DEMO_EVIDENCE, DEMO_JOBS, DEMO_SCORE } from '../../data/demo.js'

const ADMIN_STATS = [
  { label: 'Total users', value: '1,842', icon: Users },
  { label: 'Active jobs', value: '237', icon: Briefcase },
  { label: 'Evidence pending', value: '14', icon: Clock },
  { label: 'Verified passports', value: '1,104', icon: ShieldCheck },
]

const PENDING_EVIDENCE = [
  { id: 'pe-1', user: 'Jordan Reyes', title: 'Demo · Eastside Condo Project', type: 'job', submitted: '2024-08-09' },
  { id: 'pe-2', user: 'Marcus Chen', title: 'Demo · OSHA 30 card', type: 'cert', submitted: '2024-08-08' },
]

export default function AdminPreview({ onBack }) {
  return (
    <div className="page admin-page" aria-label="Admin preview">
      <SEOMeta title="Admin Preview" />
      <div className="page-top">
        <button className="back-button" onClick={onBack} aria-label="Back"><ArrowLeft size={17} aria-hidden="true" /> Back</button>
        <span className="admin-badge" aria-label="Admin view">⚙ ADMIN PREVIEW</span>
      </div>
      <Eyebrow>HIDDEN ADMIN VIEW</Eyebrow>
      <h1>Platform overview</h1>
      <p className="muted">Accessible via route /admin-preview. All data is demo. <DemoLabel /></p>

      <div className="admin-stats" role="list">
        {ADMIN_STATS.map(({ label, value, icon: Icon }) => (
          <div className="admin-stat-card" key={label} role="listitem">
            <Icon size={20} aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <Card aria-label="Evidence queue">
        <Eyebrow>EVIDENCE REVIEW QUEUE</Eyebrow>
        <div role="list">
          {PENDING_EVIDENCE.map(pe => (
            <div className="admin-evidence-row" key={pe.id} role="listitem">
              <div className="evidence-status">
                <Clock size={14} className="icon-pending" aria-hidden="true" />
              </div>
              <div>
                <strong>{pe.title} <DemoLabel /></strong>
                <small>{pe.user} · Submitted {pe.submitted}</small>
              </div>
              <div className="admin-actions">
                <button className="admin-btn approve" aria-label="Approve evidence">✓ Approve</button>
                <button className="admin-btn reject" aria-label="Reject evidence">✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card aria-label="Score engine">
        <Eyebrow>SCORE ENGINE STATUS</Eyebrow>
        <div className="admin-engine-row">
          <CheckCircle2 size={16} className="icon-verified" aria-hidden="true" />
          <span>Scoring algorithm running normally <DemoLabel /></span>
        </div>
        <div className="admin-engine-row">
          <Database size={16} aria-hidden="true" />
          <span>Evidence threshold: 5 records required to unlock score</span>
        </div>
        <div className="admin-engine-row">
          <AlertTriangle size={16} className="icon-pending" aria-hidden="true" />
          <span>Score is read-only — no admin override allowed</span>
        </div>
      </Card>
    </div>
  )
}
