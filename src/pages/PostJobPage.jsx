import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';

const steps = ['Scope', 'Details', 'Budget', 'Requirements', 'Review'];

export default function PostJobPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [job, setJob] = useState({ title: '', description: '', trade: 'Electrical', location: '', budget_min: '' });
  const navigate = useNavigate();
  const update = (event) => setJob({ ...job, [event.target.name]: event.target.value });
  const publish = async () => {
    if (!Number(job.budget_min) || Number(job.budget_min) <= 0) return setError('A positive budget is required.');
    try { const { job: created } = await api.createJob({ ...job, budget: job.budget_min }); navigate(`/app/jobs/${created.id}/bids`); }
    catch (err) { setError(err.message); }
  };
  return <AppShell role="contractor"><div className="page-heading"><div><h1>Post a New Job</h1><p>Tell BlueJob exactly what you need.</p></div></div>
    <div className="wizard card"><div className="wizard-steps">{steps.map((name, index) => <div className={index <= step ? 'done' : ''} key={name}><b>{index + 1}</b><span>{name}</span></div>)}</div>
      {step === 0 && <div className="wizard-body"><span className="kicker">STEP 1</span><h2>Tell us about your project</h2><label>Project Title<input name="title" value={job.title} onChange={update} required /></label><label>Project Description<textarea name="description" value={job.description} onChange={update} required /></label><label>Trade Category<select name="trade" value={job.trade} onChange={update}><option>Electrical</option><option>Framing</option><option>Drywall</option><option>Concrete</option></select></label><label>Project Location<input name="location" value={job.location} onChange={update} required /></label></div>}
      {step === 1 && <div className="wizard-body"><span className="kicker">STEP 2</span><h2>Project details</h2><label>Start Date<input name="start_date" type="date" onChange={update} /></label><label>Duration<input name="duration" placeholder="Example: 3 weeks" onChange={update} /></label></div>}
      {step === 2 && <div className="wizard-body"><span className="kicker">STEP 3</span><h2>Set your budget</h2><div className="two-col"><label>Target Budget<input name="budget_min" type="number" value={job.budget_min} onChange={update} /></label><label>Maximum Approved<input name="budget_max" type="number" value={job.budget_max} onChange={update} /></label></div></div>}
      {step === 3 && <div className="wizard-body"><span className="kicker">STEP 4</span><h2>Requirements</h2><label>Minimum Work Score<select name="minimum_score" onChange={update}><option value="750">750+</option><option value="800">800+</option><option value="">No minimum</option></select></label></div>}
      {step === 4 && <div className="wizard-body"><span className="kicker">REVIEW</span><h2>Ready to publish</h2><div className="review-box"><strong>{job.title}</strong><span>{job.location}</span><span>${job.budget_min}–${job.budget_max}</span></div></div>}
      <div className="wizard-actions"><button className="button button-ghost" disabled={!step} onClick={() => setStep((value) => value - 1)}>Back</button><button className="button button-primary" onClick={() => step === 4 ? publish() : setStep((value) => value + 1)}>{step === 4 ? 'Publish Job' : 'Continue'}</button>{error && <p role="alert">{error}</p>}</div>
    </div></AppShell>;
}
