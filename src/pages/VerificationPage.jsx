import { FileCheck2, LockKeyhole, Plus, ShieldCheck, Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
const types = ['W-2 / 1099 record', 'Pay stub', 'Contract or invoice', 'Payment record', 'Employer confirmation', 'License or certification', 'Insurance', 'Project documentation'];
export default function VerificationPage() {
  const [evidence, setEvidence] = useState([]); const [type, setType] = useState(types[0]); const [file, setFile] = useState(null);
  useEffect(() => { api.evidence().then(({ evidence: items }) => setEvidence(items)).catch(() => {}); }, []);
  const submit = async (event) => { event.preventDefault(); if (!file) return; const body = new FormData(); body.append('type', type); body.append('file', file); const result = await api.uploadEvidence(body); setEvidence((items) => [result.evidence, ...items]); event.target.reset(); setFile(null); };
  return <AppShell role="worker"><div className="page-heading"><div><span className="kicker">PRIVATE DOCUMENTS</span><h1>Verification Center</h1><p>Submit proof privately. Verified results appear on your public Work Passport.</p></div><Link to="/app/passport" className="back-link">View public Passport →</Link></div>
    <section className="verification-banner card"><LockKeyhole size={24}/><div><strong>Your documents stay private</strong><span>BlueJob never publishes your W-2s, pay stubs, contracts, or other evidence on your public Passport.</span></div></section>
    <div className="verification-layout"><section className="card evidence-upload"><div className="section-heading"><div><h2>Submit evidence</h2><p>Submissions are scanned for malware, then queued for verification review.</p></div><ShieldCheck className="green-text"/></div><form onSubmit={submit}><label>Evidence type<select value={type} onChange={(e) => setType(e.target.value)}>{types.map((item) => <option key={item}>{item}</option>)}</select></label><label>Choose document<input type="file" onChange={(e) => setFile(e.target.files[0] || null)} required /></label><button className="button button-primary"><Plus size={15}/> Submit for review</button></form></section>
      <section className="card evidence-list"><div className="section-heading"><h2>Your submissions</h2><span className="open-pill">{evidence.length} total</span></div>{evidence.length ? evidence.map((item) => <div className="evidence-row" key={item.id}>{item.status === 'Verified' ? <FileCheck2 className="green-text"/> : <Clock3 className="pending-icon"/>}<div><strong>{item.type}</strong><span>{item.file}</span></div><b className={item.status === 'Verified' ? 'green-text' : 'pending-text'}>{item.status}</b></div>) : <div className="empty-state"><Clock3 size={24}/><strong>No evidence submitted</strong><span>Upload records to begin building your Work Score.</span></div>}</section></div>
  </AppShell>;
}
