import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import AppInterface from './components/AppInterface'
import AgeGate from './components/AgeGate'
import LoginModal from './components/LoginModal'
import TermsModal from './components/TermsModal'

export default function App() {
  const [view, setView] = useState('landing')
  const [adult, setAdult] = useState(false)
  const [name, setName] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('seducecraft.name')
      if (stored) setName(stored)
      const age = sessionStorage.getItem('seducecraft.age')
      if (age === 'true') setAdult(true)
      const terms = localStorage.getItem('seducecraft.terms')
      if (terms === 'true') setTermsAccepted(true)
    } catch {}
  }, [])

  const handleStart = () => {
    if (!name) {
      setLoginOpen(true)
      return
    }
    setView('studio')
  }

  const handleLogin = (n) => {
    setName(n)
    try { localStorage.setItem('seducecraft.name', n) } catch {}
    setLoginOpen(false)
    setView('studio')
  }

  const handleLogout = () => {
    setName('')
    try { localStorage.removeItem('seducecraft.name') } catch {}
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

  return (
    <div className="min-h-screen bg-black text-white">
      {view === 'landing' && (
        <Landing
          onStart={handleStart}
          onLogin={() => setLoginOpen(true)}
          isLoggedIn={!!name}
          userName={name}
        />
      )}
      {view === 'studio' && (
        <AppInterface
          isLoggedIn={!!name}
          name={name}
          onLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
          onShowTerms={() => setTermsOpen(true)}
          termsAccepted={termsAccepted}
          onRequireTerms={() => setTermsOpen(true)}
        />
      )}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLogin={handleLogin}
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
