import React, { useState } from 'react'
import { Logo, Button, Input, SEOMeta } from '../../components/UI.jsx'
import { ArrowRight } from 'lucide-react'

function AuthCard({ children, title, subtitle }) {
  return (
    <main className="auth-page">
      <SEOMeta title={title} description="BlueJob — Work Passport for skilled trades workers." />
      <header className="onboard-header">
        <Logo />
      </header>
      <div className="auth-card">
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        {children}
      </div>
    </main>
  )
}

export function WelcomeScreen({ onSignIn, onSignUp, onWorker, onContractor }) {
  return (
    <main className="welcome-screen">
      <SEOMeta title="Welcome" description="BlueJob — The Work Passport for skilled trades workers." />
      <div className="welcome-hero">
        <Logo />
        <h1>Your work should be worth something.</h1>
        <p className="lead">Build a verified Work Passport. Get matched to jobs. Let your record speak.</p>
        <div className="welcome-actions">
          <Button onClick={onWorker} icon>I'm a Worker</Button>
          <Button variant="secondary" onClick={onContractor} icon>I'm Hiring</Button>
        </div>
        <div className="auth-links">
          <button className="text-button" onClick={onSignIn}>Already have an account? Sign in</button>
        </div>
        <p className="demo-note">Demo mode · All data is sample data clearly marked Demo</p>
      </div>
    </main>
  )
}

export function SignIn({ onSuccess, onForgot, onSignUp, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess({ email }) }, 900)
  }

  return (
    <AuthCard title="Sign in" subtitle="Welcome back to BlueJob.">
      <form onSubmit={handleSubmit} className="form" noValidate>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Input id="signin-email" label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
        <Input id="signin-password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        <Button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        <button type="button" className="text-button" onClick={onForgot}>Forgot password?</button>
        <button type="button" className="text-button small" onClick={onSignUp}>Don't have an account? Sign up</button>
        {onBack && <button type="button" className="text-button small" onClick={onBack}>← Back</button>}
      </form>
    </AuthCard>
  )
}

export function SignUp({ onSuccess, onSignIn, onBack }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess({ name, email }) }, 900)
  }

  return (
    <AuthCard title="Create account" subtitle="Start building your Work Passport.">
      <form onSubmit={handleSubmit} className="form" noValidate>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Input id="signup-name" label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Reyes" autoComplete="name" />
        <Input id="signup-email" label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
        <Input id="signup-password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
        <Button type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
        <p className="fine-print">By signing up, you agree to BlueJob's Terms of Service and Privacy Policy. No credit check. Ever.</p>
        <button type="button" className="text-button small" onClick={onSignIn}>Already have an account? Sign in</button>
        {onBack && <button type="button" className="text-button small" onClick={onBack}>← Back</button>}
      </form>
    </AuthCard>
  )
}

export function ForgotPassword({ onBack, onSuccess }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <AuthCard title="Reset password" subtitle="We'll send a reset link to your email.">
      {sent ? (
        <div className="form">
          <div className="step-icon success" aria-hidden="true">✓</div>
          <p>Check your inbox at <strong>{email}</strong>. Demo: no real email is sent.</p>
          <button className="text-button" onClick={onBack}>← Back to sign in</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form" noValidate>
          <Input id="forgot-email" label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
          <Button type="submit">Send reset link</Button>
          <button type="button" className="text-button small" onClick={onBack}>← Back</button>
        </form>
      )}
    </AuthCard>
  )
}

export function VerificationScreen({ name, onComplete }) {
  const [loading, setLoading] = useState(false)
  return (
    <AuthCard title="Verify your identity" subtitle="One person. One Passport.">
      <div className="verify-callout">
        <p>Hi <strong>{name || 'there'}</strong>! A verification code has been sent to your email.</p>
        <p className="demo-note">Demo: No real code is sent. Click below to simulate verification.</p>
      </div>
      <div className="form">
        <Input id="verify-code" label="Enter code" placeholder="6-digit code (demo: any)" />
        <Button onClick={() => { setLoading(true); setTimeout(onComplete, 1000) }} disabled={loading}>{loading ? 'Verifying…' : 'Verify account'}</Button>
        <button className="text-button small" onClick={onComplete}>Skip for now</button>
      </div>
    </AuthCard>
  )
}

export function RoleSelector({ onSelectRole }) {
  return (
    <main className="auth-page">
      <SEOMeta title="Choose your role" />
      <header className="onboard-header"><Logo /></header>
      <div className="auth-card">
        <h1 className="auth-title">How will you use BlueJob?</h1>
        <p className="auth-sub">You can switch roles any time from your profile.</p>
        <div className="role-grid">
          <button className="role-card" onClick={() => onSelectRole('worker')}>
            <div className="role-icon">🪚</div>
            <strong>I'm a Worker</strong>
            <p>Build a Work Passport, get matched to jobs, prove your skills.</p>
          </button>
          <button className="role-card" onClick={() => onSelectRole('contractor')}>
            <div className="role-icon">🏗️</div>
            <strong>I'm Hiring</strong>
            <p>Find verified workers, post jobs, review Work Passports.</p>
          </button>
        </div>
      </div>
    </main>
  )
}
