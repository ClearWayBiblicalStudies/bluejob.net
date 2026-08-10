import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';

const steps=['Scope','Details','Budget','Requirements','Review'];
export default function PostJobPage(){
  const [step,setStep]=useState(0); const navigate=useNavigate();
  return <AppShell role="contractor"><div className="page-heading"><div><h1>Post a New Job</h1><p>Tell BlueJob exactly what you need.</p></div></div>
  <div className="wizard card"><div className="wizard-steps">{steps.map((s,i)=><div className={i<=step?'done':''} key={s}><b>{i+1}</b><span>{s}</span></div>)}</div>
  {step===0&&<div className="wizard-body"><span className="kicker">STEP 1</span><h2>Tell us about your project</h2><p>Provide details about the work you need completed.</p><label>Project Title<input defaultValue="Office Building Electrical"/></label><label>Project Description<textarea defaultValue="Electrical installation for a 3-story office building including power distribution, lighting and data cabling."/></label><label>Trade Category<select defaultValue="Electrical"><option>Electrical</option><option>Framing</option><option>Drywall</option><option>Concrete</option></select></label><label>Project Location<input defaultValue="Tampa, FL"/></label></div>}
  {step===1&&<div className="wizard-body"><span className="kicker">STEP 2</span><h2>Project details</h2><label>Start Date<input type="date"/></label><label>Duration<input placeholder="Example: 3 weeks"/></label><label>Workers / Crew Needed<input type="number" defaultValue="4"/></label></div>}
  {step===2&&<div className="wizard-body"><span className="kicker">STEP 3</span><h2>Set your budget</h2><p>Why waste time requesting bids if you already know the range you can approve?</p><div className="two-col"><label>Target Budget<input defaultValue="$48,000"/></label><label>Maximum Approved<input defaultValue="$55,000"/></label></div><div className="insight-box"><strong>BlueJob Budget Review</strong><p>This range appears competitive for the current scope and schedule. Market response will update after the job is posted.</p></div></div>}
  {step===3&&<div className="wizard-body"><span className="kicker">STEP 4</span><h2>Requirements</h2><label>Minimum Work Score<select><option>750+</option><option>800+</option><option>No minimum</option></select></label><label><input type="checkbox" defaultChecked/> Verified insurance required</label><label><input type="checkbox"/> License required</label></div>}
  {step===4&&<div className="wizard-body"><span className="kicker">REVIEW</span><h2>Ready to publish</h2><div className="review-box"><strong>Office Building Electrical</strong><span>Tampa, FL</span><span>$48,000–$55,000</span><span>Work Score 750+</span></div></div>}
  <div className="wizard-actions"><button className="button button-ghost" disabled={!step} onClick={()=>setStep(s=>s-1)}>Back</button><button className="button button-primary" onClick={()=>step===4?navigate('/app/jobs/1/bids'):setStep(s=>s+1)}>{step===4?'Publish Job':'Continue'}</button></div></div></AppShell>
}
