import { useState } from 'react';

export default function LoginModal({ onLogin, onClose }) {
  const [step, setStep] = useState('main');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [anonCode, setAnonCode] = useState('');
  const [generated, setGenerated] = useState('');
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSocial = (provider) => {
    onLogin(`${provider} User`, false);
  };

  const sendEmailCode = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email');
      return;
    }
    setEmailError('');
    setStep('emailCode');
  };

  const verifyEmailCode = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    onLogin(email.split('@')[0] || 'User', false);
  };

  const generateAnonCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let c = '';
    for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
    setGenerated(c);
    setAnonCode(c);
  };

  const loginWithAnon = (e) => {
    e.preventDefault();
    const c = (anonCode || generated).trim();
    if (!c) return;
    try { localStorage.setItem('seducecraft.anonCode', c); } catch {}
    onLogin('Anonymous', true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-bg-secondary border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Log in</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">✕</button>
        </div>

        {step === 'main' && (
          <>
            <p className="text-sm text-text-secondary mb-5">Choose a way to continue.</p>
            <div className="space-y-3 mb-5">
              <button onClick={() => handleSocial('Google')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <button onClick={() => handleSocial('Apple')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Continue with Apple
              </button>
              <button onClick={() => handleSocial('Telegram')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#29B6F6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                Continue with Telegram
              </button>
            </div>
            <button onClick={() => setStep('email')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2 mb-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Continue with email
            </button>
            <button onClick={() => setStep('anon')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Anonymous login
            </button>
          </>
        )}

        {step === 'email' && (
          <>
            <p className="text-sm text-text-secondary mb-4">We'll send a one-time code valid for 5 minutes.</p>
            <form onSubmit={sendEmailCode} className="space-y-3">
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }} placeholder="Email" className="w-full h-11 bg-bg-primary border border-border rounded-md px-3 focus:outline-none focus:border-accent" required />
              {emailError && <p className="text-xs text-red-400">{emailError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('main')} className="h-11 px-4 text-text-secondary hover:text-text-primary">Back</button>
                <button type="submit" className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium">Send code</button>
              </div>
            </form>
          </>
        )}

        {step === 'emailCode' && (
          <>
            <p className="text-sm text-text-secondary mb-1">Code sent to {email}</p>
            <p className="text-xs text-text-secondary mb-4">Please enter the code. Check your spam folder if you haven't received the mail. Valid for 5 minutes.</p>
            <form onSubmit={verifyEmailCode} className="space-y-3">
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code" className="w-full h-11 bg-bg-primary border border-border rounded-md px-3 focus:outline-none focus:border-accent text-center tracking-widest" maxLength={6} required />
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('email')} className="h-11 px-4 text-text-secondary hover:text-text-primary">Back</button>
                <button type="submit" className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium">Verify</button>
              </div>
            </form>
          </>
        )}

        {step === 'anon' && (
          <>
            <p className="text-sm text-text-secondary mb-4">Generate a unique code. Save it — you can use it to log in on any device without email.</p>
            <form onSubmit={loginWithAnon} className="space-y-3">
              <div className="flex gap-2">
                <input value={anonCode} onChange={e => setAnonCode(e.target.value)} placeholder="Code" className="flex-1 h-11 bg-bg-primary border border-border rounded-md px-3 focus:outline-none focus:border-accent font-mono tracking-wider" />
                <button type="button" onClick={generateAnonCode} className="h-11 px-4 border border-border rounded-md text-sm hover:border-accent hover:text-accent transition-colors">Generate</button>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('main')} className="h-11 px-4 text-text-secondary hover:text-text-primary">Back</button>
                <button type="submit" className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium">Continue</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
