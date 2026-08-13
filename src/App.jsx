import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Menu, ShieldCheck, Users, X } from "lucide-react";

const legalPages = {
  "/privacy": ["Privacy Policy", "BlueJob collects account, profile, work-history, verification, and reputation information needed to operate the platform. You can request access to or correction of your account information through account support."],
  "/terms": ["Terms of Service", "BlueJob provides work-identity and discovery tools. Workers and companies remain responsible for their own work decisions, agreements, permits, insurance, and legal obligations."],
  "/cookies": ["Cookie Policy", "BlueJob uses essential cookies to keep accounts secure and preserve authenticated sessions. Blocking essential cookies can prevent access to the application."],
  "/community-guidelines": ["Community Guidelines", "Use accurate professional information, respect other users, and do not falsify work history, ratings, verification evidence, or Work Score information."],
  "/contact": ["Contact BlueJob", "Use the support options in your BlueJob account for questions about your account, privacy, verification, or the platform."],
  "/about": ["About BlueJob", "BlueJob helps workers, contractors, subcontractors, and companies build better work connections through work history and professional reputation."],
};

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: { "content-type": "application/json", ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function go(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function Brand() {
  return <a className="brand" href="/" onClick={(event) => { event.preventDefault(); go("/"); }}><span className="brandMark"><img src="/bluejob-logo.png" alt="BlueJob" /></span></a>;
}

function Header({ user, setUser }) {
  const [open, setOpen] = useState(false);
  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    go("/");
  }
  const navigate = (path) => { setOpen(false); go(path); };
  return <header className="navbar">
    <Brand />
    <button className="menuButton" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={open ? "mainNav open" : "mainNav"}>
      <a href="/workers" onClick={(e) => { e.preventDefault(); navigate("/workers"); }}>Find workers</a>
      {user && <a href={user.roles.includes("ADMIN") ? "/admin" : user.roles.includes("CONTRACTOR") ? "/company" : "/profile"} onClick={(e) => { e.preventDefault(); navigate(user.roles.includes("ADMIN") ? "/admin" : user.roles.includes("CONTRACTOR") ? "/company" : "/profile"); }}>Dashboard</a>}
    </nav>
    <div className="navActions">
      {user ? <><span className="userName">Hi, {user.displayName}</span><button className="loginButton" onClick={logout}>Log out</button></> : <><a className="loginButton" href="/login" onClick={(e) => { e.preventDefault(); go("/login"); }}>Log in</a><a className="primaryButton joinButton" href="/signup" onClick={(e) => { e.preventDefault(); go("/signup"); }}>Join BlueJob</a></>}
    </div>
  </header>;
}

function Footer() {
  return <footer className="footer"><div className="footerInner"><div><Brand /><p>© 2026 BlueJob. All rights reserved.</p></div><nav className="footerLinks">{Object.entries(legalPages).map(([path, [title]]) => <a href={path} key={path} onClick={(e) => { e.preventDefault(); go(path); }}>{title}</a>)}</nav></div></footer>;
}

function Home({ user }) {
  const profilePath = user ? (user.roles.includes("CONTRACTOR") ? "/company" : "/profile") : "/signup";
  return <main><section className="hero"><div className="heroContent"><div className="eyebrow"><BadgeCheck size={17} />The verified network for real work</div><h1>Your work should<span> speak for itself.</span></h1><p className="heroDescription">BlueJob connects skilled workers, contractors and companies through verified work history, reputation and opportunity.</p><div className="heroButtons"><a className="primaryButton large" href={profilePath} onClick={(e) => { e.preventDefault(); go(profilePath); }}>Build your profile <ArrowRight size={18} /></a><a className="secondaryButton large" href="/workers" onClick={(e) => { e.preventDefault(); go("/workers"); }}>Find workers</a></div><div className="trustLine"><ShieldCheck size={19} />Verified work. Verified people. Real reputation.</div></div><div className="scoreCard"><div className="scoreHeader"><div><h3>BlueJob Work Score</h3></div><div className="verified"><BadgeCheck size={17} />Evidence based</div></div><p className="scoreMessage">Your Work Score is built from verified work and ratings—not a landing-page promise.</p></div></section><section className="features"><div className="feature"><Users /><h3>Build Your Work Identity</h3><p>Create a searchable profile with your trade, skills, experience, and work history.</p></div><div className="feature"><BriefcaseBusiness /><h3>Find Proven Workers</h3><p>Companies can search real worker profiles by trade, skill, and service area.</p></div><div className="feature"><BadgeCheck /><h3>Earn Your Work Score</h3><p>Completed-work feedback contributes to a portable professional reputation.</p></div></section></main>;
}

function AuthPage({ mode, setUser }) {
  const [accountType, setAccountType] = useState("WORKER");
  const [form, setForm] = useState({ displayName: "", email: "", password: "", companyName: "" });
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setError("");
    try {
      const data = await api(`/auth/${mode === "signup" ? "register" : "login"}`, { method: "POST", body: mode === "signup" ? { ...form, accountType } : { email: form.email, password: form.password } });
      const user = data.user || { id: data.id, email: data.email, displayName: data.display_name, roles: data.roles || [accountType] };
      setUser(user);
      go(user.roles.includes("ADMIN") ? "/admin" : user.roles.includes("CONTRACTOR") ? "/company" : "/profile");
    } catch (caught) { setError(caught.message); }
  }
  return <main className="formPage"><section className="formCard"><p className="legalEyebrow">BLUEJOB ACCOUNT</p><h1>{mode === "signup" ? "Join BlueJob" : "Welcome back"}</h1><p>{mode === "signup" ? "Create a work identity or company account." : "Log in to manage your BlueJob account."}</p><form onSubmit={submit}>{mode === "signup" && <><label>Name<input required maxLength="120" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></label><fieldset><legend>Account type</legend><label><input type="radio" checked={accountType === "WORKER"} onChange={() => setAccountType("WORKER")} /> Worker</label><label><input type="radio" checked={accountType === "CONTRACTOR"} onChange={() => setAccountType("CONTRACTOR")} /> Company / contractor</label></fieldset>{accountType === "CONTRACTOR" && <label>Company name<input required maxLength="160" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></label>}</>}<label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input required minLength="12" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>{error && <p className="formError">{error}</p>}<button className="primaryButton" type="submit">{mode === "signup" ? "Create account" : "Log in"}</button></form><p>{mode === "signup" ? <>Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); go("/login"); }}>Log in</a></> : <>Forgot your password? <a href="/forgot-password" onClick={(e) => { e.preventDefault(); go("/forgot-password"); }}>Set a new password</a></>}</p></section></main>;
}

