import React, { useState } from 'react'
import { Users, Briefcase, Plus, Eye, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card, Eyebrow, Button, SEOMeta, DemoLabel, EmptyState } from '../../components/UI.jsx'
import { DEMO_CONTRACTOR, DEMO_JOBS } from '../../data/demo.js'

const DEMO_APPLICANTS = [
  { id: 'app-1', name: 'Jordan Reyes', trade: 'Carpentry', score: 'BUILDING', match: 94, verified: true },
  { id: 'app-2', name: 'Marcus Chen', trade: 'Carpentry', score: 'BUILDING', match: 81, verified: true },
  { id: 'app-3', name: 'Tanisha Brooks', trade: 'Carpentry', score: 'BUILDING', match: 77, verified: false },
]

function StatCard({ value, label }) {
  return (
    <div className="contractor-stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function ApplicantRow({ app }) {
  return (
    <div className="applicant-row" role="listitem">
      <div className="avatar sm" aria-hidden="true">{app.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
      <div className="applicant-info">
        <strong>{app.name} <DemoLabel /></strong>
        <small>{app.trade} · {app.match}% match</small>
      </div>
      <div className="applicant-right">
        {app.verified && <CheckCircle2 size={14} className="icon-verified" aria-label="Verified" />}
        <button className="small-link" aria-label={`View passport for ${app.name}`}>
          View <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function ContractorDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const c = DEMO_CONTRACTOR

  return (
    <div className="page contractor-page" aria-label="Contractor dashboard">
      <SEOMeta title="Contractor Dashboard" description="Post jobs, review applicants, and find verified workers." />
      <div className="page-top">
        <button className="back-button" onClick={onBack} aria-label="Back to role selection">
          <ArrowLeft size={17} aria-hidden="true" /> Switch role
        </button>
        <span className="demo-chip" aria-label="Demo data">DEMO</span>
      </div>

      <div className="contractor-header">
        <div className="avatar" aria-hidden="true">{c.initials}</div>
        <div>
          <Eyebrow>CONTRACTOR DASHBOARD</Eyebrow>
          <h1>{c.name}</h1>
          <p className="muted">{c.email}</p>
        </div>
      </div>

      <div className="contractor-stats" role="list">
        <StatCard value={c.activePostings} label="Active postings" />
        <StatCard value={c.applicants} label="Total applicants" />
        <StatCard value="3" label="Shortlisted" />
      </div>

      <div className="tab-row" role="tablist">
        {['overview', 'jobs', 'applicants'].map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={activeTab === t}
            className={`tab-btn${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <Card aria-label="Overview">
          <Eyebrow>RECENT ACTIVITY</Eyebrow>
          <div className="activity-list" role="list">
            {[
              '14 workers matched to your Finish Carpenter posting',
              'Jordan Reyes viewed your job listing',
              '2 new applications received today',
            ].map(a => (
              <div className="activity-row" key={a} role="listitem">
                <span className="activity-dot" aria-hidden="true" />
                <p>{a} <DemoLabel /></p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'jobs' && (
        <div>
          <div className="section-heading">
            <Eyebrow>YOUR JOB POSTINGS</Eyebrow>
            <Button variant="secondary" icon={false} onClick={() => {}}>
              <Plus size={15} aria-hidden="true" /> Post job
            </Button>
          </div>
          <div role="list">
            {DEMO_JOBS.slice(0, 2).map(job => (
              <Card key={job.id} className="contractor-job-card" role="listitem" aria-label={`Job: ${job.title}`}>
                <div className="job-title-row">
                  <h3>{job.title} <DemoLabel /></h3>
                  <span className="job-type-pill">{job.type}</span>
                </div>
                <p className="muted">{job.company} · {job.pay}</p>
                <div className="contractor-job-footer">
                  <span><Users size={13} aria-hidden="true" /> {job.match} matches</span>
                  <button className="small-link" aria-label={`View applicants for ${job.title}`}>
                    View applicants <ChevronRight size={14} aria-hidden="true" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'applicants' && (
        <Card aria-label="Applicants">
          <Eyebrow>APPLICANTS</Eyebrow>
          <div role="list">
            {DEMO_APPLICANTS.map(app => <ApplicantRow key={app.id} app={app} />)}
          </div>
        </Card>
      )}
    </div>
  )
}
