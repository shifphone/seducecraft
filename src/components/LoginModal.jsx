import { useState } from 'react';

export default function LoginModal({ onLogin, onClose }) {
  const [step, setStep] = useState('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [anonCode, setAnonCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [anonError, setAnonError] = useState('');
  const [anonBusy, setAnonBusy] = useState(false);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSocial = (provider) => {
    onLogin(`${provider} User`, false);
  };

  const continueEmail = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email');
      return;
    }
    if (!password.trim()) return;
    setEmailError('');
    onLogin(email.split('@')[0] || 'User', false);
  };

  const generateAnonCode = async () => {
    setAnonBusy(true); setAnonError('');
    try {
      const r = await fetch('/api/anon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate' }) });
      const d = await r.json();
      if (!r.ok || !d.code) throw new Error(d.error || 'failed');
      setAnonCode(d.code);
    } catch (e) { setAnonError(e.message || 'Generate failed'); }
    setAnonBusy(false);
  };

  const loginWithAnon = async (e) => {
    e.preventDefault();
    const c = anonCode.trim().toUpperCase();
    if (!c) return;
    setAnonBusy(true); setAnonError('');
    try {
      const r = await fetch('/api/anon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check', code: c }) });
      const d = await r.json();
      if (!d.ok) { setAnonError('Code not found'); setAnonBusy(false); return; }
      try { localStorage.setItem('seducecraft.anonCode', c); } catch {}
      onLogin('Anonymous', true);
    } catch (e) { setAnonError('Check failed'); }
    setAnonBusy(false);
  };

  const SocialIcon = ({ name }) => {
    const icons = {
      Apple: <svg className="w-5 h-5 text-zinc-100" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
      Google: <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
      Discord: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.32 4.37A19.8 19.8 0 0015.89 3a14.1 14.1 0 00-.62 1.28 18.27 18.27 0 00-5.54 0A12.6 12.6 0 009.1 3a19.74 19.74 0 00-4.44 1.38C1.77 8.05.9 11.63 1.34 15.16a19.9 19.9 0 006.07 3.07 14.9 14.9 0 001.3-2.12 12.9 12.9 0 01-2.05-.98c.17-.13.34-.26.5-.4a14.27 14.27 0 0012.18 0c.17.14.33.27.5.4-.65.39-1.34.72-2.05.98.37.75.8 1.46 1.3 2.12a19.84 19.84 0 006.07-3.07c.53-4.14-.9-7.68-3.84-10.79zM8.71 13.33c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42s2.17 1.09 2.15 2.42c0 1.33-.95 2.41-2.15 2.41zm6.58 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42s2.17 1.09 2.15 2.42c0 1.33-.94 2.41-2.15 2.41z"/></svg>,
      Telegram: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#2AABEE"><path d="M11.94 0C5.35 0 0 5.35 0 11.94s5.35 11.94 11.94 11.94 11.94-5.35 11.94-11.94S18.53 0 11.94 0zm5.77 8.15l-1.9 8.95c-.14.64-.52.8-1.05.5l-2.9-2.14-1.4 1.35c-.15.15-.29.29-.59.29l.21-2.98 5.42-4.9c.24-.21-.05-.33-.37-.12l-6.7 4.22-2.89-.9c-.63-.2-.64-.63.13-.93l11.28-4.35c.52-.19.98.12.76.91z"/></svg>,
    };
    return icons[name] || null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {step === 'main' && (
          <div className="p-8 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg className="w-14 h-14 text-zinc-100" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 28c0-6 4-10 12-10s12 4 12 10v4H20v-4z"/>
                  <rect x="16" y="32" width="32" height="20" rx="3"/>
                  <circle cx="32" cy="42" r="2" fill="currentColor"/>
                  <path d="M28 8l4 6 4-6M36 8l4 6 4-6" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-center text-zinc-100 mb-6">Create your Seducecraft account</h2>

            <div className="flex justify-center gap-3 mb-5">
              {['Apple','Google','Discord','Telegram'].map(p => (
                <button key={p} onClick={() => handleSocial(p)} title={p} className="w-12 h-11 border border-zinc-700 rounded-lg hover:bg-zinc-800/50 flex items-center justify-center">
                  <SocialIcon name={p} />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-zinc-500">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={continueEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full h-11 border border-zinc-700 rounded-lg px-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" className="w-full h-11 border border-zinc-700 rounded-lg px-3 pr-10 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                Continue <span>›</span>
              </button>
            </form>
          </div>
        )}

        {step === 'anon' && (
          <div className="p-8">
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Continue without account</h2>
            <p className="text-sm text-zinc-400 mb-4">Generate a code and save it. Use it to log in on any device.</p>
            <form onSubmit={loginWithAnon} className="space-y-3">
              <div className="flex gap-2">
                <input value={anonCode} onChange={e => setAnonCode(e.target.value)} placeholder="Code" className="flex-1 h-11 border border-zinc-700 rounded-lg px-3 font-mono text-zinc-100 bg-zinc-800 placeholder:text-zinc-500" />
                <button type="button" onClick={generateAnonCode} disabled={anonBusy} className="h-11 px-4 border border-zinc-600 rounded-lg text-sm text-zinc-100 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50">{anonBusy ? "..." : "Generate"}</button>
              </div>
              {anonError && <p className="text-xs text-red-400">{anonError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('main')} className="h-11 px-4 text-zinc-400">Back</button>
                <button type="submit" disabled={anonBusy} className="flex-1 h-11 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">Continue</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-zinc-800/50 border-t border-zinc-800 px-8 py-4 text-center text-sm text-zinc-400">
          <div>Already have an account? <button className="text-zinc-300 underline">Sign in here</button></div>
          <div className="mt-1">Or try Seducecraft <button onClick={() => setStep('anon')} className="text-zinc-300 underline">without an account</button>.</div>
        </div>
      </div>
    </div>
  );
}