function PasswordReset({ setUser }) {
  const token = new URLSearchParams(window.location.search).get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setError("");
    try {
      if (token) {
        const data = await api("/auth/password-reset/confirm", { method: "POST", body: { token, password } });
        setUser(data.user);
        go(data.user.roles.includes("ADMIN") ? "/admin" : data.user.roles.includes("CONTRACTOR") ? "/company" : "/profile");
      } else {
        await api("/auth/password-reset/request", { method: "POST", body: { email } });
        setMessage("If an account exists, a password setup link has been sent.");
      }
    } catch (caught) { setError(caught.message); }
  }
  return <main className="formPage"><section className="formCard"><p className="legalEyebrow">BLUEJOB ACCOUNT</p><h1>{token ? "Set your password" : "Reset your password"}</h1><form onSubmit={submit}>{token ? <label>New password<input required minLength="12" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label> : <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>}{error && <p className="formError">{error}</p>}{message && <p className="formMessage">{message}</p>}<button className="primaryButton">{token ? "Set password" : "Email password link"}</button></form></section></main>;
}

function Admin({ user }) {
  const [summary, setSummary] = useState(null); const [error, setError] = useState("");
  useEffect(() => { if (user?.roles.includes("ADMIN")) api("/admin/dashboard").then(setSummary).catch((caught) => setError(caught.message)); }, [user]);
  if (!user) return <AuthRequired />;
  if (!user.roles.includes("ADMIN")) return <main className="appPage"><h1>Admin access required</h1><p className="pageIntro">This dashboard is only available to BlueJob administrators.</p></main>;
  return <main className="appPage"><p className="legalEyebrow">BLUEJOB ADMIN</p><h1>Admin dashboard</h1>{error && <p className="formError">{error}</p>}{summary && <div className="dashboardGrid"><section className="formCard"><h2>Platform users</h2><strong className="profileScore">{summary.users}</strong></section><section className="formCard"><h2>Pending verification</h2><strong className="profileScore">{summary.pendingEvidence}</strong></section><section className="formCard"><h2>Open disputes</h2><strong className="profileScore">{summary.openDisputes}</strong></section></div>}</main>;
}

