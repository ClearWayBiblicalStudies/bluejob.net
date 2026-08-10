import React, { useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { useAppState } from './hooks/useAppState.js'
import { WelcomeScreen, SignIn, SignUp, ForgotPassword, VerificationScreen, RoleSelector } from './features/auth/Auth.jsx'
import Onboarding from './features/onboarding/Onboarding.jsx'
import { WorkerDashboard } from './features/dashboard/Dashboard.jsx'
import JobsMarketplace from './features/jobs/Jobs.jsx'
import { WorkPassport, WhyScore } from './features/passport/Passport.jsx'
import Messages from './features/messages/Messages.jsx'
import Notifications from './features/notifications/Notifications.jsx'
import Profile from './features/profile/Profile.jsx'
import ContractorDashboard from './features/admin/ContractorDashboard.jsx'
import AdminPreview from './features/admin/AdminPreview.jsx'
import { PublicHome, FAQPage, NotFound } from './features/public/Public.jsx'
import { Logo, BottomNav } from './components/UI.jsx'
import { Home, Briefcase, WalletCards, MessageCircle, UserRound } from 'lucide-react'
import './styles.css'

const WORKER_TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'jobs', label: 'Jobs', Icon: Briefcase },
  { id: 'passport', label: 'Work Passport', Icon: WalletCards },
  { id: 'messages', label: 'Messages', Icon: MessageCircle },
  { id: 'profile', label: 'Profile', Icon: UserRound },
]

function WorkerApp({ state, update }) {
  const [page, setPage] = useState('home')
  const profile = {
    name: 'Jordan Reyes', trade: 'Carpentry', skills: [], location: 'Portland, OR',
    verificationStatus: 'verified',
    ...state.profile
  }

  const handleNavigate = useCallback(p => setPage(p), [])

  const handleJobToggleSave = jobId => {
    const cur = state.jobs || {}
    const job = cur[jobId] || {}
    update({ jobs: { ...cur, [jobId]: { ...job, saved: !job.saved } } })
  }

  const handleJobApply = (jobId, note) => {
    const cur = state.jobs || {}
    const job = cur[jobId] || {}
    update({ jobs: { ...cur, [jobId]: { ...job, applied: true, applicationNote: note } } })
  }

  const extraEvidence = state.evidence || []
  const handleAddEvidence = ev => update({ evidence: [...extraEvidence, ev] })

  const header = (
    <header className="app-header">
      <Logo />
      <div className="header-actions">
        <button
          className="icon-button notif-btn"
          onClick={() => setPage('notifications')}
          aria-label={`Notifications${state.notifCount ? `, ${state.notifCount} unread` : ''}`}
        >
          <span aria-hidden="true">🔔</span>
          {state.notifCount > 0 && <span className="notif-dot" aria-hidden="true">{state.notifCount}</span>}
        </button>
      </div>
    </header>
  )

  const noNav = ['why-score', 'notifications', 'faq'].includes(page)
  const nav = !noNav ? <BottomNav active={page} onNavigate={handleNavigate} tabs={WORKER_TABS} /> : null

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <WorkerDashboard state={state} update={update} onNavigate={handleNavigate} page="home" extraEvidence={extraEvidence} onAddEvidence={handleAddEvidence} />
      case 'jobs':
        return <JobsMarketplace jobStates={state.jobs || {}} onToggleSave={handleJobToggleSave} onApply={handleJobApply} />
      case 'passport':
        return <WorkPassport profile={profile} isPremium={state.premiumUnlocked} onUnlockPremium={() => update({ premiumUnlocked: true })} onBack={() => setPage('home')} onWhyScore={() => setPage('why-score')} />
      case 'why-score':
        return <WhyScore onBack={() => setPage('home')} />
      case 'messages':
        return <Messages />
      case 'notifications':
        return <Notifications onBack={() => setPage('home')} onMarkRead={() => update({ notifCount: 0 })} />
      case 'profile':
        return (
          <Profile
            profile={profile}
            onUpdateProfile={p => update({ profile: { ...profile, ...p } })}
            onSignOut={() => update({ auth: null, onboardingComplete: false, role: null })}
            onNavigate={handleNavigate}
          />
        )
      case 'faq':
        return <FAQPage onBack={() => setPage('home')} />
      default:
        return <NotFound onHome={() => setPage('home')} />
    }
  }

  return (
    <div className="app-shell">
      {header}
      <main className="app-main dashboard" id="main-content">
        {renderPage()}
      </main>
      {nav}
    </div>
  )
}

