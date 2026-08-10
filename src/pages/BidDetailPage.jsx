import { BadgeCheck } from 'lucide-react';
import AppShell from '../components/AppShell';

const bidders=[
['Elite Electrical LLC',892,'$48,750','2h ago'],
['PowerLine Services',865,'$52,300','4h ago'],
['Bright Future Electric',842,'$49,800','6h ago'],
['VoltPro Solutions',820,'$55,000','8h ago'],
['Current Contractors',811,'$50,600','10h ago'],
['Wire Works Inc.',798,'$54,200','12h ago'],
['SafeVolt Electric',776,'$53,900','14h ago'],
];
export default function BidDetailPage(){return <AppShell role="contractor"><div className="page-heading"><div><a className="back-link">← Back to Projects</a><h1>Office Building Electrical</h1><p>Tampa, FL</p></div><span className="open-pill">● Bidding Open · closes in 2d 14h</span></div>
<div className="tabs"><button>Overview</button><button className="active">Bids (7)</button><button>Scope</button><button>Details</button><button>Activity</button></div>
<div className="bid-layout"><section className="card bid-table"><div className="section-heading"><div><h2>7 Subcontractors Bidding</h2><p>Review and compare qualified subcontractors.</p></div></div><div className="table-head"><span>Subcontractor</span><span>Work Score</span><span>Bid Amount</span><span>Submitted</span></div>{bidders.map(([name,score,bid,time])=><div className="bid-row" key={name}><span><div className="avatar avatar-small">{name[0]}</div><div><strong>{name}</strong><small className="green-text"><BadgeCheck size={12}/> Verified</small></div></span><strong>{score}</strong><strong>{bid}</strong><span>{time}</span></div>)}<button className="button button-primary button-full">Compare Bids</button></section>
<aside className="card insight-card"><h3>Bidding Insights</h3><div><strong>7</strong><span>Total Bids</span></div><div><strong>5</strong><span>Verified Subs</span></div><div><strong>2</strong><span>Work Score 800+</span></div><div><strong>$48.7K–$55K</strong><span>Bid Range</span></div><div><strong>$51.6K</strong><span>Average Bid</span></div></aside></div></AppShell>}