function Profile({ user }) {
  const [profile, setProfile] = useState({ trade: "", skills: "", yearsExperience: "", serviceArea: "", profileSummary: "" });
  const [history, setHistory] = useState({ title: "", details: "", startedOn: "", endedOn: "" });
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => { api("/passport").then((data) => { const p = data.passport || {}; setProfile({ trade: p.trade || "", skills: (p.skills || []).join(", "), yearsExperience: p.years_experience || "", serviceArea: p.service_area || "", profileSummary: p.profile_summary || "" }); setItems(data.workHistory || []); setScore(data.score); }).catch((e) => setMessage(e.message)); }, []);
  async function save(event) { event.preventDefault(); try { await api("/passport", { method: "PUT", body: { ...profile, skills: profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean), yearsExperience: Number(profile.yearsExperience) || null } }); setMessage("Profile saved."); } catch (e) { setMessage(e.message); } }
  async function addHistory(event) { event.preventDefault(); try { const item = await api("/passport/history", { method: "POST", body: history }); setItems([item, ...items]); setHistory({ title: "", details: "", startedOn: "", endedOn: "" }); setMessage("Work history added."); } catch (e) { setMessage(e.message); } }
  if (!user) return <AuthRequired />;
  return <main className="appPage"><p className="legalEyebrow">WORKER PROFILE</p><h1>Build your work identity</h1><p className="pageIntro">Your profile is saved to BlueJob and can be found by companies.</p>{message && <p className="formMessage">{message}</p>}<div className="dashboardGrid"><form className="formCard" onSubmit={save}><h2>Professional profile</h2><label>Trade<input value={profile.trade} onChange={(e) => setProfile({ ...profile, trade: e.target.value })} /></label><label>Skills (comma separated)<input value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} /></label><label>Service area<input value={profile.serviceArea} onChange={(e) => setProfile({ ...profile, serviceArea: e.target.value })} /></label><label>Years of experience<input min="0" type="number" value={profile.yearsExperience} onChange={(e) => setProfile({ ...profile, yearsExperience: e.target.value })} /></label><label>About your work<textarea value={profile.profileSummary} onChange={(e) => setProfile({ ...profile, profileSummary: e.target.value })} /></label><button className="primaryButton">Save profile</button></form><aside className="scoreCard"><h2>Work Score</h2><strong className="profileScore">{score?.score ?? "—"}</strong><p>{score?.status === "VERIFIED" ? "Verified from completed-work feedback." : "Your score will build as verified feedback becomes available."}</p></aside></div><section className="historySection"><h2>Work history</h2><form className="historyForm" onSubmit={addHistory}><label>Role or project<input required value={history.title} onChange={(e) => setHistory({ ...history, title: e.target.value })} /></label><label>Details<textarea value={history.details} onChange={(e) => setHistory({ ...history, details: e.target.value })} /></label><label>Start<input type="date" value={history.startedOn} onChange={(e) => setHistory({ ...history, startedOn: e.target.value })} /></label><label>End<input type="date" value={history.endedOn} onChange={(e) => setHistory({ ...history, endedOn: e.target.value })} /></label><button className="secondaryButton">Add history</button></form>{items.map((item) => <article className="historyItem" key={item.id}><strong>{item.title}</strong><p>{item.details}</p><span>{item.started_on || "Date not added"} – {item.ended_on || "Present"} · {item.status}</span></article>)}</section></main>;
}

