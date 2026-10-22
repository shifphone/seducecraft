import { useState, useEffect } from 'react';
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
  const [toast, setToast] = useState(null);
  const [presets] = useState(SAMPLE_PRESETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [charOpen, setCharOpen] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [templateZoom, setTemplateZoom] = useState(null);
  const [gallerySort, setGallerySort] = useState('newest');
  const [selectedGallery, setSelectedGallery] = useState(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('seducecraft.characters');
      if (saved) setCharacters(JSON.parse(saved));
      const g = localStorage.getItem('seducecraft.gallery');
      if (g) setGallery(JSON.parse(g));
    } catch {}
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const saveCharacters = (list) => {
    setCharacters(list);
    try { localStorage.setItem('seducecraft.characters', JSON.stringify(list)); } catch {}
  };

  const saveGallery = (list) => {
    setGallery(list);
    try { localStorage.setItem('seducecraft.gallery', JSON.stringify(list)); } catch {}
  };

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;

  const addToGallery = (item) => {
    const next = [item, ...gallery];
    saveGallery(next);
  };

  const handleGenerate = (sourcePrompt, sourceTitle) => {
    if (!selectedCharacter) return;
    if (!termsAccepted && !isAnonymous) { onRequireTerms(); return; }
    const p = sourcePrompt || prompt;
    if (!p?.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const gen = {
        id: crypto.randomUUID(),
        title: sourceTitle || (lang === 'en' ? 'Custom' : 'Произвольный'),
        prompt: p,
        characterName: selectedCharacter.name,
        characterPhoto: selectedCharacter.photos?.[0] || null,
        src: '/stills/beam.jpg',
        createdAt: Date.now(),
      };
      addToGallery(gen);
      setGenerating(false);
      showToast(lang === 'en' ? 'Added to gallery' : 'Добавлено в галерею');
    }, 700);
  };

  const downloadImage = (src, name) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = (name || 'seducecraft') + '.jpg';
    a.click();
  };

  const deleteGalleryItems = (ids) => {
    const next = gallery.filter(g => !ids.has(g.id));
    saveGallery(next);
    setSelectedGallery(new Set());
  };

  const sortedGallery = [...gallery].sort((a, b) => gallerySort === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  const filtered = presets.filter(p => {
    const title = (p.title[lang] || p.title.en || '').toLowerCase();
    return !searchQuery || title.includes(searchQuery.toLowerCase());
  });

  const CharacterPicker = ({ compact }) => (
    <div className={compact ? 'mb-4' : 'mb-6'}>
      <label className="block text-sm text-text-secondary mb-2">{t.selectCharacter}</label>
      {characters.length === 0 ? (
        <button onClick={() => setActiveMode('characters')} className="text-sm text-accent hover:underline transition-colors">{lang === 'en' ? 'Create a character first' : 'Сначала создайте персонажа'}</button>
      ) : (
        <div className="relative inline-block">
          <button onClick={() => setCharOpen(!charOpen)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-border text-sm hover:border-accent/50 transition-colors min-w-[200px]">
            {selectedCharacter ? (
              <>
                {selectedCharacter.photos?.[0] && <img src={selectedCharacter.photos[0]} alt="" className="w-6 h-6 rounded object-cover" />}
                <span>{selectedCharacter.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedCharacterId(null); }} className="ml-auto text-text-secondary hover:text-text-primary">×</button>
              </>
            ) : (
              <span className="text-text-secondary">{lang === 'en' ? 'Select character' : 'Выбрать персонажа'}</span>
            )}
          </button>
          {charOpen && (
            <div className="absolute left-0 top-full mt-1 bg-bg-secondary border border-border rounded-lg shadow-lg z-20 min-w-[200px] py-1">
              {characters.map(c => (
                <button key={c.id} onClick={() => { setSelectedCharacterId(c.id); setCharOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary flex items-center gap-2 transition-colors">
                  {c.photos?.[0] && <img src={c.photos[0]} alt="" className="w-6 h-6 rounded object-cover" />}
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!selectedCharacter && characters.length > 0 && <p className="text-xs text-red-400 mt-2">{t.characterRequired}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-600/90 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-lg">{toast}</div>
        </div>
      )}
      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewer(null)}>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={viewer.src} alt="" className="w-full max-h-[70vh] object-contain rounded-md" />
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{viewer.title}</div>
                <div className="text-text-secondary text-xs">{viewer.characterName}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => downloadImage(viewer.src, viewer.title)} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm transition-colors">{lang === 'en' ? 'Download' : 'Скачать'}</button>
                <button onClick={() => setViewer(null)} className="px-4 py-2 border border-border rounded-md text-sm hover:border-accent transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {templateZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setTemplateZoom(null)}>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={templateZoom.src} alt="" className="w-full max-h-[80vh] object-contain rounded-md" />
            <div className="mt-3 text-center text-sm">{templateZoom.title[lang] || templateZoom.title.en}</div>
            <button onClick={() => setTemplateZoom(null)} className="mt-3 block mx-auto px-4 py-2 border border-border rounded-md text-sm hover:border-accent">Close</button>
          </div>
        </div>
      )}
      <header className="border-b border-border h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/layer-logo-icon.png" alt="" className="h-11 w-11 object-contain" />
          <img src="/layer-logo.png" alt="Seducecraft" className="h-8 object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="text-text-secondary hover:text-text-primary transition-colors">🌐</button>
            {langOpen && (
              <div className="absolute left-0 top-full mt-2 bg-bg-secondary border border-border rounded-md shadow-lg z-20 min-w-[70px]">
                <button onClick={() => { onLangChange('en'); setLangOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary transition-colors">EN</button>
                <button onClick={() => { onLangChange('ru'); setLangOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary transition-colors">RU</button>
              </div>
            )}
          </div>
          {isLoggedIn && <span className="text-sm">{userName} · {credits} {t.credits}</span>}
          {!isLoggedIn && <button onClick={onLogin} className="text-sm text-text-secondary hover:text-text-primary transition-colors">{t.login}</button>}
          {isLoggedIn && <button onClick={onLogout} className="text-sm text-text-secondary hover:text-text-primary transition-colors">{t.logout}</button>}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border bg-bg-secondary flex flex-col">
          <nav className="flex-1 py-4">
            {[{id:'characters',name:t.myCharacters},{id:'templates',name:t.templates},{id:'custom',name:t.advanced},{id:'history',name:t.myGallery}].map(({id,name}) => (
              <button key={id} onClick={() => setActiveMode(id)} className={`w-full text-left px-6 py-3 text-sm transition-all duration-200 ${activeMode===id ? 'bg-bg-tertiary text-text-primary border-r-2 border-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'}`}>{name}</button>
            ))}
          </nav>
          {!isAnonymous && (
            <div className="p-4 border-t border-border">
              <button onClick={onShowTerms} className="text-xs text-text-secondary hover:text-text-primary transition-colors">{t.terms}</button>
            </div>
          )}
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {activeMode === 'characters' && <Characters onRequireTerms={onRequireTerms} termsAccepted={termsAccepted} characters={characters} onSave={saveCharacters} />}
            {activeMode === 'templates' && (
              <>
                <h2 className="text-2xl font-semibold mb-4">{t.templates}</h2>
                <CharacterPicker compact />
                {!activeTemplate && (
                  <>
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchTemplates} className="w-full h-10 bg-bg-secondary border border-border rounded-md px-3 text-sm mb-6 focus:border-accent focus:outline-none transition-colors" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filtered.map(p => (
                        <div key={p.id} className="relative group border border-border rounded-md bg-bg-secondary overflow-hidden">
                          <button onClick={() => setTemplateZoom(p)} className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/60 text-white text-xs rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">↗</button>
                          <button onClick={() => { if (!selectedCharacter) return; setActiveTemplate(p); }} className="text-left w-full disabled:opacity-50" disabled={!selectedCharacter}>
                            <img src={p.src} alt="" className="aspect-[3/4] w-full object-cover" />
                            <div className="p-2 text-xs font-medium">{p.title[lang] || p.title.en}</div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTemplate && (
                  <div className="mt-4">
                    <button onClick={() => setActiveTemplate(null)} className="text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">← {lang === 'en' ? 'Back to templates' : 'Назад к шаблонам'}</button>
                    <div className="flex gap-6 items-start">
                      <img src={activeTemplate.src} alt="" className="w-48 rounded-md object-cover" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{activeTemplate.title[lang] || activeTemplate.title.en}</h3>
                        <p className="text-sm text-text-secondary mb-4">{lang === 'en' ? 'Ready to generate with' : 'Готово к генерации с'} {selectedCharacter?.name}</p>
                        <button onClick={() => handleGenerate(activeTemplate.prompt, activeTemplate.title[lang] || activeTemplate.title.en)} disabled={generating || !selectedCharacter} className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors">{generating ? t.generating : t.generate}</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {activeMode === 'history' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">{t.myGallery}</h2>
                  {gallery.length > 0 && (
                    <div className="flex items-center gap-3">
                      <select value={gallerySort} onChange={e => setGallerySort(e.target.value)} className="h-9 bg-bg-secondary border border-border rounded-md px-2 text-sm">
                        <option value="newest">{lang === 'en' ? 'Newest' : 'Сначала новые'}</option>
                        <option value="oldest">{lang === 'en' ? 'Oldest' : 'Сначала старые'}</option>
                      </select>
                      {selectedGallery.size > 0 && (
                        <button onClick={() => deleteGalleryItems(selectedGallery)} className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors">{lang === 'en' ? `Delete (${selectedGallery.size})` : `Удалить (${selectedGallery.size})`}</button>
                      )}
                    </div>
                  )}
                </div>
                {gallery.length === 0 ? (
                  <p className="text-text-secondary">{t.galleryEmpty}</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sortedGallery.map(g => (
                      <div key={g.id} className="relative group border border-border rounded-lg overflow-hidden bg-bg-secondary">
                        <label className="absolute top-2 left-2 z-10">
                          <input type="checkbox" checked={selectedGallery.has(g.id)} onChange={() => {
                            const next = new Set(selectedGallery);
                            next.has(g.id) ? next.delete(g.id) : next.add(g.id);
                            setSelectedGallery(next);
                          }} className="w-4 h-4" />
                        </label>
                        <button onClick={() => setViewer(g)} className="text-left w-full">
                          <img src={g.src} alt="" className="aspect-[3/4] w-full object-cover" />
                          <div className="p-3 text-sm">
                            <div className="font-medium">{g.title}</div>
                            <div className="text-xs text-text-secondary">{g.characterName}</div>
                          </div>
                        </button>
                        <button onClick={() => deleteGalleryItems(new Set([g.id]))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600 text-white text-xs rounded flex items-center justify-center transition-opacity hover:bg-red-700">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeMode === 'custom' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">{t.advanced}</h2>
                <CharacterPicker />
                <div className="flex gap-4 mb-5">
                  <button onClick={() => setMedia('photo')} className={`px-8 py-3 text-base rounded-lg border-2 font-medium transition-all duration-200 ${media==='photo'?'border-accent bg-accent/15 text-accent':'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'}`}>{t.photo}</button>
                  <button onClick={() => setMedia('video')} className={`px-8 py-3 text-base rounded-lg border-2 font-medium transition-all duration-200 ${media==='video'?'border-accent bg-accent/15 text-accent':'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'}`}>{t.video}</button>
                </div>
                <div className="flex gap-4 mb-6">
                  {['flash','normal','pro'].map(q => (
                    <button key={q} onClick={() => setQuality(q)} className={`px-6 py-2.5 text-sm rounded-lg border-2 font-medium transition-all duration-200 ${quality===q?'border-accent text-accent bg-accent/10':'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'}`}>{t[q]}</button>
                  ))}
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-text-secondary mb-2">{t.scenario}</label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-32 bg-bg-secondary border border-border rounded-md px-4 py-3 focus:border-accent focus:outline-none transition-colors" />
                </div>
                <button onClick={() => handleGenerate()} disabled={generating || !prompt.trim() || !selectedCharacter} className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white px-10 py-4 rounded-lg text-base font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent/20">{generating ? t.generating : t.generate}</button>
                <div className="mt-6 border border-border rounded-md bg-bg-secondary h-64 flex items-center justify-center text-text-secondary">{t.result}</div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
