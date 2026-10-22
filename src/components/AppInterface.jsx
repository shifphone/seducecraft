import { useState, useEffect } from 'react';
import Characters from './Characters';
import { translations as T } from '../i18n';

const SAMPLE_PRESETS = [
  { id: 1, title: { en: 'On the counter', ru: 'На столешнице' }, prompt: 'Bathroom counter', src: '/stills/beam.jpg' },
  { id: 2, title: { en: 'Kneeling', ru: 'На коленях' }, prompt: 'Kneeling lingerie', src: '/stills/silk.jpg' },
  { id: 3, title: { en: 'Mirror', ru: 'Зеркало' }, prompt: 'Mirror selfie', src: '/stills/lake.jpg' },
];

export default function AppInterface({ isLoggedIn, isAnonymous, userName, onLogin, onLogout, onShowTerms, termsAccepted, onRequireTerms, lang, onLangChange, credits, onAddCredits }) {
  const t = T[lang] || T.en;
  const [activeMode, setActiveMode] = useState('home');
  const [photoMode, setPhotoMode] = useState('undress');
  const [swapMode, setSwapMode] = useState('template');
  const [deepMode, setDeepMode] = useState('template');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [presets] = useState(SAMPLE_PRESETS);
  const [langOpen, setLangOpen] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [charOpen, setCharOpen] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [viewer, setViewer] = useState(null);
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1800); };
  const saveCharacters = (list) => { setCharacters(list); try { localStorage.setItem('seducecraft.characters', JSON.stringify(list)); } catch {} };
  const saveGallery = (list) => { setGallery(list); try { localStorage.setItem('seducecraft.gallery', JSON.stringify(list)); } catch {} };
  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;

  const handleGenerate = (sourcePrompt, sourceTitle) => {
    if (!selectedCharacter) return;
    const p = sourcePrompt || prompt;
    if (!p?.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const gen = { id: crypto.randomUUID(), title: sourceTitle || 'Custom', prompt: p, characterName: selectedCharacter.name, src: '/stills/beam.jpg', createdAt: Date.now() };
      saveGallery([gen, ...gallery]);
      setGenerating(false);
      showToast(lang === 'en' ? 'Added to gallery' : 'Добавлено в галерею');
    }, 700);
  };

  const downloadImage = (src, name) => { const a = document.createElement('a'); a.href = src; a.download = (name || 'seducecraft') + '.jpg'; a.click(); };
  const deleteGalleryItems = (ids) => { saveGallery(gallery.filter(g => !ids.has(g.id))); setSelectedGallery(new Set()); };
  const sortedGallery = [...gallery].sort((a, b) => gallerySort === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  const menu = [
    { id: 'home', name: t.home },
    { id: 'characters', name: t.myCharacters },
    { id: 'photo', name: t.photo },
    { id: 'faceswap', name: t.faceSwap },
    { id: 'video', name: t.video },
    { id: 'deepfake', name: t.deepfake },
    { id: 'gallery', name: t.myGallery },
  ];

  const TabBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-5 py-2 text-sm transition-all duration-200 ${active ? 'tab-active' : 'tab-inactive'}`}>{children}</button>
  );

  const GenBtn = ({ onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="btn-glow disabled:opacity-40 text-white px-12 py-3 text-sm font-medium">{generating ? t.generating : t.generate}</button>
  );

  const CharacterPicker = () => (
    <div className="mb-4">
      <label className="block text-sm text-text-secondary mb-2">{t.selectCharacter}</label>
      {characters.length === 0 ? (
        <button onClick={() => setActiveMode('characters')} className="text-sm text-accent hover:underline">{lang === 'en' ? 'Create a character first' : 'Сначала создайте персонажа'}</button>
      ) : (
        <div className="relative inline-block">
          <button onClick={() => setCharOpen(!charOpen)} className={`flex items-center gap-2 px-4 py-2.5 text-sm min-w-[220px] ${selectedCharacter ? 'input-glow bg-bg-secondary' : 'border border-border rounded-lg hover:border-accent/50'}`}>
            {selectedCharacter ? (
              <>
                {selectedCharacter.photos?.[0] && <img src={selectedCharacter.photos[0]} alt="" className="w-6 h-6 rounded object-cover" />}
                <span>{selectedCharacter.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedCharacterId(null); }} className="ml-auto text-text-secondary hover:text-text-primary">×</button>
              </>
            ) : <span className="text-text-secondary">{lang === 'en' ? 'Select character' : 'Выбрать персонажа'}</span>}
          </button>
          {charOpen && (
            <div className="absolute left-0 top-full mt-1 bg-bg-secondary border border-border rounded-lg shadow-lg z-20 min-w-[220px] py-1">
              {characters.map(c => (
                <button key={c.id} onClick={() => { setSelectedCharacterId(c.id); setCharOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary flex items-center gap-2">
                  {c.photos?.[0] && <img src={c.photos[0]} alt="" className="w-6 h-6 rounded object-cover" />}{c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {toast && <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"><div className="bg-green-600/90 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-lg">{toast}</div></div>}
      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewer(null)}>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={viewer.src} alt="" className="w-full max-h-[70vh] object-contain rounded-md" />
            <div className="mt-4 flex items-center justify-between text-sm">
              <div><div className="font-medium">{viewer.title}</div><div className="text-text-secondary text-xs">{viewer.characterName}</div></div>
              <div className="flex gap-2">
                <button onClick={() => downloadImage(viewer.src, viewer.title)} className="btn-glow px-4 py-2 text-white text-sm">{lang === 'en' ? 'Download' : 'Скачать'}</button>
                <button onClick={() => setViewer(null)} className="px-4 py-2 border border-border rounded-full text-sm hover:border-accent">Close</button>
              </div>
            </div>
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
            <button onClick={() => setLangOpen(!langOpen)} className="text-text-secondary hover:text-text-primary">🌐</button>
            {langOpen && (
              <div className="absolute left-0 top-full mt-2 bg-bg-secondary border border-border rounded-md shadow-lg z-20 min-w-[70px]">
                <button onClick={() => { onLangChange('en'); setLangOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary">EN</button>
                <button onClick={() => { onLangChange('ru'); setLangOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary">RU</button>
              </div>
            )}
          </div>
          {isLoggedIn && <span className="text-sm">{userName} · {credits} {t.credits}</span>}
          {!isLoggedIn && <button onClick={onLogin} className="text-sm text-text-secondary hover:text-text-primary">{t.login}</button>}
          {isLoggedIn && <button onClick={onLogout} className="text-sm text-text-secondary hover:text-text-primary">{t.logout}</button>}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-border bg-bg-secondary flex flex-col">
          <nav className="flex-1 py-4">
            {menu.map(({id, name}) => (
              <button key={id} onClick={() => setActiveMode(id)} className={`menu-item w-full text-left px-5 py-2.5 text-sm transition-all duration-200 ${activeMode===id ? 'menu-active text-text-primary' : 'text-text-secondary'}`}>{name}</button>
            ))}
          </nav>
          {!isAnonymous && <div className="p-4 border-t border-border"><button onClick={onShowTerms} className="text-xs text-text-secondary hover:text-text-primary">{t.terms}</button></div>}
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {activeMode === 'home' && (
              <>
                <h2 className="text-2xl font-semibold mb-2">{t.homeTitle}</h2>
                <p className="text-text-secondary mb-6">{t.homeSub}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {[{id:'photo',label:t.photo},{id:'faceswap',label:t.faceSwap},{id:'video',label:t.video},{id:'deepfake',label:t.deepfake}].map(m => (
                    <button key={m.id} onClick={() => setActiveMode(m.id)} className="border border-border rounded-xl p-4 text-center hover:border-accent/50 transition-colors">{m.label}</button>
                  ))}
                </div>
                <h3 className="text-lg font-semibold mb-3">{t.readyWorks}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {presets.map(p => <img key={p.id} src={p.src} alt="" className="aspect-[3/4] w-full object-cover rounded-md border border-border" />)}
                </div>
              </>
            )}
            {activeMode === 'characters' && <Characters onRequireTerms={onRequireTerms} termsAccepted={termsAccepted} characters={characters} onSave={saveCharacters} />}
            {activeMode === 'gallery' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">{t.myGallery}</h2>
                  {gallery.length > 0 && (
                    <div className="flex items-center gap-3">
                      <select value={gallerySort} onChange={e => setGallerySort(e.target.value)} className="h-9 bg-bg-secondary border border-border rounded-md px-2 text-sm">
                        <option value="newest">{lang === 'en' ? 'Newest' : 'Сначала новые'}</option>
                        <option value="oldest">{lang === 'en' ? 'Oldest' : 'Сначала старые'}</option>
                      </select>
                      {selectedGallery.size > 0 && <button onClick={() => deleteGalleryItems(selectedGallery)} className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">{lang === 'en' ? `Delete (${selectedGallery.size})` : `Удалить (${selectedGallery.size})`}</button>}
                    </div>
                  )}
                </div>
                {gallery.length === 0 ? <p className="text-text-secondary">{t.galleryEmpty}</p> : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sortedGallery.map(g => (
                      <div key={g.id} className="relative group border border-border rounded-lg overflow-hidden bg-bg-secondary">
                        <label className="absolute top-2 left-2 z-10"><input type="checkbox" checked={selectedGallery.has(g.id)} onChange={() => { const n = new Set(selectedGallery); n.has(g.id) ? n.delete(g.id) : n.add(g.id); setSelectedGallery(n); }} className="w-4 h-4" /></label>
                        <button onClick={() => setViewer(g)} className="text-left w-full"><img src={g.src} alt="" className="aspect-[3/4] w-full object-cover" /><div className="p-3 text-sm"><div className="font-medium">{g.title}</div><div className="text-xs text-text-secondary">{g.characterName}</div></div></button>
                        <button onClick={() => deleteGalleryItems(new Set([g.id]))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600 text-white text-xs rounded flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeMode === 'photo' && (
              <>
                <div className="flex gap-3 mb-6 justify-center">
                  <TabBtn active={photoMode==='undress'} onClick={() => setPhotoMode('undress')}>{t.undress}</TabBtn>
                  <TabBtn active={photoMode==='templates'} onClick={() => setPhotoMode('templates')}>{t.templates}</TabBtn>
                  <TabBtn active={photoMode==='custom'} onClick={() => setPhotoMode('custom')}>{t.custom}</TabBtn>
                </div>
                <CharacterPicker />
                {photoMode === 'custom' && <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-24 bg-bg-secondary border border-border rounded-lg px-3 py-2 mb-4 focus:border-accent focus:outline-none" />}
                {photoMode === 'templates' && <div className="grid grid-cols-3 gap-3 mb-4">{presets.map(p => <button key={p.id} onClick={() => handleGenerate(p.prompt, p.title[lang])} className="border border-border rounded-lg overflow-hidden hover:border-accent/50"><img src={p.src} alt="" className="aspect-[3/4] w-full object-cover" /><div className="p-2 text-xs">{p.title[lang] || p.title.en}</div></button>)}</div>}
                {photoMode === 'undress' && <p className="text-sm text-text-secondary mb-4 text-center">{lang === 'en' ? 'Select a character and generate.' : 'Выберите персонажа и сгенерируйте.'}</p>}
                <div className="flex justify-center"><GenBtn onClick={() => handleGenerate()} disabled={generating || !selectedCharacter} /></div>
              </>
            )}
            {activeMode === 'faceswap' && (
              <>
                <div className="flex gap-3 mb-6 justify-center">
                  <TabBtn active={swapMode==='template'} onClick={() => setSwapMode('template')}>{t.useTemplate}</TabBtn>
                  <TabBtn active={swapMode==='upload'} onClick={() => setSwapMode('upload')}>{t.uploadOwn}</TabBtn>
                </div>
                <CharacterPicker />
                {swapMode === 'template' && <div className="grid grid-cols-3 gap-3 mb-4">{presets.map(p => <img key={p.id} src={p.src} alt="" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />)}</div>}
                {swapMode === 'upload' && <div className="dropzone p-6 mb-4 text-center"><input type="file" accept="image/*" className="text-sm" /></div>}
                <div className="flex justify-center"><GenBtn onClick={() => handleGenerate()} disabled={generating || !selectedCharacter} /></div>
              </>
            )}
            {activeMode === 'video' && (
              <>
                <CharacterPicker />
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-24 bg-bg-secondary border border-border rounded-lg px-3 py-2 mb-4 focus:border-accent focus:outline-none" />
                <div className="flex justify-center"><GenBtn onClick={() => handleGenerate()} disabled={generating || !selectedCharacter} /></div>
              </>
            )}
            {activeMode === 'deepfake' && (
              <>
                <div className="flex gap-3 mb-6 justify-center">
                  <TabBtn active={deepMode==='template'} onClick={() => setDeepMode('template')}>{t.useTemplate}</TabBtn>
                  <TabBtn active={deepMode==='upload'} onClick={() => setDeepMode('upload')}>{t.uploadOwn}</TabBtn>
                </div>
                <CharacterPicker />
                {deepMode === 'template' && <p className="text-sm text-text-secondary mb-4 text-center">{lang === 'en' ? 'Video templates coming soon.' : 'Видеошаблоны скоро.'}</p>}
                {deepMode === 'upload' && <div className="dropzone p-6 mb-4 text-center"><input type="file" accept="video/*" className="text-sm" /></div>}
                <div className="flex justify-center"><GenBtn onClick={() => handleGenerate()} disabled={generating || !selectedCharacter} /></div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
