import { useState } from 'react';

export default function LoginModal({ onLogin, onClose }) {
  const [step, setStep] = useState('main');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [anonLink, setAnonLink] = useState('');
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

  const startAnonymous = () => {
    setStep('anon');
  };

  const confirmAnonLink = (e) => {
    e.preventDefault();
    if (!anonLink.trim()) return;
    onLogin('Anonymous', true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-bg-secondary border border-border rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-semibold">Log in</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">✕</button>
        </div>

        {step === 'main' && (
          <>
            <p className="text-sm text-text-secondary mb-5">Choose a way to continue.</p>
            <div className="space-y-3 mb-5">
              <button onClick={() => handleSocial('Google')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
                <span className="text-blue-400">G</span> Continue with Google
              </button>
              <button onClick={() => handleSocial('Apple')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
                <span></span> Continue with Apple
              </button>
              <button onClick={() => handleSocial('Telegram')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
                <span className="text-blue-400">✈</span> Continue with Telegram
              </button>
            </div>
            <button onClick={() => setStep('email')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary mb-3">Continue with email</button>
            <button onClick={startAnonymous} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary">Anonymous login</button>
          </>
        )}

        {step === 'email' && (
          <>
            <p className="text-sm text-text-secondary mb-4">We'll send a one-time code valid for 5 minutes.</p>
            <form onSubmit={sendEmailCode} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="Email"
                className="w-full h-11 bg-bg-primary border border-border rounded-md px-3 focus:outline-none focus:border-accent"
                required
              />
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
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter code"
                className="w-full h-11 bg-bg-primary border border-border rounded-md px-3 focus:outline-none focus:border-accent text-center tracking-widest"
                maxLength={6}
                required
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('email')} className="h-11 px-4 text-text-secondary hover:text-text-primary">Back</button>
                <button type="submit" className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium">Verify</button>
              </div>
            </form>
          </>
        )}

        {step === 'anon' && (
          <>
            <p className="text-sm text-text-secondary mb-4">You will receive a link and can login without sharing your email. Save (!) it so your generations are safe.</p>
            <form onSubmit={confirmAnonLink} className="space-y-3">
              <input
                value={anonLink}
                onChange={e => setAnonLink(e.target.value)}
                placeholder="Paste your link or code"
                className="w-full h-11 bg-bg-primary border border-border rounded-md px-3 focus:outline-none focus:border-accent"
                required
              />
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
