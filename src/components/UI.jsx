import React from 'react'
import { ArrowRight } from 'lucide-react'

export function Logo({ compact = false }) {
  return (
    <div className="logo">
      <img src="/bluejob-logo.png" alt="BlueJob logo" width="34" height="34" />
      <span aria-label="BlueJob">blue<span className="blue">job</span></span>
    </div>
  )
}

export function Button({ children, variant = 'primary', onClick, icon = true, type = 'button', disabled = false, className = '', fullWidth = false }) {
  return (
    <button
      type={type}
      className={`button ${variant}${fullWidth ? ' full' : ''}${className ? ' ' + className : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
      {icon && <ArrowRight size={17} aria-hidden="true" />}
    </button>
  )
}

export function Avatar({ initials, size = 'md' }) {
  return <div className={`avatar ${size}`} aria-label={`Avatar for ${initials}`}>{initials}</div>
}

export function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>
}

export function Card({ children, className = '' }) {
  return <section className={`card${className ? ' ' + className : ''}`}>{children}</section>
}

export function Badge({ children, variant = 'default' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const map = {
    verified: 'verified',
    pending: 'pending',
    rejected: 'rejected',
    building: 'building',
  }
  const cls = map[status?.toLowerCase()] || 'default'
  return <span className={`status-badge status-${cls}`}>{status}</span>
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <div className="empty-icon" aria-hidden="true"><Icon size={32} /></div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="error-state" role="alert">
      <p>⚠️ {message}</p>
      {onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function ProgressBar({ value, max, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="progress-bar-wrap">
      {label && <div className="progress-bar-label"><span>{label}</span><strong>{value} of {max}</strong></div>}
      <div className="progress-bar-track" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Chip({ children, selected, onClick }) {
  return (
    <button
      type="button"
      className={`chip${selected ? ' selected' : ''}`}
      onClick={onClick}
      aria-pressed={!!selected}
    >
      {children}
    </button>
  )
}

export function Input({ label, id, type = 'text', value, onChange, placeholder, required = false, autoComplete }) {
  return (
    <label htmlFor={id} className="field-label-wrap">
      {label}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="field-input"
        aria-label={label}
      />
    </label>
  )
}

export function BottomNav({ active, onNavigate, tabs }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={active === id ? 'active' : ''}
          onClick={() => onNavigate(id)}
          aria-current={active === id ? 'page' : undefined}
          aria-label={label}
        >
          <Icon size={21} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export function AppShell({ header, children, nav }) {
  return (
    <div className="app-shell">
      {header}
      <main className="app-main" id="main-content">
        {children}
      </main>
      {nav}
    </div>
  )
}

export function SEOMeta({ title, description }) {
  React.useEffect(() => {
    document.title = title ? `${title} — BlueJob` : 'BlueJob · Work Passport for Trades'
    const desc = document.querySelector('meta[name="description"]')
    if (desc && description) desc.setAttribute('content', description)
  }, [title, description])
  return null
}

export function DemoLabel() {
  return <span className="demo-chip" aria-label="Demo data">DEMO</span>
}
