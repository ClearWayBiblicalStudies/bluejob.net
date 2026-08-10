import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight, Award, BadgeCheck, BriefcaseBusiness, Building2, Check, ChevronRight,
  CircleHelp, Clock3, FileCheck2, HardHat, Home, Menu, ShieldCheck, Star, UserRound,
  WalletCards, X
} from 'lucide-react'
import './styles.css'

const trades = ['Carpentry', 'Electrical', 'Plumbing', 'HVAC', 'Painting', 'Masonry', 'Roofing', 'General Labor']
const skills = ['Framing', 'Finish work', 'Blueprint reading', 'OSHA 10', 'Site safety', 'Estimating']

const demoEvidence = [
  { title: 'Demo · Riverfront Apartments', meta: 'Commercial framing · $42,000', status: 'Verified', icon: Building2 },
  { title: 'Demo · Northside Renovation', meta: 'Finish carpentry · $18,500', status: 'Verified', icon: BriefcaseBusiness },
  { title: 'Demo · OSHA 10 card', meta: 'Safety certification · Expires 2027', status: 'Verified', icon: ShieldCheck }
]

function Logo({ compact = false }) {
  return <div className="logo"><img src="/bluejob-logo.png" alt="BlueJob" /><span>blue<span className="blue">job</span></span></div>
}

function Button({ children, variant = 'primary', onClick, icon = true, type = 'button' }) {
  return <button type={type} className={`button ${variant}`} onClick={onClick}>{children}{icon && <ArrowRight size={17} />}</button>
}

function Progress({ step }) {
  return <div className="progress"><div className="progress-top"><span>Profile setup</span><strong>{step} of 4</strong></div><div className="progress-track"><div style={{ width: `${step * 25}%` }} /></div></div>
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)
  const [trade, setTrade] = useState('Carpentry')
  const [selectedSkills, setSelectedSkills] = useState(['Framing', 'Finish work'])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const toggleSkill = skill => setSelectedSkills(v => v.includes(skill) ? v.filter(x => x !== skill) : [...v, skill])
  return <main className="onboarding"><header className="onboard-header"><Logo /><span className="save-label">Secure & private</span></header>
    <section className="onboard-content">
      <Progress step={step} />
      {step === 1 && <div className="onboard-panel"><p className="eyebrow">WELCOME TO BLUEJOB</p><h1>Your work should be worth something. <span>Prove it.</span></h1><p className="lead">Build a Work Passport that turns your track record into opportunity.</p><div className="form"><label>What should we call you?<input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" /></label><label>Email address<input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" type="email" /></label><Button onClick={() => setStep(2)}>Create worker account</Button></div><p className="fine-print">By continuing, you agree to BlueJob’s terms. No credit check. Ever.</p></div>}
      {step === 2 && <div className="onboard-panel"><div className="step-icon"><ShieldCheck /></div><p className="eyebrow">STEP 2 · VERIFY IDENTITY</p><h2>One person. One Passport.</h2><p className="lead">Identity verification keeps your work history yours and makes your score trusted by the people hiring you.</p><div className="verify-list"><div><BadgeCheck /><span><strong>Private by design</strong><small>Your documents are encrypted and never shared.</small></span></div><div><Clock3 /><span><strong>Takes about 2 minutes</strong><small>Have a government-issued ID ready.</small></span></div></div><Button onClick={() => setStep(3)}>Start verification</Button><button className="text-button" onClick={() => setStep(3)}>I’ll do this later</button></div>}
      {step === 3 && <div className="onboard-panel"><p className="eyebrow">STEP 3 · YOUR TRADE</p><h2>What do you do best?</h2><p className="lead">Choose a primary trade, then add the skills you want employers to find you for.</p><label className="field-label">Primary trade</label><div className="chip-grid">{trades.map(item => <button key={item} className={`chip ${trade === item ? 'selected' : ''}`} onClick={() => setTrade(item)}>{trade === item && <Check size={15} />}{item}</button>)}</div><label className="field-label">Skills</label><div className="chip-grid">{skills.map(item => <button key={item} className={`chip ${selectedSkills.includes(item) ? 'selected' : ''}`} onClick={() => toggleSkill(item)}>{selectedSkills.includes(item) && <Check size={15} />}{item}</button>)}</div><Button onClick={() => setStep(4)}>Continue</Button></div>}
      {step === 4 && <div className="onboard-panel"><div className="step-icon success"><Check /></div><p className="eyebrow">STEP 4 · CONNECT YOUR WORK</p><h2>Bring your track record with you.</h2><p className="lead">Connect past jobs, certifications, and references. BlueJob verifies every piece before it counts.</p><div className="connect-card"><div className="connect-logo">B</div><div><strong>BlueJob job history</strong><small>Import jobs completed through BlueJob</small></div><ChevronRight /></div><div className="connect-card"><div className="connect-logo outline"><FileCheck2 /></div><div><strong>Upload evidence</strong><small>Invoices, certificates, and references</small></div><ChevronRight /></div><Button onClick={onComplete}>Build my Work Passport</Button><p className="demo-note">Demo mode · Sample evidence is clearly marked Demo</p></div>}
    </section>
  </main>
}

