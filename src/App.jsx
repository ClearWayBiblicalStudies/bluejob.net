import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

export default function App() {
  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="/">
          <img src="/bluejob-logo.png" alt="BlueJob" />
        </a>
        <nav>
          <a href="#workers">Workers</a>
          <a href="#companies">Companies</a>
          <a href="#workscore">Work Score</a>
        </nav>
        <div className="navActions">
          <button type="button" className="loginButton">Log in</button>
          <button type="button" className="primaryButton">Join BlueJob</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="heroContent">
            <div className="eyebrow">
              <BadgeCheck size={17} />
              The verified network for real work
            </div>
            <h1>
              Your work should
              <span> speak for itself.</span>
            </h1>
            <p className="heroDescription">
              BlueJob connects skilled workers, contractors and companies
              through verified work history, reputation and opportunity.
            </p>
            <div className="heroButtons">
              <button type="button" className="primaryButton large">
                Build your profile
                <ArrowRight size={18} />
              </button>
              <button type="button" className="secondaryButton large">Find workers</button>
            </div>
            <div className="trustLine">
              <ShieldCheck size={19} />
              Verified work. Verified people. Real reputation.
            </div>
          </div>

          <div className="scoreCard" id="workscore">
            <div className="scoreHeader">
              <div>
                <span className="smallLabel">BLUEJOB</span>
                <h3>Work Score</h3>
              </div>
              <div className="verified">
                <BadgeCheck size={17} />
                Verified
              </div>
            </div>
            <div className="score">842</div>
            <div className="scoreLabel">EXCELLENT WORK REPUTATION</div>
            <div className="scoreBar">
              <div className="scoreProgress"></div>
            </div>
            <div className="scoreStats">
              <div>
                <strong>48</strong>
                <span>Verified Jobs</span>
              </div>
              <div>
                <strong>4.9</strong>
                <span>Work Rating</span>
              </div>
              <div>
                <strong>97%</strong>
                <span>Reliability</span>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="feature" id="workers">
            <div className="iconBox"><Users /></div>
            <h3>Build Your Work Identity</h3>
            <p>
              Skills, experience, completed jobs and verified performance
              become part of one professional work profile.
            </p>
          </div>
          <div className="feature" id="companies">
            <div className="iconBox"><BriefcaseBusiness /></div>
            <h3>Find Proven Workers</h3>
            <p>
              Companies can discover workers based on actual experience,
              reliability and verified work history.
            </p>
          </div>
          <div className="feature">
            <div className="iconBox"><Star /></div>
            <h3>Earn Your Work Score</h3>
            <p>
              Build a portable reputation that gets stronger every time
              verified work is completed.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
