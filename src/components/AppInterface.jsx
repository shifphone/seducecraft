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
  const [swapMode, setSwapMode] = useState('upload');
  const [deepMode, setDeepMode] = useState('upload');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [presets] = useState(SAMPLE_PRESETS);
  const [langOpen, setLangOpen] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [charModal, setCharModal] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [gallerySort, setGallerySort] = useState('newest');
  const [selectedGallery, setSelectedGallery] = useState(new Set());
  const [undressPhoto, setUndressPhoto] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('seducecraft.characters');
      if (saved) setCharacters(JSON.parse(saved));
      const g = localStorage.getItem('seducecraft.gallery');
      if (g) setGallery(JSON.parse(g));
    } catch {}
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };
  const saveCharacters = (list) => { setCharacters(list); try { localStorage.setItem('seducecraft.characters', JSON.stringify(list)); } catch {} };
  const saveGallery = (list) => { setGallery(list); try { localStorage.setItem('seducecraft.gallery', JSON.stringify(list)); } catch {} };
  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;

  const handleGenerate = () => {
    const needsPhoto = photoMode === 'undress' || (activeMode === 'faceswap' && swapMode === 'upload') || (activeMode === 'deepfake' && deepMode === 'upload');
    if (needsPhoto && !undressPhoto) return;
    if (!needsPhoto && !selectedCharacter) return;
    const p = selectedTemplate?.prompt || prompt;
    setGenerating(true);
    setTimeout(() => {
      const gen = { id: crypto.randomUUID(), title: selectedTemplate?.title?.[lang] || 'Custom', prompt: p || '', characterName: selectedCharacter?.name || 'Photo', src: undressPhoto || selectedTemplate?.src || '/stills/beam.jpg', createdAt: Date.now() };
      saveGallery([gen, ...gallery]);
      setGenerating(false);
      showToast(lang === 'en' ? 'Added to gallery' : 'Добавлено в галерею');
    }, 700);
  };

  const downloadImage = (src, name) => { const a = document.createElement('a'); a.href = src; a.download = (name || 'seducecraft') + '.jpg'; a.click(); };
  const deleteGalleryItems = (ids) => { saveGallery(gallery.filter(g => !ids.has(g.id))); setSelectedGallery(new Set()); setConfirmDelete(null); };
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
    <button onClick={onClick} className={`px-6 py-2.5 text-sm transition-all duration-200 ${active ? 'tab-active' : 'tab-inactive'}`}>{children}</button>
  );

  const CharacterPicker = () => (
    <div className="mb-6">
      <label className="block text-sm text-text-secondary mb-2">{t.selectCharacter}</label>
      {characters.length === 0 ? (
        <button onClick={() => setActiveMode('characters')} className="text-sm text-accent hover:underline">{lang === 'en' ? 'Create a character first' : 'Сначала создайте персонажа'}</button>
      ) : (
        <button onClick={() => setCharModal(true)} className={`flex items-center gap-3 px-4 py-3 text-sm min-w-[260px] ${selectedCharacter ? 'input-glow bg-bg-secondary' : 'border border-border rounded-lg hover:border-accent/50'}`}>
          {selectedCharacter ? (
            <>
              {selectedCharacter.photos?.[0] && <img src={selectedCharacter.photos[0]} alt="" className="w-10 h-10 rounded object-cover" />}
              <span className="font-medium">{selectedCharacter.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setSelectedCharacterId(null); }} className="ml-auto text-text-secondary hover:text-text-primary text-lg">×</button>
            </>
          ) : <span className="text-text-secondary">{lang === 'en' ? 'Select character' : 'Выбрать персонажа'}</span>}
        </button>
      )}
    </div>
  );

  const canGenerate = () => {
    if (generating) return false;
    if (photoMode === 'undress' || (activeMode === 'faceswap' && swapMode === 'upload') || (activeMode === 'deepfake' && deepMode === 'upload')) return !!undressPhoto;
    return !!selectedCharacter;
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {toast && <div className="fixed top-[55%] left-1/2 -translate-x-1/2 z-[100]"><div className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-xl">{toast}</div></div>}
      {charModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setCharModal(false)}>
          <div className="bg-bg-secondary border border-border rounded-xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{lang === 'en' ? 'Select character' : 'Выберите персонажа'}</h3>
              <button onClick={() => setCharModal(false)} className="text-text-secondary hover:text-text-primary">×</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {characters.map(c => (
                <button key={c.id} onClick={() => { setSelectedCharacterId(c.id); setCharModal(false); }} className={`border rounded-lg p-2 text-center hover:border-accent transition-colors ${selectedCharacterId === c.id ? 'border-accent' : 'border-border'}`}>
                  {c.photos?.[0] && <img src={c.photos[0]} alt="" className="w-full aspect-square object-cover rounded-md mb-2" />}
                  <div className="text-sm truncate">{c.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-bg-secondary border border-border rounded-xl p-6 max-w-sm w-full text-center">
            <p className="mb-4">{lang === 'en' ? `Delete ${confirmDelete.size} item(s)?` : `Удалить ${confirmDelete.size} элемент(ов)?`}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-border rounded-lg text-sm hover:border-accent">{lang === 'en' ? 'Cancel' : 'Отмена'}</button>
              <button onClick={() => deleteGalleryItems(confirmDelete)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">{lang === 'en' ? 'Delete' : 'Удалить'}</button>
            </div>
          </div>
        </div>
      )}
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
              <button key={id} onClick={() => setActiveMode(id)} className={`menu-item w-full text-left px-5 py-2.5 text-sm ${activeMode===id ? 'menu-active text-text-primary' : 'text-text-secondary'}`}>{name}</button>
            ))}
          </nav>
          {!isAnonymous && <div className="p-4 border-t border-border"><button onClick={onShowTerms} className="text-xs text-text-secondary hover:text-text-primary">{t.terms}</button></div>}
        </aside>
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {activeMode === 'home' && (
              <>
                <h2 className="text-2xl font-semibold mb-2">{t.homeTitle}</h2>
                <p className="text-text-secondary mb-8">{t.homeSub}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[{id:'photo',label:t.photo},{id:'faceswap',label:t.faceSwap},{id:'video',label:t.video},{id:'deepfake',label:t.deepfake}].map(m => (
                    <button key={m.id} onClick={() => setActiveMode(m.id)} className="border border-border rounded-xl p-5 text-center hover:border-accent/50 transition-colors">{m.label}</button>
                  ))}
                </div>
                <h3 className="text-lg font-semibold mb-4">{t.readyWorks}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {presets.map(p => <img key={p.id} src={p.src} alt="" className="aspect-[3/4] w-full object-cover rounded-lg border border-border" />)}
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
                      {selectedGallery.size > 0 && <button onClick={() => setConfirmDelete(selectedGallery)} className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">{lang === 'en' ? `Delete (${selectedGallery.size})` : `Удалить (${selectedGallery.size})`}</button>}
                    </div>
                  )}
                </div>
                {gallery.length === 0 ? <p className="text-text-secondary">{t.galleryEmpty}</p> : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sortedGallery.map(g => (
                      <div key={g.id} className="relative group border border-border rounded-lg overflow-hidden bg-bg-secondary">
                        <label className="absolute top-2 left-2 z-10"><input type="checkbox" checked={selectedGallery.has(g.id)} onChange={() => { const n = new Set(selectedGallery); n.has(g.id) ? n.delete(g.id) : n.add(g.id); setSelectedGallery(n); }} className="w-4 h-4" /></label>
                        <button onClick={() => setViewer(g)} className="text-left w-full"><img src={g.src} alt="" className="aspect-[3/4] w-full object-cover" /><div className="p-3 text-sm"><div className="font-medium">{g.title}</div><div className="text-xs text-text-secondary">{g.characterName}</div></div></button>
                        <button onClick={() => setConfirmDelete(new Set([g.id]))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600 text-white text-xs rounded flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeMode === 'photo' && (
              <>
                <div className="flex gap-3 mb-8 justify-center">
                  <TabBtn active={photoMode==='undress'} onClick={() => { setPhotoMode('undress'); setSelectedTemplate(null); }}>{t.undress}</TabBtn>
                  <TabBtn active={photoMode==='templates'} onClick={() => setPhotoMode('templates')}>{t.templates}</TabBtn>
                  <TabBtn active={photoMode==='custom'} onClick={() => setPhotoMode('custom')}>{t.custom}</TabBtn>
                </div>
                {photoMode === 'undress' && (
                  <div className="mb-6">
                    <p className="text-sm text-text-secondary mb-3 text-center">{lang === 'en' ? 'Upload a photo to undress' : 'Загрузите фото для раздевания'}</p>
                    <div className="dropzone p-8 text-center">
                      {undressPhoto ? <img src={undressPhoto} alt="" className="max-h-48 mx-auto rounded-lg mb-3" /> : null}
                      <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setUndressPhoto(URL.createObjectURL(f)); }} className="text-sm" />
                    </div>
                  </div>
                )}
                {photoMode !== 'undress' && <CharacterPicker />}
                {photoMode === 'custom' && <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-28 bg-bg-secondary border border-border rounded-lg px-4 py-3 mb-6 focus:border-accent focus:outline-none" />}
                {photoMode === 'templates' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {presets.map(p => (
                      <button key={p.id} type="button" onClick={(e) => { e.preventDefault(); setSelectedTemplate(p); }} className={`border rounded-lg overflow-hidden transition-colors ${selectedTemplate?.id === p.id ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-accent/50'}`}>
                        <img src={p.src} alt="" className="aspect-[3/4] w-full object-cover" />
                        <div className="p-2 text-xs">{p.title[lang] || p.title.en}</div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex justify-center mt-4">
                  <button onClick={handleGenerate} disabled={!canGenerate()} className="btn-glow disabled:opacity-40 text-white px-14 py-3.5 text-base font-medium">{generating ? t.generating : t.generate}</button>
                </div>
              </>
            )}
            {activeMode === 'faceswap' && (
              <>
                <div className="flex gap-3 mb-8 justify-center">
                  <TabBtn active={swapMode==='upload'} onClick={() => setSwapMode('upload')}>{t.uploadOwn}</TabBtn>
                  <TabBtn active={swapMode==='template'} onClick={() => setSwapMode('template')}>{t.useTemplate}</TabBtn>
                </div>
                <CharacterPicker />
                {swapMode === 'template' && <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">{presets.map(p => <button key={p.id} type="button" onClick={(e) => { e.preventDefault(); setSelectedTemplate(p); }} className={`border rounded-lg overflow-hidden ${selectedTemplate?.id === p.id ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-accent/50'}`}><img src={p.src} alt="" className="aspect-[3/4] w-full object-cover" /><div className="p-2 text-xs">{p.title[lang] || p.title.en}</div></button>)}</div>}
                {swapMode === 'upload' && <div className="dropzone p-8 mb-6 text-center"><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setUndressPhoto(URL.createObjectURL(f)); }} className="text-sm" /></div>}
                <div className="flex justify-center"><button onClick={handleGenerate} disabled={!canGenerate()} className="btn-glow disabled:opacity-40 text-white px-14 py-3.5 text-base font-medium">{generating ? t.generating : t.generate}</button></div>
              </>
            )}
            {activeMode === 'video' && (
              <>
                <CharacterPicker />
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-28 bg-bg-secondary border border-border rounded-lg px-4 py-3 mb-6 focus:border-accent focus:outline-none" />
                <div className="flex justify-center"><button onClick={handleGenerate} disabled={!canGenerate()} className="btn-glow disabled:opacity-40 text-white px-14 py-3.5 text-base font-medium">{generating ? t.generating : t.generate}</button></div>
              </>
            )}
            {activeMode === 'deepfake' && (
              <>
                <div className="flex gap-3 mb-8 justify-center">
                  <TabBtn active={deepMode==='upload'} onClick={() => setDeepMode('upload')}>{t.uploadOwn}</TabBtn>
                  <TabBtn active={deepMode==='template'} onClick={() => setDeepMode('template')}>{t.useTemplate}</TabBtn>
                </div>
                <CharacterPicker />
                {deepMode === 'template' && <p className="text-sm text-text-secondary mb-6 text-center">{lang === 'en' ? 'Video templates coming soon.' : 'Видеошаблоны скоро.'}</p>}
                {deepMode === 'upload' && <div className="dropzone p-8 mb-6 text-center"><input type="file" accept="video/*" className="text-sm" /></div>}
                <div className="flex justify-center"><button onClick={handleGenerate} disabled={!canGenerate()} className="btn-glow disabled:opacity-40 text-white px-14 py-3.5 text-base font-medium">{generating ? t.generating : t.generate}</button></div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
