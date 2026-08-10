import { useState, useEffect } from 'react'

const STORAGE_KEY = 'bluejob_state_v1'

const DEFAULT_STATE = {
  auth: null, // null = logged out, object = logged in user
  role: null, // 'worker' | 'contractor' | 'admin'
  onboardingComplete: false,
  onboardingStep: 1,
  profile: {
    name: '',
    email: '',
    trade: 'Carpentry',
    skills: [],
    location: '',
    verificationStatus: 'unverified',
  },
  evidence: [],
  jobs: {}, // { [jobId]: { saved, applied, applicationNote } }
  messages: null, // null = use demo data
  notifications: null,
  scoreUnlocked: false,
  premiumUnlocked: false,
  notifCount: 2,
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch (_) {}
  return DEFAULT_STATE
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (_) {}
}

export function useAppState() {
  const [state, setState] = useState(load)

  useEffect(() => {
    save(state)
  }, [state])

  const update = (patch) => setState(s => ({ ...s, ...patch }))

  return { state, update }
}
