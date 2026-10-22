import { useState, useEffect } from 'react';
import Landing from './components/Landing';
import AppInterface from './components/AppInterface';
import TermsModal from './components/TermsModal';
import AgeGate from './components/AgeGate';
import LoginModal from './components/LoginModal';

export default function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [view, setView] = useState('landing');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showAge, setShowAge] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [lang, setLang] = useState('en');
  const [credits, setCredits] = useState(10);

  useEffect(() => {
    try {
      const name = localStorage.getItem('seducecraft.name');
      const anon = localStorage.getItem('seducecraft.anon') === '1';
      const age = sessionStorage.getItem('seducecraft.age') === '1';
      const terms = localStorage.getItem('seducecraft.terms') === '1';
      const savedLang = localStorage.getItem('seducecraft.lang') || 'en';
      const savedCredits = parseInt(localStorage.getItem('seducecraft.credits') || '10', 10);
      if (name) {
        setUserName(name);
        setIsLoggedIn(true);
        setIsAnonymous(anon);
        setView('app'); // persist studio on refresh if logged in
      }
      if (age) setAgeConfirmed(true);
      if (terms) setTermsAccepted(true);
      setLang(savedLang);
      setCredits(isNaN(savedCredits) ? 10 : savedCredits);
    } catch {}
  }, []);

  const enterStudio = () => {
    setView('app');
    if (!termsAccepted && !isAnonymous) setShowTerms(true);
  };

  const handleStart = () => {
    if (!ageConfirmed) {
      setPendingAction(() => enterStudio);
      setShowAge(true);
      return;
    }
    if (!isLoggedIn) {
      setPendingAction(() => enterStudio);
      setShowLogin(true);
      return;
    }
    enterStudio();
  };

  const handleAgeAccept = () => {
    setAgeConfirmed(true);
    setShowAge(false);
    try { sessionStorage.setItem('seducecraft.age', '1'); } catch {}
    if (!isLoggedIn) {
      setShowLogin(true);
    } else if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogin = (name, anonymous = false) => {
    const trimmed = (name || (anonymous ? 'Anonymous' : '')).trim().slice(0, 32);
    if (!trimmed) return;
    setUserName(trimmed);
    setIsLoggedIn(true);
    setIsAnonymous(anonymous);
    try {
      localStorage.setItem('seducecraft.name', trimmed);
      localStorage.setItem('seducecraft.anon', anonymous ? '1' : '0');
    } catch {}
    setShowLogin(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAnonymous(false);
    setUserName('');
    try {
      localStorage.removeItem('seducecraft.name');
      localStorage.removeItem('seducecraft.anon');
    } catch {}
    setView('landing');
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
    try { localStorage.setItem('seducecraft.terms', '1'); } catch {}
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    try { localStorage.setItem('seducecraft.lang', newLang); } catch {}
  };

  const handleTopUp = (amount) => {
    const newCredits = credits + amount;
    setCredits(newCredits);
    try { localStorage.setItem('seducecraft.credits', String(newCredits)); } catch {}
  };

  return (
    <>
      {view === 'landing' ? (
        <Landing
          onStart={handleStart}
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogin={() => setShowLogin(true)}
          lang={lang}
          onLangChange={handleLangChange}
        />
      ) : (
        <AppInterface
          isLoggedIn={isLoggedIn}
          isAnonymous={isAnonymous}
          userName={userName}
          onLogin={() => setShowLogin(true)}
          onLogout={handleLogout}
          onShowTerms={() => setShowTerms(true)}
          termsAccepted={termsAccepted}
          onRequireTerms={() => { if (!isAnonymous) setShowTerms(true); }}
          lang={lang}
          onLangChange={handleLangChange}
          credits={credits}
          onTopUp={handleTopUp}
        />
      )}
      {showAge && (
        <AgeGate onAccept={handleAgeAccept} onClose={() => { setShowAge(false); setPendingAction(null); }} />
      )}
      {showTerms && (
        <TermsModal onAccept={handleAcceptTerms} onClose={() => setShowTerms(false)} />
      )}
      {showLogin && (
        <LoginModal onLogin={handleLogin} onClose={() => { setShowLogin(false); setPendingAction(null); }} />
      )}
    </>
  );
}
