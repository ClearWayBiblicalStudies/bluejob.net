import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBlueJob } from "../context/BlueJobContext";

export function SignUpPage() {
  const navigate = useNavigate();
  const { signIn } = useBlueJob();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signIn({ id: crypto.randomUUID(), name, email, role: null, onboardingComplete: false });
    navigate("/setup/path");
  }
  return <main className="auth-shell"><section className="auth-card">
    <img src="/bluejob-logo.png" className="auth-logo" alt="BlueJob" />
    <span className="eyebrow">CREATE YOUR BLUEJOB ACCOUNT</span>
    <h1>Your work should be worth something.</h1>
    <p className="auth-copy">Build your professional work identity, establish trust, and connect with real work.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
      <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
      <label>Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" /></label>
      <button className="primary-button" type="submit">Create Account</button>
    </form>
    <p className="auth-footer">Already have an account? <Link to="/signin">Sign in</Link></p>
  </section></main>;
}
