import { ArrowRight, BadgeCheck, BriefcaseBusiness, Clock3, Gauge, HardHat, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function LandingPage() {
  return (
    <div className="marketing-page">
      <header className="marketing-header container">
        <Logo />
        <nav className="marketing-nav">
          <a href="#how">How It Works</a>
          <a href="#subs">For Subcontractors</a>
          <a href="#contractors">For Contractors</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="header-actions">
          <Link className="button button-ghost" to="/signin">Log In</Link>
          <Link className="button button-primary" to="/signup">Sign Up</Link>
        </div>
      </header>

      <section className="hero container">
        <div className="hero-copy">
          <span className="kicker">BLUEJOB WORK NETWORK</span>
          <h1>Where hard work<br/><span>truly pays off.</span></h1>
          <p>BlueJob gives proven subcontractors a stronger path to quality work and gives contractors a faster way to build the right subcontractor network.</p>
          <div className="hero-actions">
            <Link to="/signup" className="button button-primary button-lg">I Need Work</Link>
            <Link to="/signup" className="button button-outline button-lg">I Need Work Done</Link>
          </div>
          <div className="hero-metrics">
            <div><strong>Work Score</strong><span>Performance-backed reputation</span></div>
            <div><strong>Work Passport</strong><span>Skills, history and verification</span></div>
            <div><strong>Better Matching</strong><span>Budget, scope and qualification</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="construction-image-card">
            <div className="construction-silhouette">
              <div className="building-grid" />
              <div className="crane-line crane-line-one" />
              <div className="crane-line crane-line-two" />
            </div>
            <div className="floating-score-card">
              <span className="kicker">WORK SCORE</span>
              <strong>846</strong>
              <span className="verified-text"><BadgeCheck size={16}/> Excellent</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="trust-strip">
        <div className="container trust-grid">
          <div><Gauge/><strong>Build your Work Score</strong><span>Verified performance matters.</span></div>
          <div><Users/><strong>Grow your subcontractor network</strong><span>Keep strong people close.</span></div>
          <div><Clock3/><strong>Save time</strong><span>Set scope, schedule and budget first.</span></div>
          <div><ShieldCheck/><strong>Earn respect</strong><span>Great work builds stronger opportunity.</span></div>
        </div>
      </section>

      <section id="subs" className="split-section container">
        <article className="feature-panel">
          <HardHat size={34}/>
          <span className="kicker">FOR SUBCONTRACTORS</span>
          <h2>A stronger Work Score should lead to stronger opportunities.</h2>
          <p>Build a professional Work Passport around your skills, history, verified experience and completed work. Stop relying only on word of mouth to find your next opportunity.</p>
          <Link to="/signup">Build your Work Passport <ArrowRight size={16}/></Link>
        </article>
        <article id="contractors" className="feature-panel">
          <BriefcaseBusiness size={34}/>
          <span className="kicker">FOR CONTRACTORS</span>
          <h2>Grow your subcontractor list. Save your time.</h2>
          <p>Set the scope, schedule, requirements and budget you are prepared to work within. BlueJob helps surface subcontractors aligned with the opportunity instead of wasting everyone’s time on endless bidding.</p>
          <Link to="/signup">Start finding subcontractors <ArrowRight size={16}/></Link>
        </article>
      </section>

      <section id="pricing" className="pricing-section container">
        <div>
          <span className="kicker">FOUNDING MEMBERSHIP</span>
          <h2>$15.99 <small>/ month</small></h2>
          <p>Join BlueJob at founding-member pricing while the network grows.</p>
        </div>
        <Link to="/signup" className="button button-primary button-lg">Create Your Account</Link>
      </section>

      <footer className="footer container">
        <Logo compact />
        <span>Where hard work truly pays off.</span>
      </footer>
    </div>
  );
}