function Workers({ user, workerId }) {
  const [query, setQuery] = useState({ q: "", trade: "", location: "" }); const [workers, setWorkers] = useState([]); const [selected, setSelected] = useState(null); const [error, setError] = useState("");
  useEffect(() => { if (user && !workerId) search(); if (user && workerId) api(`/workers/${workerId}`).then(setSelected).catch((e) => setError(e.message)); }, [user, workerId]);
  async function search(event) { event?.preventDefault(); try { const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value)); setWorkers((await api(`/workers?${params}`)).workers); } catch (e) { setError(e.message); } }
  if (!user) return <AuthRequired />;
  if (workerId) return <main className="appPage">{error ? <p className="formError">{error}</p> : selected && <><a href="/workers" onClick={(e) => { e.preventDefault(); go("/workers"); }}>← Back to directory</a><p className="legalEyebrow">WORKER PROFILE</p><h1>{selected.worker.display_name}</h1><p className="pageIntro">{selected.worker.trade} · {selected.worker.service_area || "Service area not listed"}</p><div className="dashboardGrid"><section className="formCard"><h2>Professional information</h2><p>{selected.worker.profile_summary || "No summary provided."}</p><p><strong>Skills:</strong> {(selected.worker.skills || []).join(", ") || "Not listed"}</p><p><strong>Experience:</strong> {selected.worker.years_experience ?? "Not listed"} years</p><p><strong>Verification:</strong> {selected.worker.verification_status}</p></section><aside className="scoreCard"><h2>Work Score</h2><strong className="profileScore">{selected.worker.score ?? "—"}</strong><p>Rating: {selected.worker.rating ?? "Not yet rated"} · Reliability: {selected.worker.reliability ?? "Not yet rated"}</p></aside></div><section className="historySection"><h2>Work history</h2>{selected.workHistory.map((item) => <article className="historyItem" key={item.id}><strong>{item.title}</strong><p>{item.details}</p><span>{item.started_on || "Date not added"} – {item.ended_on || "Present"} · {item.status}</span></article>)}</section></>}</main>;
  return <main className="appPage"><p className="legalEyebrow">WORKER DIRECTORY</p><h1>Find proven workers</h1><form className="searchForm" onSubmit={search}><input placeholder="Name, trade, or skill" value={query.q} onChange={(e) => setQuery({ ...query, q: e.target.value })} /><input placeholder="Trade" value={query.trade} onChange={(e) => setQuery({ ...query, trade: e.target.value })} /><input placeholder="Location" value={query.location} onChange={(e) => setQuery({ ...query, location: e.target.value })} /><button className="primaryButton">Search</button></form>{error && <p className="formError">{error}</p>}<div className="workerGrid">{workers.map((worker) => <a className="workerCard" href={`/workers/${worker.id}`} key={worker.id} onClick={(e) => { e.preventDefault(); go(`/workers/${worker.id}`); }}><h2>{worker.display_name}</h2><p>{worker.trade || "Trade not listed"} · {worker.service_area || "Location not listed"}</p><p>{(worker.skills || []).join(" · ")}</p><span>{worker.verification_status} · Score {worker.score ?? "building"} · {worker.work_history_count} work-history entries</span></a>)}</div>{!workers.length && <p className="pageIntro">No worker profiles match yet.</p>}</main>;
}

function Company({ user }) {
  const [name, setName] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => { if (user) api("/company").then((data) => setName(data.company?.name || "")).catch((e) => setMessage(e.message)); }, [user]);
  if (!user) return <AuthRequired />;
  if (!user.roles.includes("CONTRACTOR")) return <main className="appPage"><h1>Company dashboard</h1><p className="pageIntro">This dashboard is available to company and contractor accounts.</p></main>;
  async function save(event) { event.preventDefault(); try { const data = await api("/company", { method: "PUT", body: { name } }); setName(data.company.name); setMessage("Company profile saved."); } catch (e) { setMessage(e.message); } }
  return <main className="appPage"><p className="legalEyebrow">COMPANY / CONTRACTOR</p><h1>Company dashboard</h1><p className="pageIntro">Maintain your company profile and search the BlueJob worker directory.</p><form className="formCard" onSubmit={save}><label>Company name<input required value={name} onChange={(e) => setName(e.target.value)} /></label><button className="primaryButton">Save company</button>{message && <p className="formMessage">{message}</p>}</form><a className="primaryButton" href="/workers" onClick={(e) => { e.preventDefault(); go("/workers"); }}>Find workers <ArrowRight size={18} /></a></main>;
}

function AuthRequired() { return <main className="formPage"><section className="formCard"><h1>Log in to continue</h1><p>BlueJob profiles and the worker directory are available to authenticated accounts.</p><a className="primaryButton" href="/login" onClick={(e) => { e.preventDefault(); go("/login"); }}>Log in</a></section></main>; }

function Legal({ page }) { return <main className="legalPage"><p className="legalEyebrow">BLUEJOB</p><h1>{page[0]}</h1><p className="legalIntro">{page[1]}</p></main>; }

export default function App() {
  const [path, setPath] = useState(window.location.pathname); const [user, setUser] = useState(null);
  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  useEffect(() => { api("/me").then(setUser).catch(() => setUser(null)); }, []);
  const workerId = path.match(/^\/workers\/([0-9a-f-]{36})$/i)?.[1];
  const content = legalPages[path] ? <Legal page={legalPages[path]} /> : path === "/signup" ? <AuthPage mode="signup" setUser={setUser} /> : path === "/login" ? <AuthPage mode="login" setUser={setUser} /> : path === "/forgot-password" || path === "/reset-password" ? <PasswordReset setUser={setUser} /> : path === "/admin" ? <Admin user={user} /> : path === "/profile" ? <Profile user={user} /> : path === "/company" ? <Company user={user} /> : path === "/workers" || workerId ? <Workers user={user} workerId={workerId} /> : <Home user={user} />;
  return <div className="app"><Header user={user} setUser={setUser} />{content}<Footer /></div>;
}
