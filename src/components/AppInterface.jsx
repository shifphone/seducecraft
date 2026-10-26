import { useState, useEffect } from 'react';
import Characters from './Characters';
import { translations as T } from '../i18n';

const SAMPLE_PRESETS = [];

export default function AppInterface({ isLoggedIn, isAnonymous, userName, onLogin, onLogout, onShowTerms, termsAccepted, onRequireTerms, lang, onLangChange, credits, onAddCredits }) {
  const t = T[lang] || T.en;
  const [activeMode, setActiveMode] = useState('home');
  const [photoMode, setPhotoMode] = useState('templates');
  const [swapMode, setSwapMode] = useState('upload');
  const [deepMode, setDeepMode] = useState('upload');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pendingGens, setPendingGens] = useState(0);
  const [toast, setToast] = useState(null);
  const [presets] = useState(SAMPLE_PRESETS);
  const [langOpen, setLangOpen] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [characterSort, setCharacterSort] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [charModal, setCharModal] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [gallerySort, setGallerySort] = useState('newest');
  const [selectedGallery, setSelectedGallery] = useState(new Set());
  const [undressPhoto, setUndressPhoto] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedModel, setSelectedModel] = useState('xSD4.5');
  const [numImages, setNumImages] = useState(1);
  const [sequential, setSequential] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('seducecraft.characters');
      if (saved) setCharacters(JSON.parse(saved));
      const g = localStorage.getItem('seducecraft.gallery');
      if (g) setGallery(JSON.parse(g));
    } catch {}
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/balance').then(r => r.json()).then(d => setBalance(d.balance)).catch(() => {});
    }
  }, [isLoggedIn]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 8000); };
  const saveCharacters = (list) => { setCharacters(list); try { localStorage.setItem('seducecraft.characters', JSON.stringify(list)); } catch {} };
  const saveGallery = (listOrUpdater) => {
    setGallery(prev => {
      const next = typeof listOrUpdater === 'function' ? listOrUpdater(prev) : listOrUpdater;
      try { localStorage.setItem('seducecraft.gallery', JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;

  const buildPrompt = () => {
    let p = selectedTemplate?.prompt || prompt || 'photo';
    p = p.trim();
    return p;
  };

  const handleGenerate = async () => {
    const needsPhoto = photoMode === 'undress' || (activeMode === 'faceswap' && swapMode === 'upload') || (activeMode === 'deepfake' && deepMode === 'upload');
    if (needsPhoto && !undressPhoto) return;
    if (!needsPhoto && !selectedCharacter) return;
    const p = buildPrompt();
    setPendingGens(c => c + 1);
    showToast(lang === 'en' ? 'Added to queue, generating…' : 'В очереди, генерируется…');
    try {
      const body = { prompt: p, endUserEmail: userName || 'shifphone@gmail.com', model: selectedModel, n: numImages, sequential: sequential ? 'auto' : undefined };
      const photos = selectedCharacter?.photos || [];
      const refUrls = [];
      const base64s = [];
      for (const photo of photos) {
        if (photo && photo.startsWith('http')) refUrls.push(photo);
        else if (photo && photo.startsWith('data:')) base64s.push(photo);
      }
      if (base64s.length) body.referenceBase64 = base64s;
      if (refUrls.length) body.references = refUrls;
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error || data);
        throw new Error(errMsg.slice(0, 400));
      }
      const images = data.images || (data.url ? [{url: data.url}] : []);
      const gens = images.map((img, i) => ({ id: crypto.randomUUID(), title: (selectedTemplate?.title?.[lang] || 'Custom') + (images.length>1 ? ` #${i+1}` : ''), prompt: p, characterName: selectedCharacter?.name || 'Photo', src: img.url || img, createdAt: Date.now() }));
      saveGallery(prev => [...gens, ...prev]);
      showToast(lang === 'en' ? 'Added to gallery' : 'Добавлено в галерею');
      if (isLoggedIn) fetch('/api/balance').then(r => r.json()).then(d => setBalance(d.balance)).catch(() => {});
    } catch (e) {
      showToast(e.message || 'Error');
    }
    setPendingGens(c => Math.max(0, c - 1));
  };

  const downloadImage = (src, name) => { const a = document.createElement('a'); a.href = src; a.download = (name || 'seducecraft') + '.jpg'; a.click(); };
  const deleteGalleryItems = (ids) => { saveGallery(prev => prev.filter(g => !ids.has(g.id))); setSelectedGallery(new Set()); setConfirmDelete(null); };
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
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
          : 'border border-zinc-700 text-zinc-400 hover:border-orange-500/40 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  );

  const CharacterPicker = () => (
    <div className="mb-6">
      <label className="block text-sm text-text-secondary mb-2">{t.selectCharacter}</label>
      {characters.length === 0 ? (
        <button onClick={() => setActiveMode('characters')} className="text-sm text-orange-400 hover:text-orange-300 underline">
          {lang === 'en' ? 'Create a character first' : 'Сначала создайте персонажа'}
        </button>
      ) : (
        <button
          onClick={() => setCharModal(true)}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm w-full max-w-xs rounded-xl border transition-all ${
            selectedCharacter
              ? 'border-orange-500/50 bg-zinc-900/80'
              : 'border-zinc-700 hover:border-zinc-500'
          }`}
        >
          {selectedCharacter ? (
            <>
              {selectedCharacter.photos?.[0] && (
                <img src={selectedCharacter.photos[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              )}
              <span className="font-medium truncate text-left flex-1">{selectedCharacter.name}</span>
              <span className="text-zinc-500">›</span>
            </>
          ) : (
            <span className="text-zinc-400">{lang === 'en' ? 'Select character' : 'Выбрать персонажа'}</span>
          )}
        </button>
      )}
    </div>
  );

  const canGenerate = () => {
    if (photoMode === 'undress' || (activeMode === 'faceswap' && swapMode === 'upload') || (activeMode === 'deepfake' && deepMode === 'upload')) return !!undressPhoto;
    return !!selectedCharacter;
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {toast && <div className="fixed top-[55%] left-1/2 -translate-x-1/2 z-[100] max-w-lg"><div className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-xl break-all">{toast}</div></div>}
      {charModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={() => setCharModal(false)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold uppercase tracking-wide text-zinc-300">{lang === 'en' ? 'Select character' : 'Выберите персонажа'}</h3>
              <button onClick={() => setCharModal(false)} className="text-zinc-500 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="flex gap-5">
              <div className="w-48 flex-shrink-0">
                {(() => {
                  const preview = characters.find(c => c.id === selectedCharacterId) || characters[0];
                  return preview ? (
                    <div className="rounded-xl overflow-hidden border border-zinc-800">
                      {preview.photos?.[0] && <img src={preview.photos[0]} alt="" className="w-full aspect-[3/4] object-cover" />}
                      <div className="p-3">
                        <div className="font-medium text-sm truncate">{preview.name}</div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="flex-1 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                <div className="flex justify-end items-center gap-3 mb-2">
                  <span className="text-xs text-zinc-500">{lang === 'en' ? 'Sort by' : 'Сортировка'}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCharacterSort('newest')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        characterSort === 'newest'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                          : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      {lang === 'en' ? 'New' : 'Новые'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCharacterSort('oldest')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        characterSort === 'oldest'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                          : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      {lang === 'en' ? 'Old' : 'Старые'}
                    </button>
                  </div>
                </div>
                {[...characters].sort((a, b) => characterSort === 'oldest' ? (a.createdAt || 0) - (b.createdAt || 0) : (b.createdAt || 0) - (a.createdAt || 0)).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCharacterId(c.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      selectedCharacterId === c.id
                        ? 'border-orange-500/60 bg-zinc-900'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {c.photos?.[0] && <img src={c.photos[0]} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                    </div>
                    <span className="text-zinc-500">›</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setCharModal(false)}
                disabled={!selectedCharacterId}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/30 hover:brightness-110 disabled:opacity-40"
              >
                {lang === 'en' ? 'Confirm' : 'Подтвердить'}
              </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => { setViewer(null); setShowPrompt(false); }}>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={viewer.src} alt="" className="w-full max-h-[70vh] object-contain rounded-md" />
            {showPrompt && viewer.prompt && (
              <div className="mt-3 p-3 bg-bg-secondary border border-border rounded-lg text-sm text-text-secondary">{viewer.prompt}</div>
            )}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div><div className="font-medium">{viewer.title}</div><div className="text-text-secondary text-xs">{viewer.characterName}</div></div>
              <div className="flex gap-2">
                {viewer.prompt && <button onClick={() => setShowPrompt(!showPrompt)} className="px-4 py-2 border border-border rounded-full text-sm hover:border-accent">{showPrompt ? 'Hide' : 'i'}</button>}
                <button onClick={() => downloadImage(viewer.src, viewer.title)} className="btn-glow px-4 py-2 text-white text-sm">{lang === 'en' ? 'Download' : 'Скачать'}</button>
                <button onClick={() => { setViewer(null); setShowPrompt(false); }} className="px-4 py-2 border border-border rounded-full text-sm hover:border-accent">Close</button>
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
          {isLoggedIn && <span className="text-sm">{userName} · {balance !== null ? balance : credits} {t.credits}</span>}
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
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
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
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  <TabBtn active={photoMode==='templates'} onClick={() => setPhotoMode('templates')}>{t.templates}</TabBtn>
                  <TabBtn active={photoMode==='custom'} onClick={() => setPhotoMode('custom')}>{t.custom}</TabBtn>
                  <TabBtn active={photoMode==='undress'} onClick={() => { setPhotoMode('undress'); setSelectedTemplate(null); }}>{t.undress}</TabBtn>
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
                <div className="max-w-md mx-auto mt-6 p-5 bg-bg-secondary/80 border border-border rounded-2xl space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-secondary mb-2">Model</p>
                    <div className="flex gap-2">
                      {[
                        {id:'xSD4.5', label:'xSD'},
                        {id:'xSD5Pro', label:'xSD Pro'}
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedModel(m.id)}
                          className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                            selectedModel===m.id
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                              : 'border border-zinc-700 text-zinc-300 hover:border-orange-500/50'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs uppercase tracking-wider text-text-secondary">n images</p>
                      <span className="text-sm text-zinc-400">{numImages}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={numImages}
                      onChange={e => setNumImages(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-zinc-400">
                    <input type="checkbox" checked={sequential} onChange={e => setSequential(e.target.checked)} className="accent-orange-500" />
                    Sequential
                  </label>

                  <div className="text-xs text-text-secondary text-center">Cost approx. {numImages} xToken(s)</div>

                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate()}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-base shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:brightness-110 transition-all disabled:opacity-40 disabled:shadow-none"
                  >
                    {pendingGens > 0 ? `${t.generating} (${pendingGens})` : t.generate}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
