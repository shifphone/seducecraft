import { useState } from 'react';

export default function Landing({ onStart, isLoggedIn, userName, onLogin, lang, onLangChange }) {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm tracking-wide font-medium">Seducecraft</span>
            <span className="text-xs border border-accent text-accent px-2 py-0.5 rounded">Adult AI Studio</span>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1"
              >
                🌐 {lang === 'en' ? 'EN' : 'RU'}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 bg-bg-secondary border border-border rounded-md shadow-lg z-10 min-w-[80px]">
                  <button
                    onClick={() => { onLangChange('en'); setLangOpen(false); }}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary ${lang === 'en' ? 'text-accent' : 'text-text-secondary'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => { onLangChange('ru'); setLangOpen(false); }}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary ${lang === 'ru' ? 'text-accent' : 'text-text-secondary'}`}
                  >
                    RU
                  </button>
                </div>
              )}
            </div>
            <button onClick={isLoggedIn ? onStart : onLogin} className="text-sm text-text-secondary hover:text-text-primary">
              {isLoggedIn ? userName : 'Log in'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-widest text-accent mb-4">Adult AI Studio</p>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-none mb-6">
                Make the idea <span className="italic text-text-secondary">visible.</span>
              </h1>
              <p className="text-lg text-text-secondary max-w-md mb-8 leading-relaxed">
                A studio for adults only. Images and video, no extra steps — access from 18.
              </p>
              <button
                onClick={onStart}
                className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-md text-base font-medium"
              >
                Start free
              </button>
            </div>
            <div className="bg-bg-secondary border border-border rounded-lg p-5">
              <img
                src="/stills/beam.jpg"
                alt="Studio preview"
                className="aspect-video w-full rounded-md object-cover mb-4"
              />
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['Custom', 'Photo', 'Video', 'Templates'].map(item => (
                  <div key={item} className="bg-bg-tertiary rounded-md py-3 text-center text-sm text-text-secondary">{item}</div>
                ))}
              </div>
              <button
                onClick={onStart}
                className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium"
              >
                Open the studio
              </button>
              <p className="text-xs text-text-secondary text-center mt-3">18+ only · no sign-up</p>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-semibold mb-8">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { n: '01', t: 'Upload a photo', d: 'Add a clear image of the person you want to work with.' },
                { n: '02', t: 'Choose or describe', d: 'Pick a template from the library, or write your own scenario.' },
                { n: '03', t: 'Enjoy', d: 'Generate and review the result. Refine if you want, then run again.' },
              ].map((item) => (
                <div key={item.n} className="bg-bg-secondary border border-border rounded-lg p-6">
                  <p className="text-accent text-sm mb-2">{item.n}</p>
                  <h3 className="text-lg font-semibold mb-2">{item.t}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-semibold mb-8">Why Seducecraft</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { t: 'Simple', d: 'One screen. Nothing between the idea and the result.' },
                { t: 'Quiet', d: 'No noise, no extra screens. A scenario and a finished frame.' },
                { t: 'Direct', d: 'What you wrote is what gets made. No hidden modes.' },
                { t: 'Easy to use', d: 'Private, we don\'t store your results.' },
              ].map((item) => (
                <div key={item.t} className="bg-bg-secondary border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">{item.t}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex justify-between text-sm text-text-secondary">
          <span>Seducecraft</span>
          <span>Adult AI Studio</span>
        </div>
      </footer>
    </div>
  );
}
