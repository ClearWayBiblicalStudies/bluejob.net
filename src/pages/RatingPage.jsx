import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
const questions = [['showedUpAsAgreed','Showed up as agreed'],['completedAgreedScope','Completed agreed scope'],['qualityRightFirstTime','Quality right the first time'],['stayedOnSchedule','Stayed on schedule'],['communicatedEarly','Communicated early'],['handledChangesFairly','Handled changes fairly'],['respectedAgreedBudget','Respected agreed budget'],['professionalAndReliable','Professional and reliable'],['trustWithLargerJob','Trust with a larger job'],['workTogetherAgain','Would work together again']];
export default function RatingPage() {
  const { jobId } = useParams(); const navigate = useNavigate(); const [values, setValues] = useState(Object.fromEntries(questions.map(([key]) => [key, 5]))); const [error, setError] = useState('');
  const submit = async (event) => { event.preventDefault(); try { await api.rateJob(jobId, values); navigate('/app/worker'); } catch (e) { setError(e.message); } };
  return <AppShell><div className="page-heading"><div><h1>Required Work Score Rating</h1><p>Both sides must complete this verified evaluation before starting new marketplace activity.</p></div></div><form className="card bj-admin-form" onSubmit={submit}>{questions.map(([key, label]) => <label key={key}>{label}<select value={values[key]} onChange={(e) => setValues({ ...values, [key]: Number(e.target.value) })}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>)}<label>Private note<textarea onChange={(e) => setValues({ ...values, privateNote:e.target.value })}/></label><button className="button button-primary">Submit rating</button>{error && <p role="alert">{error}</p>}</form></AppShell>;
}