function App() {
  const { state, update } = useAppState()
  const [authMode, setAuthMode] = useState('welcome')
  const [showAdmin, setShowAdmin] = useState(false)

  // Hidden admin preview — triggered by URL hash
  React.useEffect(() => {
    const check = () => {
      if (window.location.hash === '#admin-preview') setShowAdmin(true)
    }
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [])

  if (showAdmin) return <AdminPreview onBack={() => { setShowAdmin(false); window.location.hash = '' }} />

  // Contractor role
  if (state.auth && state.onboardingComplete && state.role === 'contractor') {
    return <ContractorDashboard onBack={() => update({ role: 'worker' })} />
  }

  // Worker fully in
  if (state.auth && state.onboardingComplete && state.role === 'worker') {
    return <WorkerApp state={state} update={update} />
  }

  // Auth + role + onboarding flow
  if (state.auth && !state.role) return <RoleSelector onSelectRole={r => update({ role: r })} />
  if (state.auth && state.role === 'worker' && !state.onboardingComplete) {
    return <Onboarding onComplete={p => update({ onboardingComplete: true, profile: { ...state.profile, ...p } })} />
  }
  if (state.auth && state.role === 'contractor' && !state.onboardingComplete) {
    update({ onboardingComplete: true })
    return null
  }

  // Auth screens
  if (authMode === 'forgot') return <ForgotPassword onBack={() => setAuthMode('signin')} onSuccess={() => setAuthMode('signin')} />
  if (authMode === 'signup') return <SignUp onSuccess={u => { update({ auth: u }); setAuthMode('verify') }} onSignIn={() => setAuthMode('signin')} onBack={() => setAuthMode('welcome')} />
  if (authMode === 'signin') return <SignIn onSuccess={u => { update({ auth: u, onboardingComplete: true, role: 'worker', notifCount: 2 }) }} onForgot={() => setAuthMode('forgot')} onSignUp={() => setAuthMode('signup')} onBack={() => setAuthMode('welcome')} />
  if (authMode === 'verify') return <VerificationScreen name={state.auth?.name} onComplete={() => setAuthMode('role')} />
  if (authMode === 'role') return <RoleSelector onSelectRole={r => { update({ role: r }); setAuthMode('onboarding') }} />
  if (authMode === 'onboarding') return <Onboarding onComplete={p => update({ onboardingComplete: true, profile: { ...state.profile, ...p } })} />
  if (authMode === 'public-home') return <PublicHome onSignUp={() => setAuthMode('signup')} onSignIn={() => setAuthMode('signin')} />
  if (authMode === 'faq') return <FAQPage onBack={() => setAuthMode('welcome')} />

  // Default: welcome
  return (
    <WelcomeScreen
      onSignIn={() => setAuthMode('signin')}
      onSignUp={() => setAuthMode('signup')}
      onWorker={() => {
        update({ auth: { name: 'Jordan Reyes', email: 'jordan@demo.bluejob.net' }, role: 'worker', notifCount: 2 })
        setAuthMode('onboarding')
      }}
      onContractor={() => {
        update({ auth: { name: 'Demo Contractor', email: 'hire@demo.bluejob.net' }, role: 'contractor', onboardingComplete: true })
      }}
    />
  )
}

createRoot(document.getElementById('root')).render(<App />)
