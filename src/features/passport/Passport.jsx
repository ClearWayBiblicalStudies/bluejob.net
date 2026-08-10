import React, { useState } from 'react'
import {
  BadgeCheck, ShieldCheck, Award, BriefcaseBusiness, ArrowLeft, Share2,
  Lock, Star, History, CheckCircle2, AlertCircle, ChevronRight, ArrowRight, Check, X
} from 'lucide-react'
import { Button, Card, Eyebrow, SEOMeta, DemoLabel, Modal, StatusBadge } from '../../components/UI.jsx'
import { DEMO_SCORE, DEMO_EVIDENCE } from '../../data/demo.js'
import { ScoreGauge } from '../dashboard/Dashboard.jsx'

const SCORE_HISTORY = [
  { date: 'Aug 2024', status: 'BUILDING', event: 'Eastside Condo submitted for review' },
  { date: 'Jun 2024', status: 'BUILDING', event: 'OSHA 10 card verified' },
  { date: 'Mar 2024', status: 'BUILDING', event: 'Riverfront Apartments verified' },
  { date: 'Nov 2023', status: 'BUILDING', event: 'Northside Renovation verified' },
]

export function WhyScore({ onBack }) {
  return (
    <div className="page" aria-label="Why is my score building?">
      <SEOMeta title="Work Score Explained" description="How your BlueJob Work Score is calculated." />
      <div className="page-top">
        <button className="back-button" onClick={onBack} aria-label="Back"><ArrowLeft size={17} aria-hidden="true" /> Back</button>
      </div>
      <Eyebrow>WORK SCORE EXPLAINED</Eyebrow>
      <h1>Why is my score building?</h1>
      <p className="lead">A Work Score is earned, not entered. We only calculate it from work and documents that have been independently verified.</p>

      <div className="why-callout" role="status">
        <ShieldCheck size={26} aria-hidden="true" />
        <div>
          <strong>3 of 5 verified records</strong>
          <span>Add two more verified jobs or certifications to unlock your score.</span>
        </div>
      </div>

      <Card className="explanation">
        <h3>What will move you forward</h3>
        {[
          ['Add a completed job', 'A counterparty confirms the job and its outcome.'],
          ['Connect a reference', 'A past employer or GC verifies your work.'],
          ['Keep certifications current', 'Active licenses and safety cards strengthen your record.'],
        ].map(([a, b]) => (
          <div key={a}>
            <Check size={16} aria-hidden="true" className="icon-verified" />
            <span><strong>{a}</strong><small>{b}</small></span>
          </div>
        ))}
      </Card>

      <Card className="explanation">
        <h3>What we never use</h3>
        <div>
          <X size={16} aria-hidden="true" className="icon-rejected" />
          <span><strong>No self-entered score</strong><small>Your score cannot be directly edited by anyone, including you.</small></span>
        </div>
        <div>
          <X size={16} aria-hidden="true" className="icon-rejected" />
          <span><strong>No unverifiable claims</strong><small>Demo records are labeled and never count toward a production score.</small></span>
        </div>
        <div>
          <X size={16} aria-hidden="true" className="icon-rejected" />
          <span><strong>No number before threshold</strong><small>You see BUILDING until 5 verified records are connected.</small></span>
        </div>
      </Card>
    </div>
  )
}

function ScoreBreakdown({ components, onWhyScore }) {
  return (
    <Card aria-label="Score breakdown">
      <Eyebrow>SCORE BREAKDOWN</Eyebrow>
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
      <button className="why-link" onClick={onWhyScore}>
        How is this calculated? <ArrowRight size={15} aria-hidden="true" />
      </button>
    </Card>
  )
}

function PremiumUpsell({ onUnlock, isPremium }) {
  if (isPremium) {
    return (
      <Card className="premium-active" aria-label="Premium Passport active">
        <Eyebrow>PREMIUM PASSPORT</Eyebrow>
        <div className="premium-active-row">
          <Star size={22} aria-hidden="true" className="icon-premium" />
          <div>
            <strong>Premium active</strong>
            <p>Full score history, employer analytics, and priority matching are enabled. <DemoLabel /></p>
          </div>
        </div>
      </Card>
    )
  }
  return (
    <Card className="premium-card" aria-label="Upgrade to Premium Passport">
      <div className="premium-header">
        <Lock size={20} aria-hidden="true" />
        <Eyebrow>PREMIUM PASSPORT</Eyebrow>
      </div>
      <h3>Unlock your full score history</h3>
      <p className="muted">See exactly how your score changes over time, which jobs view your Passport, and priority placement in search.</p>
      <ul className="premium-list">
        <li><CheckCircle2 size={14} aria-hidden="true" className="icon-verified" /> Full score history timeline</li>
        <li><CheckCircle2 size={14} aria-hidden="true" className="icon-verified" /> Employer view analytics</li>
        <li><CheckCircle2 size={14} aria-hidden="true" className="icon-verified" /> Priority job matching</li>
        <li><CheckCircle2 size={14} aria-hidden="true" className="icon-verified" /> Verified badge on Passport</li>
      </ul>
      <Button onClick={onUnlock} variant="premium">Unlock Premium · Demo</Button>
    </Card>
  )
}

