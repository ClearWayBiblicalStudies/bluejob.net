import React from 'react'
import { Logo, Button, SEOMeta } from '../../components/UI.jsx'
import { ArrowRight, ShieldCheck, BadgeCheck, Star, Briefcase } from 'lucide-react'

function PublicHeader({ onSignIn }) {
  return (
    <header className="public-header" role="banner">
      <Logo />
      <nav aria-label="Site navigation">
        <button className="text-button nav-link" onClick={onSignIn}>Sign in</button>
      </nav>
    </header>
  )
}

export function PublicHome({ onSignUp, onSignIn }) {
  return (
    <>
      <SEOMeta
        title="BlueJob — Work Passport for Skilled Trades"
        description="Build a verified Work Passport. Get matched to jobs. Prove your skills and let your track record speak for you."
      />
      <PublicHeader onSignIn={onSignIn} />
      <main id="main-content" className="public-main" aria-label="Homepage">
        <section className="public-hero" aria-label="Hero">
          <Logo />
          <h1>Your work should be worth something.</h1>
          <p className="lead">Build a verified Work Passport. Get matched to jobs. Let your track record speak.</p>
          <div className="welcome-actions">
            <Button onClick={onSignUp}>Get started free</Button>
            <Button variant="secondary" onClick={onSignIn} icon={false}>Sign in</Button>
          </div>
          <p className="fine-print">No credit check. No upfront cost. Trusted by tradespeople.</p>
        </section>

        <section className="public-features" aria-label="Features">
          <div className="feature-card" role="article">
            <div className="feature-icon" aria-hidden="true"><ShieldCheck size={28} /></div>
            <h2>Verified Work History</h2>
            <p>Every job, cert, and reference is independently verified before it counts.</p>
          </div>
          <div className="feature-card" role="article">
            <div className="feature-icon" aria-hidden="true"><Star size={28} /></div>
            <h2>Work Score</h2>
            <p>An earned score that reflects your reliability, experience, and track record — not self-reported data.</p>
          </div>
          <div className="feature-card" role="article">
            <div className="feature-icon" aria-hidden="true"><Briefcase size={28} /></div>
            <h2>Matched Jobs</h2>
            <p>Get matched to jobs that fit your trade, skills, and location. Apply in seconds with your Passport.</p>
          </div>
          <div className="feature-card" role="article">
            <div className="feature-icon" aria-hidden="true"><BadgeCheck size={28} /></div>
            <h2>One Passport</h2>
            <p>Portable, secure, and always yours. Take your Work Passport to every job.</p>
          </div>
        </section>

        <section className="public-cta" aria-label="Call to action">
          <h2>Ready to build your Work Passport?</h2>
          <Button onClick={onSignUp}>Create your free account</Button>
        </section>
      </main>

      <footer className="public-footer" role="contentinfo">
        <Logo />
        <p className="fine-print">© 2024 BlueJob. All rights reserved. · <button className="text-button inline" onClick={() => {}}>Privacy</button> · <button className="text-button inline" onClick={() => {}}>Terms</button></p>
      </footer>
    </>
  )
}

export function FAQPage({ onBack }) {
  const faqs = [
    ['What is a Work Passport?', 'A Work Passport is your verified work history, skills, and certifications in one portable profile. Employers can see your track record before hiring.'],
    ['How is the Work Score calculated?', 'Your Work Score is calculated from verified evidence only — completed jobs, certifications, and references. You cannot manually edit it.'],
    ['When does my score unlock?', 'Your Work Score displays as BUILDING until you have at least 5 verified records connected.'],
    ['Is my data private?', 'Yes. Your documents are encrypted and never shared without your explicit permission.'],
    ['What does Demo mean?', 'In demo mode, all data is sample data clearly labeled "Demo". No real submission, payment, or identity check occurs.'],
  ]

  return (
    <main className="public-main" aria-label="FAQ">
      <SEOMeta title="FAQ" description="Frequently asked questions about BlueJob and your Work Passport." />
      <button className="back-button" onClick={onBack} aria-label="Back">← Back</button>
      <h1>Frequently asked questions</h1>
      <div className="faq-list" role="list">
        {faqs.map(([q, a]) => (
          <div className="faq-item" key={q} role="listitem">
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

export function NotFound({ onHome }) {
  return (
    <main className="not-found" aria-label="Page not found">
      <SEOMeta title="404 — Page not found" />
      <div className="not-found-inner">
        <span className="not-found-code" aria-hidden="true">404</span>
        <h1>Page not found</h1>
        <p className="muted">The page you're looking for doesn't exist or has been moved.</p>
        <Button onClick={onHome}>Go home</Button>
      </div>
    </main>
  )
}
