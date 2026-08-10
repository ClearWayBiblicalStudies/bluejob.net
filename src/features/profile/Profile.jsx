import React, { useState } from 'react'
import {
  UserRound, Settings, LogOut, ChevronRight, BadgeCheck, Edit3,
  Bell, Lock, HelpCircle, Shield, ArrowLeft
} from 'lucide-react'
import { Button, Card, Eyebrow, SEOMeta, DemoLabel, Input } from '../../components/UI.jsx'
import { TRADES } from '../../data/demo.js'

function ProfileHeader({ profile }) {
  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'JR'
  return (
    <div className="profile-header" aria-label="Profile header">
      <div className="avatar profile-avatar" aria-label={`Avatar for ${profile.name || 'user'}`}>{initials}</div>
      <h1>{profile.name || 'Jordan Reyes'}</h1>
      <p className="muted">{profile.trade || 'Carpentry'} · {profile.location || 'Portland, OR'}</p>
      {profile.verificationStatus === 'verified' && (
        <span className="identity-badge">
          <BadgeCheck size={14} aria-hidden="true" /> Verified <DemoLabel />
        </span>
      )}
    </div>
  )
}

function EditProfileModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name || '')
  const [location, setLocation] = useState(profile.location || '')
  const [trade, setTrade] = useState(profile.trade || 'Carpentry')

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Edit profile">
      <div className="modal-panel">
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <form className="form" onSubmit={e => { e.preventDefault(); onSave({ name, location, trade }) }}>
            <p className="demo-note">Demo · Changes are saved to local state only.</p>
            <Input id="edit-name" label="Full name" value={name} onChange={e => setName(e.target.value)} />
            <Input id="edit-location" label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" />
            <label className="field-label-wrap">
              Primary trade
              <select className="field-input field-select" value={trade} onChange={e => setTrade(e.target.value)} aria-label="Primary trade">
                {TRADES.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <Button type="submit">Save changes</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function SettingRow({ icon: Icon, label, sub, onClick, danger = false }) {
  return (
    <button
      className={`setting-row${danger ? ' danger' : ''}`}
      onClick={onClick}
      aria-label={label}
    >
      <div className="setting-icon" aria-hidden="true"><Icon size={18} /></div>
      <div className="setting-info">
        <span>{label}</span>
        {sub && <small>{sub}</small>}
      </div>
      <ChevronRight size={16} aria-hidden="true" className="setting-arrow" />
    </button>
  )
}

export default function Profile({ profile, onUpdateProfile, onSignOut, onNavigate }) {
  const [editing, setEditing] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const handleSave = updates => {
    onUpdateProfile(updates)
    setEditing(false)
  }

  return (
    <div className="profile-page" aria-label="Profile and settings">
      <SEOMeta title="Profile" description="Your BlueJob profile and account settings." />
      <ProfileHeader profile={profile} />

      <div className="profile-actions">
        <Button variant="secondary" onClick={() => setEditing(true)} icon={false}>
          <Edit3 size={15} aria-hidden="true" /> Edit profile
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('passport')} icon={false}>
          View Passport
        </Button>
      </div>

      <Card aria-label="Account settings">
        <Eyebrow>ACCOUNT</Eyebrow>
        <SettingRow icon={Bell} label="Notifications" sub="Manage alerts and preferences" onClick={() => onNavigate('notifications')} />
        <SettingRow icon={Lock} label="Privacy" sub="Control who sees your Passport" onClick={() => {}} />
        <SettingRow icon={Shield} label="Identity verification" sub={profile.verificationStatus === 'verified' ? 'Verified ✓' : 'Verify your identity'} onClick={() => {}} />
      </Card>

      <Card aria-label="Support settings">
        <Eyebrow>SUPPORT</Eyebrow>
        <SettingRow icon={HelpCircle} label="Help & FAQs" onClick={() => onNavigate('faq')} />
        <SettingRow icon={Settings} label="App settings" onClick={() => {}} />
      </Card>

      <Card aria-label="Danger zone">
        <Eyebrow>ACCOUNT ACTIONS</Eyebrow>
        <SettingRow icon={LogOut} label="Sign out" danger onClick={() => setShowSignOutConfirm(true)} />
      </Card>

      <p className="fine-print center">BlueJob v0.1 · Demo Mode · All data is local and clearly labeled Demo</p>

      {editing && <EditProfileModal profile={profile} onSave={handleSave} onClose={() => setEditing(false)} />}

      {showSignOutConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Sign out confirmation">
          <div className="modal-panel">
            <div className="modal-body">
              <h2>Sign out?</h2>
              <p className="muted">Your demo data will be cleared from local storage.</p>
              <div className="form" style={{ marginTop: '18px', gap: '10px' }}>
                <Button variant="secondary" onClick={() => setShowSignOutConfirm(false)} icon={false}>Cancel</Button>
                <Button variant="danger" onClick={onSignOut} icon={false}>Sign out</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
