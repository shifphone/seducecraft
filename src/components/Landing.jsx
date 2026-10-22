import { useState } from 'react';
import { translations as T } from '../i18n';

export default function Landing({ onStart, isLoggedIn, userName, onLogin, lang, onLangChange }) {
  const [langOpen, setLangOpen] = useState(false);
  const t = T[lang] || T.en;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/layer-logo-icon.png" alt="" className="h-11 w-11 object-contain" />
            <img src="/layer-logo.png" alt="Seducecraft" className="h-8 object-contain" />
            <span className="text-xs border border-accent/60 text-accent px-2 py-0.5 rounded">{t.adultStudio}</span>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="text-text-secondary hover:text-text-primary p-1 flex items-center gap-1">
                <span>🌐</span>
                <span className="text-xs">{lang.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 bg-bg-secondary border border-border rounded-md shadow-lg z-10 min-w-[80px]">
                  <button onClick={() => { onLangChange('en'); setLangOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary ${lang === 'en' ? 'text-accent' : 'text-text-secondary'}`}>EN</button>
                  <button onClick={() => { onLangChange('ru'); setLangOpen(false); }} className={`block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary ${lang === 'ru' ? 'text-accent' : 'text-text-secondary'}`}>RU</button>
                </div>
              )}
            </div>
            <button onClick={isLoggedIn ? onStart : onLogin} className="text-sm text-text-secondary hover:text-text-primary">{isLoggedIn ? userName : t.login}</button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-widest text-accent mb-4">{t.adultStudio}</p>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-none mb-6">{t.makeIdea} <span className="italic text-text-secondary">{t.visible}</span></h1>
              <p className="text-lg text-text-secondary max-w-md mb-8 leading-relaxed">{t.subtitle}</p>
              <button onClick={onStart} className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-md text-base font-medium">{t.startFree}</button>
            </div>
            <div className="bg-bg-secondary border border-border rounded-lg p-5">
              <img src="/stills/beam.jpg" alt="Studio preview" className="aspect-video w-full rounded-md object-cover mb-4" />
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[t.photo, t.video, t.templates, t.deepfake].map(item => (
                  <div key={item} className="bg-bg-tertiary rounded-md py-3 text-center text-sm text-text-secondary">{item}</div>
                ))}
              </div>
              <button onClick={onStart} className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium">{t.openStudio}</button>
            </div>
          </div>
        </section>
        <section className="border-t border-border py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-semibold mb-8">{t.howItWorks}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{ n: '01', t: t.step1t, d: t.step1d }, { n: '02', t: t.step2t, d: t.step2d }, { n: '03', t: t.step3t, d: t.step3d }].map((item) => (
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
            <h2 className="text-4xl font-semibold mb-8">{t.why}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[{ t: t.simple, d: t.simpleD }, { t: t.quiet, d: t.quietD }, { t: t.direct, d: t.directD }, { t: t.easy, d: t.easyD }].map((item) => (
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
          <span>{t.brand}</span>
          <span>{t.adultStudio}</span>
        </div>
      </footer>
    </div>
  );
}