function ScoreHistorySection({ isPremium }) {
  if (!isPremium) {
    return (
      <Card className="history-locked" aria-label="Score history locked">
        <Eyebrow>SCORE HISTORY</Eyebrow>
        <div className="history-lock-row">
          <Lock size={18} aria-hidden="true" />
          <span>Unlock Premium to view full score history.</span>
        </div>
      </Card>
    )
  }
  return (
    <Card aria-label="Score history">
      <Eyebrow>SCORE HISTORY</Eyebrow>
      <div className="history-list" role="list">
        {SCORE_HISTORY.map(({ date, status, event }) => (
          <div className="history-row" key={event} role="listitem">
            <div className="history-dot" aria-hidden="true"><History size={14} /></div>
            <div>
              <strong>{event} <DemoLabel /></strong>
              <small>{date} · Score: {status}</small>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function WorkPassport({ profile, isPremium, onUnlockPremium, onBack, onWhyScore }) {
  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'JR'
  const displayName = profile?.name || 'Jordan Reyes'
  const trade = profile?.trade || 'Carpentry'
  const location = profile?.location || 'Portland, OR'
  const { components, stats } = DEMO_SCORE

  return (
    <div className="page passport-page" aria-label="Work Passport">
      <SEOMeta title="Work Passport" description="Your verified Work Passport — track record, score, and credentials." />
      <div className="page-top">
        <button className="back-button" onClick={onBack} aria-label="Back"><ArrowLeft size={17} aria-hidden="true" /> Back</button>
        <button className="share" aria-label="Share passport"><Share2 size={16} aria-hidden="true" /> Share</button>
      </div>

      <div className="passport-hero">
        <div className="avatar" aria-hidden="true">{initials}</div>
        <Eyebrow>WORK PASSPORT · DEMO</Eyebrow>
        <h1>{displayName}</h1>
        <p>{trade} · {location}</p>
        <span className="identity-badge">
          <BadgeCheck size={15} aria-hidden="true" /> Identity verified
        </span>
      </div>

      <div className="passport-score" aria-label="Work Score section">
        <div>
          <Eyebrow>WORK SCORE</Eyebrow>
          <h2>BUILDING</h2>
          <p>{DEMO_SCORE.evidenceCount} verified records · {DEMO_SCORE.evidenceNeeded - DEMO_SCORE.evidenceCount} more to unlock</p>
        </div>
        <ScoreGauge />
      </div>

      <div className="stats-grid" role="list">
        {[
          [stats.verifiedVolume, 'Verified volume'],
          [stats.verifiedJobs, 'Verified jobs'],
          [stats.completion, 'Completion'],
          [stats.repeatHires, 'Repeat hires'],
        ].map(([v, l]) => (
          <div className="stat" key={l} role="listitem">
            <strong>{v}</strong>
            <span>{l}</span>
          </div>
        ))}
      </div>

      <Card className="passport-section" aria-label="Trades and skills">
        <Eyebrow>TRADES &amp; SKILLS</Eyebrow>
        <div className="tag-list" role="list">
          {[trade, ...(profile?.skills || ['Framing', 'Finish work', 'Blueprint reading'])].map(x => (
            <span key={x} role="listitem">{x}</span>
          ))}
        </div>
        <div className="passport-line"><span>On-time percentage</span><strong>91%</strong></div>
        <div className="passport-line"><span>Disputes</span><strong>0</strong></div>
      </Card>

      <Card className="passport-section" aria-label="Evidence">
        <Eyebrow>VERIFIED EVIDENCE</Eyebrow>
        {DEMO_EVIDENCE.map(({ id, title, meta, status }) => (
          <div className="passport-line" key={id}>
            <span>{title} <DemoLabel /></span>
            <StatusBadge status={status} />
          </div>
        ))}
      </Card>

      <ScoreBreakdown components={components} onWhyScore={onWhyScore} />

      <Card className="passport-section" aria-label="Verification badges">
        <Eyebrow>VERIFICATION BADGES</Eyebrow>
        <div className="badge-row">
          <div><Award size={22} aria-hidden="true" /><span>Safety certified</span></div>
          <div><ShieldCheck size={22} aria-hidden="true" /><span>Identity verified</span></div>
          <div><BriefcaseBusiness size={22} aria-hidden="true" /><span>Work history</span></div>
        </div>
      </Card>

      <PremiumUpsell isPremium={isPremium} onUnlock={onUnlockPremium} />
      <ScoreHistorySection isPremium={isPremium} />
    </div>
  )
}
