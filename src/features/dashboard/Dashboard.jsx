import React, { useState } from 'react'
import {
  Star, CircleHelp, ArrowRight, BadgeCheck, Building2, BriefcaseBusiness,
  ShieldCheck, ChevronRight, Clock, CheckCircle2, AlertCircle
} from 'lucide-react'
import {
  Button, Card, Eyebrow, Avatar, SEOMeta, DemoLabel,
  Modal, StatusBadge, ProgressBar
} from '../../components/UI.jsx'
import { DEMO_SCORE, DEMO_EVIDENCE, DEMO_JOBS } from '../../data/demo.js'

export function ScoreGauge({ score = null }) {
  const progress = score ? (score - 300) / 600 : 0.18
  return (
    <div className="gauge-wrap" aria-label={score ? `Work Score: ${score}` : 'Work Score: Building'}>
      <div className="gauge" aria-hidden="true">
        <div className="gauge-inner">
          <span className="gauge-label">WORK SCORE</span>
          <strong>{score || 'BUILDING'}</strong>
          <small>{score ? 'Strong foundation' : 'Add verified work to unlock'}</small>
        </div>
      </div>
      <div className="gauge-scale" aria-hidden="true"><span>300</span><span>600</span><span>900</span></div>
      <div className="gauge-needle" aria-hidden="true" style={{ transform: `rotate(${-90 + progress * 180}deg)` }} />
    </div>
  )
}

