import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import AppInterface from './components/AppInterface'
import AgeGate from './components/AgeGate'
import LoginModal from './components/LoginModal'

export default function App() {
  const [view, setView] = useState('landing')
  const [adult, setAdult] = useState(false)
  const [name, setName] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('seducecraft.name')
    if (stored) setName(stored)
    const age = sessionStorage.getItem('seducecraft.age')
    if (age === 'true') setAdult(true)
  }, [])

  const handleStart = () => {
    if (!adult) {
      // age gate will show when entering studio
    }
    if (!name) {
      setLoginOpen(true)
      return
    }
    setView('studio')
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
          name={name}
          onLogout={() => {
            setName('')
            localStorage.removeItem('seducecraft.name')
            setView('landing')
          }}
        />
      )}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={(n) => {
            setName(n)
            localStorage.setItem('seducecraft.name', n)
            setLoginOpen(false)
            setView('studio')
          }}
        />
      )}
      {!adult && view === 'studio' && (
        <AgeGate
          onAccept={() => {
            setAdult(true)
            sessionStorage.setItem('seducecraft.age', 'true')
          }}
        />
      )}
    </div>
  )
}
