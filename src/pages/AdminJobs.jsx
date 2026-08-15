import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
export default function AdminJobs() {
  const [jobs, setJobs] = useState([]); const [error, setError] = useState('');
  const [form, setForm] = useState({ title:'', description:'', location:'', budget:'' });
  const load = () => api.adminJobs().then(({ jobs: value }) => setJobs(value)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const create = async (event) => { event.preventDefault(); try { await api.createAdminJob({ ...form, budget: Number(form.budget) }); setForm({ title:'',description:'',location:'',budget:'' }); load(); } catch (e) { setError(e.message); } };
  return <AppShell role="admin"><div className="page-heading"><div><h1>BlueJob Admin — Real Work</h1><p>Publish and remove real marketplace work.</p></div></div><form className="bj-admin-form card" onSubmit={create}>{['title','location','budget'].map((key) => <input key={key} type={key === 'budget' ? 'number' : 'text'} placeholder={key === 'budget' ? 'Required budget' : key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required />)}<textarea placeholder="Real scope" value={form.description} onChange={(e) => setForm({ ...form, description:e.target.value })} required/><button className="button button-primary">Publish Real Job</button></form>{error && <p role="alert">{error}</p>}<section className="jobs-grid">{jobs.map((job) => <article className="card job-card" key={job.id}><h3>{job.title}</h3><p>{job.location}</p><strong>${Number(job.budget).toLocaleString()}</strong><button className="button button-outline" onClick={async () => { await api.deleteAdminJob(job.id); load(); }}>Delete</button></article>)}</section></AppShell>;
}
