import { ArrowRight, Building2, HardHat } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';

export default function ChoosePathPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preferredRole = searchParams.get('role');
  const heading = preferredRole === 'contractor'
    ? 'Build Your Contractor Profile'
    : preferredRole === 'worker'
      ? 'Build Your Work Profile'
      : 'Choose Your Path';
  return (
    <div className="choose-page">
      <header><Logo /></header>
      <section className="choose-content">
        <span className="kicker">ACCOUNT SETUP</span>
        <h1>{heading}</h1>
        <p>How will you use BlueJob? You can add additional roles later.</p>
        <div className="choice-grid">
          <button onClick={() => navigate('/app/worker')} className="choice-card choice-card-blue">
            <HardHat size={48}/><h2>I Need Work</h2><strong>Subcontractor / Skilled Professional / Crew</strong>
            <p>Build My Work Score through verified completed work and get matched with better opportunities.</p><ArrowRight/>
          </button>
          <button onClick={() => navigate('/app/contractor')} className="choice-card choice-card-green">
            <Building2 size={48}/><h2>I Need Work Done</h2><strong>Contractor / GC / Company</strong>
            <p>Post work, grow your subcontractor network and manage projects from one place.</p><ArrowRight/>
          </button>
        </div>
      </section>
    </div>
  );
}
