import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { readPassport, savePassport } from '../lib/passport';

export default function PassportEditPage() {
  const navigate = useNavigate();
  const [passport, setPassport] = useState(readPassport);
  const [history, setHistory] = useState({ title: '', company: '', dates: '', description: '' });
  const update = (event) => setPassport({ ...passport, [event.target.name]: event.target.value });
  const addHistory = () => {
    if (!history.title || !history.company) return;
    setPassport({ ...passport, history: [...passport.history, history] });
    setHistory({ title: '', company: '', dates: '', description: '' });
  };
  const submit = (event) => { event.preventDefault(); savePassport(passport); navigate('/app/passport'); };

  return <AppShell role="worker"><div className="page-heading"><div><span className="kicker">WORK PASSPORT</span><h1>Edit your professional record</h1><p>Complete the details companies use to find the right professional.</p></div><Link to="/app/passport" className="back-link">← Back to Passport</Link></div>
    <form className="card passport-form" onSubmit={submit}><section><h2>Professional identity</h2><div className="two-col"><label>Full name<input name="name" value={passport.name} onChange={update} required /></label><label>Primary trade<input name="trade" value={passport.trade} onChange={update} placeholder="e.g. Commercial Electrician" required /></label><label>Location<input name="location" value={passport.location} onChange={update} placeholder="City, State" /></label><label>Travel radius (miles)<input name="travelRadius" value={passport.travelRadius} onChange={update} type="number" min="0" /></label><label>Worker type<select name="workerType" value={passport.workerType} onChange={update}><option>Individual</option><option>Crew</option><option>Subcontracting company</option></select></label><label>Crew size<input name="crewSize" value={passport.crewSize} onChange={update} type="number" min="1" /></label><label>Years of experience<input name="yearsExperience" value={passport.yearsExperience} onChange={update} type="number" min="0" /></label><label>Availability<select name="availability" value={passport.availability} onChange={update}><option>Available now</option><option>Available within 2 weeks</option><option>Booked</option></select></label></div></section>
      <section><h2>Skills, tools & transportation</h2><label>Skills <span className="field-help">Separate skills with commas</span><input name="skills" value={passport.skills} onChange={update} placeholder="Metal framing, drywall, finish work" /></label><div className="two-col"><label>Tools<input name="tools" value={passport.tools} onChange={update} placeholder="Tools and equipment you bring" /></label><label>Transportation<input name="transportation" value={passport.transportation} onChange={update} placeholder="Truck, trailer, fleet..." /></label></div></section>
      <section><div className="section-heading"><div><h2>Work history</h2><p>Add résumé-style experience. Proof is submitted separately in Verification Center.</p></div></div><div className="two-col"><label>Role / project title<input value={history.title} onChange={(e) => setHistory({ ...history, title: e.target.value })} /></label><label>Company<input value={history.company} onChange={(e) => setHistory({ ...history, company: e.target.value })} /></label><label>Dates<input value={history.dates} onChange={(e) => setHistory({ ...history, dates: e.target.value })} placeholder="2021–Present" /></label><label>Description<input value={history.description} onChange={(e) => setHistory({ ...history, description: e.target.value })} /></label></div><button type="button" className="button button-outline" onClick={addHistory}>+ Add work history</button>{passport.history.map((job) => <div className="history-row compact" key={`${job.company}-${job.title}`}><strong>{job.title}</strong><span>{job.company} · {job.dates}</span></div>)}</section>
      <div className="wizard-actions"><Link to="/app/passport" className="button button-ghost">Cancel</Link><button className="button button-primary">Save Passport</button></div>
    </form></AppShell>;
}
