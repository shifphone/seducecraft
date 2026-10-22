import { useState } from 'react';
import Characters from './Characters';
import { translations as T } from '../i18n';

const SAMPLE_PRESETS = [
  { id: 1, title: { en: 'On the counter — ass on display', ru: 'На столешнице — попа на отображении' }, prompt: 'Bathroom mirror selfie pov. She sits backwards on the bathroom counter.', tags: ['18+', 'ass'], src: '/stills/beam.jpg' },
  { id: 2, title: { en: 'Kneeling — burgundy lingerie', ru: 'На коленях — бордовое бельё' }, prompt: 'Kneeling on the bed facing the mirror, strappy crimson bralette and matching thong', tags: ['18+', 'lingerie'], src: '/stills/silk.jpg' },
  { id: 3, title: { en: 'Mirror — red bikini', ru: 'Зеркало — красное бикини' }, prompt: 'Mirror selfie, cherry-red ribbed triangle bikini, bedroom', tags: ['18+', 'selfie'], src: '/stills/lake.jpg' },
];

export default function AppInterface({ isLoggedIn, isAnonymous, userName, onLogin, onLogout, onShowTerms, termsAccepted, onRequireTerms, lang, onLangChange, credits, onAddCredits }) {
  const t = T[lang] || T.en;
  const [activeMode, setActiveMode] = useState('custom');
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('normal');
  const [media, setMedia] = useState('photo');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [presets] = useState(SAMPLE_PRESETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(false);

  const handleGenerate = () => {
    if (!selectedCharacter) return;
    if (!termsAccepted && !isAnonymous) { onRequireTerms(); return; }
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => { setResult({ message: lang === 'en' ? 'Demo mode.' : 'Демо режим.' }); setGenerating(false); }, 700);
  };

  const filtered = presets.filter(p => {
    const title = (p.title[lang] || p.title.en || '').toLowerCase();
    return !searchQuery || title.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/layer-logo-icon.png" alt="" className="h-11 w-11 object-contain" />
          <img src="/layer-logo.png" alt="Seducecraft" className="h-8 object-contain" />
        </div>
        <div className="flex items-center gap-4 relative">
          <button onClick={() => setLangOpen(!langOpen)} className="text-text-secondary hover:text-text-primary">🌐</button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 bg-bg-secondary border border-border rounded-md shadow-lg z-20 min-w-[80px]">
              <button onClick={() => { onLangChange('en'); setLangOpen(false); }} className="block w-full text-left px-3 py-2 text-sm">EN</button>
              <button onClick={() => { onLangChange('ru'); setLangOpen(false); }} className="block w-full text-left px-3 py-2 text-sm">RU</button>
            </div>
          )}
          {isLoggedIn && !isAnonymous && <span className="text-sm">{userName} · {credits} {t.credits}</span>}
          {isLoggedIn && isAnonymous && <button onClick={onLogout} className="text-sm text-text-secondary">{userName}</button>}
          {!isLoggedIn && <button onClick={onLogin} className="text-sm text-text-secondary">{t.login}</button>}
          {isLoggedIn && !isAnonymous && <button onClick={onLogout} className="text-sm text-text-secondary">{t.logout}</button>}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border bg-bg-secondary flex flex-col">
          <nav className="flex-1 py-4">
            {[{id:'characters',name:t.myCharacters},{id:'templates',name:t.templates},{id:'custom',name:t.advanced},{id:'history',name:t.myGallery}].map(({id,name}) => (
              <button key={id} onClick={() => setActiveMode(id)} className={`w-full text-left px-6 py-3 text-sm ${activeMode===id ? 'bg-bg-tertiary text-text-primary border-r-2 border-accent' : 'text-text-secondary hover:text-text-primary'}`}>{name}</button>
            ))}
          </nav>
          {!isAnonymous && (
            <div className="p-4 border-t border-border">
              <button onClick={onShowTerms} className="text-xs text-text-secondary hover:text-text-primary">{t.terms}</button>
            </div>
          )}
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {activeMode === 'characters' && <Characters onRequireTerms={onRequireTerms} termsAccepted={termsAccepted} />}
            {activeMode === 'templates' && (
              <>
                <h2 className="text-2xl font-semibold mb-4">{t.templates}</h2>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchTemplates} className="w-full h-10 bg-bg-secondary border border-border rounded-md px-3 text-sm mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filtered.map(p => (
                    <button key={p.id} onClick={() => { setPrompt(p.prompt); setActiveMode('custom'); }} className="text-left border border-border rounded-md bg-bg-secondary hover:border-accent/50 overflow-hidden">
                      <img src={p.src} alt="" className="aspect-[3/4] w-full object-cover" />
                      <div className="p-2 text-xs font-medium">{p.title[lang] || p.title.en}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {activeMode === 'history' && (
              <div className="text-center py-16 text-text-secondary">
                <h2 className="text-2xl font-semibold mb-2 text-text-primary">{t.myGallery}</h2>
                <p>{t.galleryEmpty}</p>
              </div>
            )}
            {activeMode === 'custom' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">{t.advanced}</h2>
                <div className="mb-6">
                  <label className="block text-sm text-text-secondary mb-2">{t.selectCharacter}</label>
                  <button onClick={() => setSelectedCharacter(true)} className={`px-5 py-2.5 text-sm rounded-lg border-2 ${selectedCharacter ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary'}`}>
                    {selectedCharacter ? (lang === 'en' ? 'Character selected' : 'Персонаж выбран') : (lang === 'en' ? 'Select / Add character' : 'Выбрать / Добавить персонажа')}
                  </button>
                  {!selectedCharacter && <p className="text-xs text-red-400 mt-2">{t.characterRequired}</p>}
                </div>
                <div className="flex gap-4 mb-5">
                  <button onClick={() => setMedia('photo')} className={`px-8 py-3 text-base rounded-lg border-2 font-medium ${media==='photo'?'border-accent bg-accent/15 text-accent':'border-border text-text-secondary'}`}>{t.photo}</button>
                  <button onClick={() => setMedia('video')} className={`px-8 py-3 text-base rounded-lg border-2 font-medium ${media==='video'?'border-accent bg-accent/15 text-accent':'border-border text-text-secondary'}`}>{t.video}</button>
                </div>
                <div className="flex gap-4 mb-6">
                  {['flash','normal','pro'].map(q => (
                    <button key={q} onClick={() => setQuality(q)} className={`px-6 py-2.5 text-sm rounded-lg border-2 font-medium ${quality===q?'border-accent text-accent bg-accent/10':'border-border text-text-secondary'}`}>{t[q]}</button>
                  ))}
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-text-secondary mb-2">{t.scenario}</label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-32 bg-bg-secondary border border-border rounded-md px-4 py-3" />
                </div>
                <button onClick={handleGenerate} disabled={generating || !prompt.trim() || !selectedCharacter} className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white px-10 py-4 rounded-lg text-base font-medium">{generating ? t.generating : t.generate}</button>
                {result && <div className="mt-6 p-4 border border-border rounded-md">{result.message}</div>}
                <div className="mt-6 border border-border rounded-md bg-bg-secondary h-64 flex items-center justify-center text-text-secondary">{t.result}</div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
