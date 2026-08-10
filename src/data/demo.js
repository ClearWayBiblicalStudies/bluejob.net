// All demo data is clearly labeled Demo and never affects production scores

export const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Jordan Reyes',
  initials: 'JR',
  email: 'jordan@demo.bluejob.net',
  role: 'worker', // 'worker' | 'contractor' | 'admin'
  trade: 'Carpentry',
  skills: ['Framing', 'Finish work', 'Blueprint reading', 'OSHA 10'],
  location: 'Portland, OR',
  verificationStatus: 'verified', // 'unverified' | 'pending' | 'verified'
  memberSince: '2023',
  isPremium: false,
}

export const DEMO_SCORE = {
  status: 'BUILDING', // 'BUILDING' | number (300-900)
  evidenceCount: 3,
  evidenceNeeded: 5,
  components: [
    { name: 'Reliability', value: 92, detail: 'On-time completion' },
    { name: 'Completion', value: 88, detail: 'Project follow-through' },
    { name: 'Experience', value: 76, detail: '3 verified years' },
    { name: 'Repeat Trust', value: 84, detail: '2 repeat hires' },
    { name: 'Compliance', value: 100, detail: '1 active certification' },
    { name: 'Evidence Strength', value: 81, detail: '3 verified records' },
  ],
  stats: {
    verifiedVolume: '$60,500',
    verifiedJobs: 3,
    completion: '94%',
    repeatHires: 2,
  },
}

export const DEMO_EVIDENCE = [
  {
    id: 'ev-1',
    title: 'Demo · Riverfront Apartments',
    meta: 'Commercial framing · $42,000',
    type: 'job',
    status: 'verified',
    date: '2024-03',
  },
  {
    id: 'ev-2',
    title: 'Demo · Northside Renovation',
    meta: 'Finish carpentry · $18,500',
    type: 'job',
    status: 'verified',
    date: '2023-11',
  },
  {
    id: 'ev-3',
    title: 'Demo · OSHA 10 card',
    meta: 'Safety certification · Expires 2027',
    type: 'cert',
    status: 'verified',
    date: '2023-06',
  },
  {
    id: 'ev-4',
    title: 'Demo · Eastside Condo Project',
    meta: 'Rough framing · $9,200',
    type: 'job',
    status: 'pending',
    date: '2024-07',
  },
]

export const DEMO_JOBS = [
  {
    id: 'job-1',
    title: 'Finish Carpenter',
    company: 'Northwest Build Co.',
    location: 'Portland, OR',
    distance: '2.4 mi',
    pay: '$28–34/hr',
    type: 'Full-time',
    trade: 'Carpentry',
    posted: '2 days ago',
    match: 94,
    matchReasons: ['Trade match: Carpentry', 'Skill match: Finish work, Framing', 'Location within 5 mi', 'Score tier eligible'],
    description: 'Demo · Northwest Build Co. is seeking an experienced finish carpenter for commercial and residential projects across the Portland metro area.',
    requirements: ['3+ years finish carpentry', 'Blueprint reading', 'Own reliable transport'],
    saved: false,
    applied: false,
  },
  {
    id: 'job-2',
    title: 'Lead Framer',
    company: 'Pacific Structures',
    location: 'Beaverton, OR',
    distance: '8.1 mi',
    pay: '$32–38/hr',
    type: 'Contract',
    trade: 'Carpentry',
    posted: '1 day ago',
    match: 88,
    matchReasons: ['Trade match: Carpentry', 'Skill match: Framing', 'Blueprint reading verified'],
    description: 'Demo · Pacific Structures needs a lead framer for a 6-month commercial build starting September.',
    requirements: ['5+ years framing', 'Crew leadership experience', 'OSHA 10 or 30'],
    saved: true,
    applied: false,
  },
  {
    id: 'job-3',
    title: 'Trim & Millwork Carpenter',
    company: 'Artisan Homes',
    location: 'Lake Oswego, OR',
    distance: '11.3 mi',
    pay: '$30–36/hr',
    type: 'Part-time',
    trade: 'Carpentry',
    posted: '4 days ago',
    match: 81,
    matchReasons: ['Trade match: Carpentry', 'Skill match: Finish work'],
    description: 'Demo · Artisan Homes specializes in high-end custom homes and needs a detail-oriented trim carpenter.',
    requirements: ['Trim installation', 'Attention to detail', 'Reliable transportation'],
    saved: false,
    applied: true,
  },
  {
    id: 'job-4',
    title: 'General Carpenter',
    company: 'Metro Construction',
    location: 'Hillsboro, OR',
    distance: '15.7 mi',
    pay: '$24–28/hr',
    type: 'Full-time',
    trade: 'Carpentry',
    posted: '1 week ago',
    match: 73,
    matchReasons: ['Trade match: Carpentry', 'Location match'],
    description: 'Demo · Metro Construction is hiring general carpenters for ongoing commercial work.',
    requirements: ['2+ years experience', 'Basic carpentry skills'],
    saved: false,
    applied: false,
  },
  {
    id: 'job-5',
    title: 'Site Safety Officer',
    company: 'Cascade Builders',
    location: 'Portland, OR',
    distance: '3.9 mi',
    pay: '$38–45/hr',
    type: 'Full-time',
    trade: 'General Labor',
    posted: '3 days ago',
    match: 68,
    matchReasons: ['OSHA 10 certification verified', 'Location match'],
    description: 'Demo · Cascade Builders needs a site safety officer to oversee compliance on a large mixed-use development.',
    requirements: ['OSHA 30 preferred', 'Site management experience'],
    saved: false,
    applied: false,
  },
]

