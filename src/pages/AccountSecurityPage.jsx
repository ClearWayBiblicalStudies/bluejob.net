import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';

export default function AccountSecurityPage() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => { api.settings().then(({ settings: value }) => setSettings(value)).catch((error) => setMessage(error.message)); }, []);
  if (!settings) return <AppShell><p>{message || 'Loading security settings…'}</p></AppShell>;
  const action = async (fn, success) => { try { await fn(); setMessage(success); } catch (error) { setMessage(error.message); } };
  return <AppShell><div className="page-heading"><div><span className="kicker">ACCOUNT SECURITY</span><h1>Identity and access</h1><p>Verify your contact methods and protect your account with MFA.</p></div></div>
    <section className="card"><h2>Email verification</h2><p>{settings.email_verified ? 'Your email is verified.' : 'Your email still needs verification.'}</p>{!settings.email_verified && <button className="button button-primary" onClick={() => action(api.sendEmailVerification, 'Verification email sent.')}>Send verification email</button>}</section>
    <section className="card"><h2>Phone verification</h2><p>{settings.phone_verified ? 'Your phone is verified.' : 'Add and verify a phone number before using protected workflows.'}</p><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); action(() => api.sendPhoneVerification({ phone: data.get('phone') }), 'Phone code sent.'); }}><input name="phone" type="tel" placeholder="+1 555 555 5555" required/><button className="button button-outline">Send phone code</button></form></section>
    <section className="card"><h2>Multi-factor authentication</h2><p>{settings.mfa_enabled ? 'MFA is enabled.' : 'MFA is not enabled.'}</p>{!settings.mfa_enabled && <button className="button button-primary" onClick={() => action(() => api.enableMfa({}), 'MFA setup started. Check your authenticator for the next step.')}>Enable MFA</button>}</section>
    <section className="card"><h2>Founding Membership</h2><p>Unlock private beta access for $15.99/month.</p><button className="button button-outline" onClick={async () => { try { const { url } = await api.membershipCheckout(); window.location.assign(url); } catch (error) { setMessage(error.message); } }}>Open secure checkout</button></section>
    {message && <p role="status">{message}</p>}
  </AppShell>;
}
