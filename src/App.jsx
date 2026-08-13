import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function App() {
  const [authMode, setAuthMode] = useState(null);
  const [message, setMessage] = useState("");

  async function submitAuth(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const endpoint = authMode === "signup" ? "/api/auth/register"
      : authMode === "reset" ? "/api/auth/forgot-password"
        : "/api/auth/login";
    const payload = authMode === "signup"
      ? { displayName: form.get("displayName"), email: form.get("email"), password: form.get("password") }
      : authMode === "reset"
        ? { email: form.get("email") }
        : { email: form.get("email"), password: form.get("password") };
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    setMessage(response.ok
      ? authMode === "reset" ? "If an account exists, password reset instructions have been sent." : "You are signed in."
      : body.error || "Request failed.");
  }

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
          <button type="button" className="loginButton" onClick={() => { setAuthMode("login"); setMessage(""); }}>Log in</button>
          <button type="button" className="primaryButton" onClick={() => { setAuthMode("signup"); setMessage(""); }}>Join BlueJob</button>
        </div>
      </header>
      {authMode && (
        <section className="features">
          <form className="feature" onSubmit={submitAuth}>
            <h3>{authMode === "signup" ? "Join BlueJob" : authMode === "reset" ? "Reset password" : "Log in"}</h3>
            {authMode === "signup" && <input name="displayName" placeholder="Name" required />}
            <input name="email" type="email" placeholder="Email" required />
            {authMode !== "reset" && <input name="password" type="password" minLength="12" placeholder="Password" required />}
            <button type="submit" className="primaryButton">{authMode === "reset" ? "Send reset link" : "Continue"}</button>
            {authMode === "login" && <button type="button" className="loginButton" onClick={() => { setAuthMode("reset"); setMessage(""); }}>Forgot password?</button>}
            <button type="button" className="loginButton" onClick={() => setAuthMode(null)}>Cancel</button>
            {message && <p>{message}</p>}
          </form>
        </section>
      )}

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
              <button type="button" className="primaryButton large" onClick={() => { setAuthMode("signup"); setMessage(""); }}>
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
