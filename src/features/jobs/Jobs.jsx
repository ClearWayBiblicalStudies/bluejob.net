import React, { useState } from 'react'
import {
  Briefcase, MapPin, Clock, ChevronRight, Bookmark, BookmarkCheck,
  CheckCircle2, ArrowLeft, X, Check, Zap
} from 'lucide-react'
import { Button, Card, Eyebrow, SEOMeta, EmptyState, DemoLabel, Modal } from '../../components/UI.jsx'
import { DEMO_JOBS } from '../../data/demo.js'

function MatchBar({ value }) {
  const color = value >= 85 ? '#5cd4a7' : value >= 70 ? '#2785f7' : '#8090a2'
  return (
    <div className="match-bar" aria-label={`${value}% match`}>
      <div className="match-bar-fill" style={{ width: `${value}%`, background: color }} />
      <span style={{ color }}>{value}%</span>
    </div>
  )
}

function JobCard({ job, onSelect, jobState = {}, onToggleSave }) {
  return (
    <div
      className={`job-card${job.applied || jobState.applied ? ' applied' : ''}`}
      role="article"
      aria-label={`Job: ${job.title} at ${job.company}`}
    >
      <div className="job-card-top">
        <div className="job-card-main" onClick={() => onSelect(job)} style={{ cursor: 'pointer' }}>
          <div className="job-title-row">
            <h3>{job.title}</h3>
            <span className="job-type-pill">{job.type}</span>
          </div>
          <p className="job-company"><strong>{job.company}</strong> · <MapPin size={12} aria-hidden="true" /> {job.location}</p>
          <p className="job-meta">
            <span className="job-pay">{job.pay}</span>
            <span className="job-distance"><Clock size={12} aria-hidden="true" /> {job.posted}</span>
            <span className="job-distance"><MapPin size={12} aria-hidden="true" /> {job.distance}</span>
          </p>
        </div>
        <button
          className={`save-btn${job.saved || jobState.saved ? ' saved' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleSave(job.id) }}
          aria-label={job.saved || jobState.saved ? 'Unsave job' : 'Save job'}
          aria-pressed={!!(job.saved || jobState.saved)}
        >
          {job.saved || jobState.saved ? <BookmarkCheck size={19} aria-hidden="true" /> : <Bookmark size={19} aria-hidden="true" />}
        </button>
      </div>
      <div className="job-card-footer">
        <MatchBar value={job.match} />
        {(job.applied || jobState.applied) && (
          <span className="applied-badge"><CheckCircle2 size={13} aria-hidden="true" /> Applied</span>
        )}
      </div>
    </div>
  )
}

function MatchExplanation({ reasons }) {
  return (
    <div className="match-explain">
      <Eyebrow>WHY YOU MATCH</Eyebrow>
      <ul>
        {reasons.map(r => (
          <li key={r}><Check size={14} aria-hidden="true" className="icon-verified" /> {r}</li>
        ))}
      </ul>
    </div>
  )
}

function ApplyModal({ open, onClose, job, onApply }) {
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleApply = e => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      onApply(job.id, note)
      onClose()
      setSubmitted(false)
      setNote('')
    }, 800)
  }

  return (
    <Modal open={open} onClose={onClose} title={`Apply to ${job?.company}`}>
      {job && (
        <form onSubmit={handleApply} className="form" noValidate>
          <p className="demo-note">Demo · This is a simulated application. No real submission is made.</p>
          <div className="apply-job-summary">
            <strong>{job.title}</strong>
            <span>{job.company} · {job.pay}</span>
          </div>
          <label className="field-label-wrap">
            Note to employer (optional)
            <textarea
              className="field-input field-textarea"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Introduce yourself or highlight relevant experience…"
              rows={4}
              aria-label="Note to employer"
            />
          </label>
          <p className="fine-print">Your Work Passport will be shared automatically.</p>
          <Button type="submit" disabled={submitted}>{submitted ? 'Submitting…' : 'Submit application'}</Button>
        </form>
      )}
    </Modal>
  )
}

function JobDetail({ job, jobState = {}, onBack, onApply, onToggleSave }) {
  const [showApply, setShowApply] = useState(false)
  const isApplied = job.applied || jobState.applied
  const isSaved = job.saved || jobState.saved

  return (
    <div className="job-detail" aria-label={`Job detail: ${job.title}`}>
      <SEOMeta title={`${job.title} — ${job.company}`} description={job.description} />
      <div className="page-top">
        <button className="back-button" onClick={onBack} aria-label="Back to jobs">
          <ArrowLeft size={17} aria-hidden="true" /> Back
        </button>
        <button
          className={`save-btn${isSaved ? ' saved' : ''}`}
          onClick={() => onToggleSave(job.id)}
          aria-pressed={!!isSaved}
          aria-label={isSaved ? 'Unsave job' : 'Save job'}
        >
          {isSaved ? <BookmarkCheck size={20} aria-hidden="true" /> : <Bookmark size={20} aria-hidden="true" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="job-detail-hero">
        <div className="job-detail-icon" aria-hidden="true"><Briefcase size={26} /></div>
        <div>
          <h1>{job.title}</h1>
          <p>{job.company} · {job.location} · {job.pay}</p>
          <div className="job-detail-pills">
            <span className="job-type-pill">{job.type}</span>
            <span className="job-distance">{job.distance}</span>
            <span className="job-distance">{job.posted}</span>
          </div>
        </div>
      </div>

      <MatchExplanation reasons={job.matchReasons} />

      <Card>
        <Eyebrow>ABOUT THIS ROLE</Eyebrow>
        <p className="job-desc">{job.description} <DemoLabel /></p>
        <Eyebrow>REQUIREMENTS</Eyebrow>
        <ul className="job-reqs">
          {job.requirements.map(r => <li key={r}><Check size={14} aria-hidden="true" /> {r}</li>)}
        </ul>
      </Card>

      <div className="job-detail-actions">
        {isApplied ? (
          <div className="applied-success">
            <CheckCircle2 size={20} aria-hidden="true" />
            <span>Application submitted</span>
          </div>
        ) : (
          <Button onClick={() => setShowApply(true)} fullWidth>Apply now</Button>
        )}
      </div>

      <ApplyModal open={showApply} onClose={() => setShowApply(false)} job={job} onApply={onApply} />
    </div>
  )
}

export default function JobsMarketplace({ jobStates = {}, onToggleSave, onApply }) {
  const [selectedJob, setSelectedJob] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = DEMO_JOBS.filter(j => {
    if (filter === 'saved') return j.saved || jobStates[j.id]?.saved
    if (filter === 'applied') return j.applied || jobStates[j.id]?.applied
    return true
  })

  if (selectedJob) {
    return (
      <JobDetail
        job={selectedJob}
        jobState={jobStates[selectedJob.id] || {}}
        onBack={() => setSelectedJob(null)}
        onApply={(id, note) => { onApply(id, note); setSelectedJob(null) }}
        onToggleSave={onToggleSave}
      />
    )
  }

  return (
    <div className="jobs-page" aria-label="Jobs marketplace">
      <SEOMeta title="Jobs" description="Browse verified trades jobs matched to your Work Passport." />
      <h1>Jobs for you</h1>
      <p className="muted">Matched to your verified trade and skills. <DemoLabel /></p>

      <div className="job-filters" role="group" aria-label="Filter jobs">
        {['all', 'saved', 'applied'].map(f => (
          <button
            key={f}
            className={`filter-pill${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f === 'all' ? 'All jobs' : f === 'saved' ? 'Saved' : 'Applied'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs here yet" description="Save or apply to jobs to see them here." />
      ) : (
        <div className="job-list" role="list">
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              jobState={jobStates[job.id] || {}}
              onSelect={setSelectedJob}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  )
}
