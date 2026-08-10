import React, { useState } from 'react'
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Check, FileCheck2, ChevronRight } from 'lucide-react'
import { Logo, Button, Input, Chip, SEOMeta } from '../../components/UI.jsx'
import { TRADES, SKILLS } from '../../data/demo.js'

function ProgressHeader({ step }) {
  return (
    <div className="progress" role="group" aria-label="Onboarding progress">
      <div className="progress-top">
        <span>Profile setup</span>
        <strong>{step} of 4</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={4}
      >
        <div style={{ width: `${step * 25}%` }} />
      </div>
    </div>
  )
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [trade, setTrade] = useState('Carpentry')
  const [selectedSkills, setSelectedSkills] = useState(['Framing', 'Finish work'])
  const toggleSkill = s => setSelectedSkills(v => v.includes(s) ? v.filter(x => x !== s) : [...v, s])

  const handleComplete = () => {
    onComplete({ name, email, trade, skills: selectedSkills })
  }

  return (
    <main className="onboarding" aria-label="Account setup">
      <SEOMeta title="Create your Work Passport" description="Build a BlueJob Work Passport that turns your track record into opportunity." />
      <header className="onboard-header">
        <Logo />
        <span className="save-label" aria-label="Secure and private">🔒 Secure &amp; private</span>
      </header>

      <section className="onboard-content">
        <ProgressHeader step={step} />

        {step === 1 && (
          <div className="onboard-panel">
            <p className="eyebrow">WELCOME TO BLUEJOB</p>
            <h1>Your work should be worth something. <span>Prove it.</span></h1>
            <p className="lead">Build a Work Passport that turns your track record into opportunity.</p>
            <form className="form" onSubmit={e => { e.preventDefault(); setStep(2) }}>
              <Input id="name" label="What should we call you?" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" autoComplete="name" />
              <Input id="email" label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
              <Button type="submit" onClick={() => setStep(2)}>Create worker account</Button>
            </form>
            <p className="fine-print">By continuing, you agree to BlueJob's terms. No credit check. Ever.</p>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-panel">
            <div className="step-icon" aria-hidden="true"><ShieldCheck /></div>
            <p className="eyebrow">STEP 2 · VERIFY IDENTITY</p>
            <h2>One person. One Passport.</h2>
            <p className="lead">Identity verification keeps your work history yours and makes your score trusted by the people hiring you.</p>
            <div className="verify-list" role="list">
              <div role="listitem"><BadgeCheck /><span><strong>Private by design</strong><small>Your documents are encrypted and never shared.</small></span></div>
              <div role="listitem"><Clock3 /><span><strong>Takes about 2 minutes</strong><small>Have a government-issued ID ready.</small></span></div>
            </div>
            <Button onClick={() => setStep(3)}>Start verification</Button>
            <button className="text-button" onClick={() => setStep(3)}>I'll do this later</button>
          </div>
        )}

        {step === 3 && (
          <div className="onboard-panel">
            <p className="eyebrow">STEP 3 · YOUR TRADE</p>
            <h2>What do you do best?</h2>
            <p className="lead">Choose a primary trade, then add the skills you want employers to find you for.</p>
            <label className="field-label" id="trade-label">Primary trade</label>
            <div className="chip-grid" role="radiogroup" aria-labelledby="trade-label">
              {TRADES.map(item => (
                <Chip key={item} selected={trade === item} onClick={() => setTrade(item)}>
                  {trade === item && <Check size={15} aria-hidden="true" />}{item}
                </Chip>
              ))}
            </div>
            <label className="field-label" id="skills-label">Skills</label>
            <div className="chip-grid" role="group" aria-labelledby="skills-label">
              {SKILLS.map(item => (
                <Chip key={item} selected={selectedSkills.includes(item)} onClick={() => toggleSkill(item)}>
                  {selectedSkills.includes(item) && <Check size={15} aria-hidden="true" />}{item}
                </Chip>
              ))}
            </div>
            <Button onClick={() => setStep(4)}>Continue</Button>
          </div>
        )}

        {step === 4 && (
          <div className="onboard-panel">
            <div className="step-icon success" aria-hidden="true"><Check /></div>
            <p className="eyebrow">STEP 4 · CONNECT YOUR WORK</p>
            <h2>Bring your track record with you.</h2>
            <p className="lead">Connect past jobs, certifications, and references. BlueJob verifies every piece before it counts.</p>
            <div className="connect-card" role="button" tabIndex={0}>
              <div className="connect-logo">B</div>
              <div><strong>BlueJob job history</strong><small>Import jobs completed through BlueJob</small></div>
              <ChevronRight aria-hidden="true" />
            </div>
            <div className="connect-card" role="button" tabIndex={0}>
              <div className="connect-logo outline"><FileCheck2 aria-hidden="true" /></div>
              <div><strong>Upload evidence</strong><small>Invoices, certificates, and references</small></div>
              <ChevronRight aria-hidden="true" />
            </div>
            <Button onClick={handleComplete}>Build my Work Passport</Button>
            <p className="demo-note">Demo mode · Sample evidence is clearly marked Demo</p>
          </div>
        )}
      </section>
    </main>
  )
}
