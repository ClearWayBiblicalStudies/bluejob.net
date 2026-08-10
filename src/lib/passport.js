const PASSPORT_KEY = 'bluejob-work-passport';
const EVIDENCE_KEY = 'bluejob-verification-evidence';

export const emptyPassport = {
  name: '',
  location: '',
  travelRadius: '',
  trade: '',
  workerType: 'Individual',
  crewSize: '1',
  yearsExperience: '',
  skills: '',
  availability: 'Available now',
  tools: '',
  transportation: '',
  history: [],
};

export function readPassport() {
  try {
    const passport = { ...emptyPassport, ...JSON.parse(localStorage.getItem(PASSPORT_KEY) || '{}') };
    return { ...passport, history: Array.isArray(passport.history) ? passport.history : [] };
  } catch {
    return { ...emptyPassport, history: [] };
  }
}

export function savePassport(passport) {
  localStorage.setItem(PASSPORT_KEY, JSON.stringify(passport));
}

export function readEvidence() {
  try {
    return JSON.parse(localStorage.getItem(EVIDENCE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveEvidence(evidence) {
  localStorage.setItem(EVIDENCE_KEY, JSON.stringify(evidence));
}
