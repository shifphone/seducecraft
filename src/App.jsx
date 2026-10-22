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
  const [userName, setUserName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
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
        setView('app');
      }
      if (age) setAgeConfirmed(true);
      if (terms) setTermsAccepted(true);
      setLang(savedLang);
      setCredits(savedCredits);
    } catch {}
  }, []);

  const onLangChange = (newLang) => {
    setLang(newLang);
    try { localStorage.setItem('seducecraft.lang', newLang); } catch {}
  };

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

  const handleLogin = (name, isAnon = false) => {
    const trimmed = (name || '').trim().slice(0, 32) || (isAnon ? 'Anonymous' : '');
    if (!trimmed && !isAnon) return;
    setUserName(trimmed);
    setIsLoggedIn(true);
    setIsAnonymous(isAnon);
    try {
      localStorage.setItem('seducecraft.name', trimmed);
      localStorage.setItem('seducecraft.anon', isAnon ? '1' : '0');
    } catch {}
    setShowLogin(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    } else {
      enterStudio();
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setIsAnonymous(false);
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

  const addCredits = (amount) => {
    const next = credits + amount;
    setCredits(next);
    try { localStorage.setItem('seducecraft.credits', String(next)); } catch {}
  };

  return (
    <>
      {view === 'landing' ? (
        <Landing onStart={handleStart} isLoggedIn={isLoggedIn} userName={userName} onLogin={() => setShowLogin(true)} lang={lang} onLangChange={onLangChange} />
      ) : (
        <AppInterface
          isLoggedIn={isLoggedIn}
          userName={userName}
          isAnonymous={isAnonymous}
          onLogin={() => setShowLogin(true)}
          onLogout={handleLogout}
          onShowTerms={() => setShowTerms(true)}
          termsAccepted={termsAccepted}
          onRequireTerms={() => setShowTerms(true)}
          lang={lang}
          onLangChange={onLangChange}
          credits={credits}
          onAddCredits={addCredits}
        />
      )}
      {showAge && (
        <AgeGate onAccept={handleAgeAccept} onClose={() => { setShowAge(false); setPendingAction(null); }} />
      )}
      {showTerms && (
        <TermsModal onAccept={handleAcceptTerms} onClose={() => setShowTerms(false)} />
      )}
      {showLogin && (
        <LoginModal onLogin={handleLogin} onClose={() => { setShowLogin(false); setPendingAction(null); }} lang={lang} />
      )}
    </>
  );
}