export const DEMO_MESSAGES = [
  {
    id: 'msg-thread-1',
    with: 'Northwest Build Co.',
    withInitials: 'NB',
    lastMessage: 'Demo · Thanks for applying! We\'d like to schedule a quick call.',
    time: '10:24 AM',
    unread: 2,
    messages: [
      { id: 'm1', from: 'them', text: 'Demo · Hi Jordan, we saw your Work Passport and are impressed with your verified record.', time: '9:45 AM' },
      { id: 'm2', from: 'me', text: 'Thanks! I\'m very interested in the Finish Carpenter role.', time: '9:58 AM' },
      { id: 'm3', from: 'them', text: 'Demo · Thanks for applying! We\'d like to schedule a quick call.', time: '10:24 AM' },
    ],
  },
  {
    id: 'msg-thread-2',
    with: 'Pacific Structures',
    withInitials: 'PS',
    lastMessage: 'Demo · Your application is under review.',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm4', from: 'them', text: 'Demo · Your application is under review. We\'ll be in touch soon.', time: 'Yesterday' },
    ],
  },
]

export const DEMO_NOTIFICATIONS = [
  { id: 'notif-1', type: 'match', text: 'Demo · New job match: Finish Carpenter at Northwest Build Co.', time: '2h ago', read: false },
  { id: 'notif-2', type: 'message', text: 'Demo · Northwest Build Co. sent you a message.', time: '2h ago', read: false },
  { id: 'notif-3', type: 'evidence', text: 'Demo · Your evidence "Eastside Condo Project" is being reviewed.', time: '1d ago', read: true },
  { id: 'notif-4', type: 'score', text: 'Demo · Add 2 more verified records to unlock your Work Score.', time: '3d ago', read: true },
]

export const DEMO_CONTRACTOR = {
  id: 'demo-contractor-1',
  name: 'Pacific Structures',
  initials: 'PS',
  email: 'hire@demo.pacificstructures.com',
  role: 'contractor',
  activePostings: 3,
  applicants: 14,
}

export const TRADES = ['Carpentry', 'Electrical', 'Plumbing', 'HVAC', 'Painting', 'Masonry', 'Roofing', 'General Labor', 'Concrete', 'Welding']
export const SKILLS = ['Framing', 'Finish work', 'Blueprint reading', 'OSHA 10', 'Site safety', 'Estimating', 'Drywall', 'Tile work', 'Concrete forming', 'Equipment operation']