function ScoreGauge({ score = null }) {
  const progress = score ? (score - 300) / 600 : 0.18
  return <div className="gauge-wrap"><div className="gauge"><div className="gauge-inner"><span className="gauge-label">{score ? 'WORK SCORE' : 'WORK SCORE'}</span><strong>{score || 'BUILDING'}</strong><small>{score ? 'Strong foundation' : 'Add verified work to unlock'}</small></div></div><div className="gauge-scale"><span>300</span><span>600</span><span>900</span></div><div className="gauge-needle" style={{ transform: `rotate(${-90 + progress * 180}deg)` }} /></div>
}

function ScoreCard({ onWhy }) {
  const components = [['Reliability', 92, 'On-time completion'], ['Completion', 88, 'Project follow-through'], ['Experience', 76, '3 verified years'], ['Repeat Trust', 84, '2 repeat hires'], ['Compliance', 100, '1 active certification'], ['Evidence Strength', 81, '3 verified records']]
  return <section className="score-card"><div className="section-heading"><div><p className="eyebrow">YOUR WORK SCORE</p><h2>BUILDING</h2></div><button className="icon-button" onClick={onWhy}><CircleHelp size={20} /></button></div><p className="muted">Your score unlocks after enough verified evidence is connected. Keep building your record.</p><ScoreGauge /><div className="score-meter"><div><span>Evidence collected</span><strong>3 of 5 needed</strong></div><div className="meter-track"><div style={{ width: '60%' }} /></div></div><button className="why-link" onClick={onWhy}>Why is my score building? <ArrowRight size={15} /></button><div className="component-list">{components.map(([name, value, detail]) => <div className="component" key={name}><div className="component-icon"><Star size={16} /></div><div className="component-info"><span>{name}</span><small>{detail}</small></div><strong>{value}<small>/100</small></strong></div>)}</div></section>
}

function Evidence() {
  return <section className="card evidence-card"><div className="section-heading"><div><p className="eyebrow">VERIFIED EVIDENCE</p><h2>What counts</h2></div><button className="small-link">View all <ArrowRight size={14} /></button></div>{demoEvidence.map(({ title, meta, status, icon: Icon }) => <div className="evidence-row" key={title}><div className="evidence-icon"><Icon size={19} /></div><div><strong>{title}</strong><small>{meta}</small></div><span className="verified"><BadgeCheck size={14} />{status}</span></div>)}<button className="add-evidence"><span>＋</span> Add work or certification</button></section>
}

