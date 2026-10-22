import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import AppInterface from './components/AppInterface'
import AgeGate from './components/AgeGate'
import LoginModal from './components/LoginModal'
import TermsModal from './components/TermsModal'

const translations = {
  en: {
    login: 'Log in',
    account: 'Account',
    logout: 'Log out',
    credits: 'Credits',
    topUp: 'Top up',
    // add more as needed
  },
  ru: {
    login: 'Войти',
    account: 'Аккаунт',
    logout: 'Выйти',
    credits: 'Кредиты',
    topUp: 'Пополнить',
  }
}

export default function App() {
  const [view, setView] = useState('landing')
  const [adult, setAdult] = useState(false)
  const [name, setName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [lang, setLang] = useState('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('seducecraft.name')
      const anon = localStorage.getItem('seducecraft.anon') === 'true'
      if (stored) {
        setName(stored)
        setIsAnonymous(anon)
        setView('studio')
      }
      const age = sessionStorage.getItem('seducecraft.age')
      if (age === 'true') setAdult(true)
      const terms = localStorage.getItem('seducecraft.terms')
      if (terms === 'true') setTermsAccepted(true)
      const savedLang = localStorage.getItem('seducecraft.lang')
      if (savedLang) setLang(savedLang)
    } catch {}
  }, [])

  const handleStart = () => {
    if (!name) {
      setLoginOpen(true)
      return
    }
    setView('studio')
  }

  const handleLogin = (n, anonymous = false) => {
    setName(n)
    setIsAnonymous(anonymous)
    try {
      localStorage.setItem('seducecraft.name', n)
      localStorage.setItem('seducecraft.anon', anonymous ? 'true' : 'false')
    } catch {}
    setLoginOpen(false)
    setView('studio')
    // TOS only for real (non-anon) logins, and only if not already accepted
    if (!anonymous && !termsAccepted) {
      setTermsOpen(true)
    }
  }

  const handleLogout = () => {
    setName('')
    setIsAnonymous(false)
    try {
      localStorage.removeItem('seducecraft.name')
      localStorage.removeItem('seducecraft.anon')
    } catch {}
    setView('landing')
  }

  const handleAcceptAge = () => {
    setAdult(true)
    try { sessionStorage.setItem('seducecraft.age', 'true') } catch {}
  }

  const handleAcceptTerms = () => {
    setTermsAccepted(true)
    try { localStorage.setItem('seducecraft.terms', 'true') } catch {}
    setTermsOpen(false)
  }

  const changeLang = (l) => {
    setLang(l)
    try { localStorage.setItem('seducecraft.lang', l) } catch {}
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {view === 'landing' && (
        <Landing
          onStart={handleStart}
          onLogin={() => setLoginOpen(true)}
          isLoggedIn={!!name}
          userName={name}
          lang={lang}
          onLangChange={changeLang}
        />
      )}
      {view === 'studio' && (
        <AppInterface
          isLoggedIn={!!name}
          name={name}
          isAnonymous={isAnonymous}
          onLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
          onShowTerms={() => setTermsOpen(true)}
          termsAccepted={termsAccepted}
          onRequireTerms={() => { if (!isAnonymous && !termsAccepted) setTermsOpen(true) }}
          lang={lang}
          onLangChange={changeLang}
        />
      )}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLogin={handleLogin}
          lang={lang}
        />
      )}
      {!adult && view === 'studio' && (
        <AgeGate onAccept={handleAcceptAge} />
      )}
      {termsOpen && (
        <TermsModal
          onAccept={handleAcceptTerms}
          onClose={() => setTermsOpen(false)}
        />
      )}
    </div>
  )
}