function ScoreCard({ onWhy }) {
  const { components, evidenceCount, evidenceNeeded } = DEMO_SCORE
  return (
    <section className="score-card" aria-label="Work Score">
      <div className="section-heading">
        <div>
          <Eyebrow>YOUR WORK SCORE</Eyebrow>
          <h2>BUILDING</h2>
        </div>
        <button className="icon-button" onClick={onWhy} aria-label="Why is my score building?">
          <CircleHelp size={20} aria-hidden="true" />
        </button>
      </div>
      <p className="muted">Your score unlocks after enough verified evidence is connected. Keep building your record.</p>
      <ScoreGauge />
      <ProgressBar value={evidenceCount} max={evidenceNeeded} label="Evidence collected" />
      <button className="why-link" onClick={onWhy}>
        Why is my score building? <ArrowRight size={15} aria-hidden="true" />
      </button>
      <div className="component-list" role="list">
        {components.map(({ name, value, detail }) => (
          <div className="component" key={name} role="listitem">
            <div className="component-icon" aria-hidden="true"><Star size={16} /></div>
            <div className="component-info">
              <span>{name}</span>
              <small>{detail}</small>
            </div>
            <strong aria-label={`${name}: ${value} out of 100`}>{value}<small>/100</small></strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function EvidenceIcon({ type }) {
  if (type === 'cert') return <ShieldCheck size={19} aria-hidden="true" />
  return <Building2 size={19} aria-hidden="true" />
}

function EvidenceStatusIcon({ status }) {
  if (status === 'verified') return <CheckCircle2 size={14} className="icon-verified" aria-label="Verified" />
  if (status === 'pending') return <Clock size={14} className="icon-pending" aria-label="Pending" />
  return <AlertCircle size={14} className="icon-rejected" aria-label="Rejected" />
}

function AddEvidenceModal({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [meta, setMeta] = useState('')
  const [type, setType] = useState('job')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    if (!title) return
    setSubmitting(true)
    setTimeout(() => {
      onAdd({ title: `Demo · ${title}`, meta, type, status: 'pending', date: new Date().toISOString().slice(0, 7), id: `ev-${Date.now()}` })
      setSubmitting(false)
      setTitle(''); setMeta(''); setType('job')
      onClose()
    }, 800)
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Evidence">
      <form onSubmit={handleSubmit} className="form" noValidate>
        <p className="demo-note">Demo · This evidence will be labeled Demo and submitted for review.</p>
        <label className="field-label-wrap">
          Title (job name or certification)
          <input className="field-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Willamette Townhomes, OSHA 30" required />
        </label>
        <label className="field-label-wrap">
          Details (type, amount, notes)
          <input className="field-input" value={meta} onChange={e => setMeta(e.target.value)} placeholder="e.g. Framing · $22,000" />
        </label>
        <label className="field-label-wrap">
          Evidence type
          <select className="field-input field-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="job">Completed job</option>
            <option value="cert">Certification / license</option>
            <option value="ref">Reference</option>
          </select>
        </label>
        <Button type="submit" disabled={!title || submitting}>{submitting ? 'Submitting…' : 'Submit for review'}</Button>
      </form>
    </Modal>
  )
}

function EvidenceSection({ extraEvidence = [], onAddEvidence }) {
  const [showModal, setShowModal] = useState(false)
  const allEvidence = [...DEMO_EVIDENCE, ...extraEvidence]

  return (
    <Card className="evidence-card" aria-label="Verified Evidence">
      <div className="section-heading">
        <div>
          <Eyebrow>VERIFIED EVIDENCE</Eyebrow>
          <h2>What counts</h2>
        </div>
        <button className="small-link" aria-label="View all evidence">
          View all <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
      {allEvidence.map(({ id, title, meta, type, status }) => (
        <div className="evidence-row" key={id} role="listitem">
          <div className="evidence-icon" aria-hidden="true"><EvidenceIcon type={type} /></div>
          <div>
            <strong>{title} <DemoLabel /></strong>
            <small>{meta}</small>
          </div>
          <div className="evidence-status">
            <EvidenceStatusIcon status={status} />
            <StatusBadge status={status} />
          </div>
        </div>
      ))}
      <button
        className="add-evidence"
        onClick={() => setShowModal(true)}
        aria-label="Add work or certification evidence"
      >
        <span aria-hidden="true">＋</span> Add work or certification
      </button>
      <AddEvidenceModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={onAddEvidence}
      />
    </Card>
  )
}

function RecommendedJob({ job, onNavigate }) {
  return (
    <Card className="opportunity" role="region" aria-label="Recommended job">
      <div className="opportunity-icon" aria-hidden="true"><BriefcaseBusiness /></div>
      <div>
        <Eyebrow>RECOMMENDED FOR YOU · {job.match}% MATCH</Eyebrow>
        <h3>{job.title} · {job.pay}</h3>
        <p>{job.company} · {job.distance}</p>
      </div>
      <button
        className="opportunity-cta"
        onClick={() => onNavigate('jobs')}
        aria-label={`View job: ${job.title} at ${job.company}`}
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </Card>
  )
}

export function WorkerHome({ profile, onNavigate, extraEvidence, onAddEvidence, notifCount = 0 }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const bestJob = DEMO_JOBS[0]

  return (
    <>
      <SEOMeta title="Home" description="Your BlueJob dashboard — Work Passport, score, and job matches." />
      <div className="welcome">
        <div>
          <Eyebrow>{today.toUpperCase()}</Eyebrow>
          <h1>Good morning, {profile.name.split(' ')[0] || 'Jordan'}</h1>
          <p className="muted">Your next opportunity starts with your track record.</p>
        </div>
        <Avatar initials={profile.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JR'} />
      </div>
      <ScoreCard onWhy={() => onNavigate('why-score')} />
      <EvidenceSection extraEvidence={extraEvidence} onAddEvidence={onAddEvidence} />
      <RecommendedJob job={bestJob} onNavigate={onNavigate} />
    </>
  )
}

// WorkerDashboard is exported for home page rendering within the main WorkerApp shell
export function WorkerDashboard({ state, update, onNavigate, extraEvidence = [], onAddEvidence }) {
  const profile = { name: 'Jordan Reyes', trade: 'Carpentry', skills: [], location: 'Portland, OR', ...state.profile }

  return (
    <WorkerHome
      profile={profile}
      onNavigate={onNavigate}
      extraEvidence={extraEvidence}
      onAddEvidence={onAddEvidence}
      notifCount={state.notifCount || 0}
    />
  )
}