function Passport({ onBack }) {
  return <div className="page"><div className="page-top"><button className="back-button" onClick={onBack}>← Back</button><button className="share">Share passport</button></div><div className="passport-hero"><div className="avatar">JR</div><p className="eyebrow">WORK PASSPORT · DEMO</p><h1>Jordan Reyes</h1><p>Carpenter · Portland, OR</p><span className="identity-badge"><BadgeCheck size={15} /> Identity verified</span></div><div className="passport-score"><div><p className="eyebrow">WORK SCORE</p><h2>BUILDING</h2><p>3 verified records · 2 more to unlock</p></div><ShieldCheck size={34} /></div><div className="stats-grid">{[['$60,500','Verified volume'],['3','Verified jobs'],['94%','Completion'],['2','Repeat hires']].map(([v,l]) => <div className="stat" key={l}><strong>{v}</strong><span>{l}</span></div>)}</div><section className="card passport-section"><p className="eyebrow">TRADES & SKILLS</p><div className="tag-list">{['Carpentry','Framing','Finish work','Blueprint reading'].map(x => <span key={x}>{x}</span>)}</div><div className="passport-line"><span>On-time percentage</span><strong>91%</strong></div><div className="passport-line"><span>Disputes</span><strong>0</strong></div></section><section className="card passport-section"><p className="eyebrow">VERIFICATION BADGES</p><div className="badge-row"><div><Award /><span>Safety certified</span></div><div><ShieldCheck /><span>Identity verified</span></div><div><BriefcaseBusiness /><span>Work history</span></div></div></section></div>
}

function WhyScore({ onBack }) {
  return <div className="page"><div className="page-top"><button className="back-button" onClick={onBack}>← Back</button></div><p className="eyebrow">WORK SCORE EXPLAINED</p><h1>Why is my score building?</h1><p className="lead">A Work Score is earned, not entered. We only calculate it from work and documents that have been independently verified.</p><div className="why-callout"><ShieldCheck /><div><strong>3 of 5 verified records</strong><span>Add two more verified jobs or certifications to unlock your score.</span></div></div><section className="card explanation"><h3>What will move you forward</h3>{[['Add a completed job','A counterparty confirms the job and its outcome.'],['Connect a reference','A past employer or GC verifies your work.'],['Keep certifications current','Active licenses and safety cards strengthen your record.']].map(([a,b]) => <div key={a}><Check /><span><strong>{a}</strong><small>{b}</small></span></div>)}</section><section className="card explanation"><h3>What we never use</h3><div><X /><span><strong>No self-entered score</strong><small>Your score cannot be directly edited by anyone.</small></span></div><div><X /><span><strong>No unverifiable claims</strong><small>Demo records are labeled and never count toward a production score.</small></span></div></section></div>
}

function Dashboard({ onNavigate }) {
  return <div className="app-shell"><header className="app-header"><Logo compact /><button className="menu-button"><Menu size={21} /></button></header><main className="dashboard"><div className="welcome"><div><p className="eyebrow">MONDAY, AUGUST 10</p><h1>Good morning, Jordan</h1><p className="muted">Your next opportunity starts with your track record.</p></div><div className="avatar small">JR</div></div><ScoreCard onWhy={() => onNavigate('why')} /><Evidence /><section className="card opportunity"><div className="opportunity-icon"><BriefcaseBusiness /></div><div><p className="eyebrow">RECOMMENDED FOR YOU</p><h3>Finish carpenter · $28–34/hr</h3><p>Northwest Build Co. · 2.4 miles away</p></div><ChevronRight /></section></main><Nav active="home" onNavigate={onNavigate} /></div>
}

function Nav({ active, onNavigate }) {
  return <nav className="bottom-nav">{[['home','Home',Home],['jobs','Jobs',BriefcaseBusiness],['passport','Work Passport',WalletCards],['profile','Profile',UserRound]].map(([id, label, Icon]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => onNavigate(id)}><Icon size={21} /><span>{label}</span></button>)}</nav>
}

function App() {
  const [started, setStarted] = useState(false)
  const [page, setPage] = useState('home')
  if (!started) return <Onboarding onComplete={() => setStarted(true)} />
  if (page === 'passport') return <Passport onBack={() => setPage('home')} />
  if (page === 'why') return <WhyScore onBack={() => setPage('home')} />
  return <Dashboard onNavigate={setPage} />
}

createRoot(document.getElementById('root')).render(<App />)
