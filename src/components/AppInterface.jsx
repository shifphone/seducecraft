import { useState, useEffect, useRef } from 'react';
import Characters from './Characters';
import { translations as T } from '../i18n';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getSession } from '../lib/auth';

const SAMPLE_PRESETS = [];

export default function AppInterface({ isLoggedIn, isAnonymous, userName, onLogin, onLogout, onShowTerms, termsAccepted, onRequireTerms, lang, onLangChange, credits, onAddCredits, onLegal }) {
  const t = T[lang] || T.en;
  const [activeMode, setActiveMode] = useState('home');
  const [photoMode, setPhotoMode] = useState('templates');
  const [swapMode, setSwapMode] = useState('upload');
  const [deepMode, setDeepMode] = useState('upload');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pendingGens, setPendingGens] = useState(0);
  const [activeGens, setActiveGens] = useState([]);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('seducecraft.email') || '');
  const [toast, setToast] = useState(null);
  const [presets, setPresets] = useState(SAMPLE_PRESETS);
  const [notionLoaded, setNotionLoaded] = useState(false);
  useEffect(() => {
    if (notionLoaded) return;
    fetch('/api/templates')
      .then(r => r.json())
      .then(d => {
        if (d.templates && d.templates.length > 0) {
          setPresets(prev => {
            const ids = new Set(prev.map(p => p.id));
            const extra = d.templates.filter(t => !ids.has(t.id));
            return [...prev, ...extra];
          });
        }
        setNotionLoaded(true);
      })
      .catch(() => setNotionLoaded(true));
  }, [notionLoaded]);

  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const [characters, setCharacters] = useState([]);
  const [characterSort, setCharacterSort] = useState('newest');
  const [characterFilter, setCharacterFilter] = useState('all');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [previewCharacter, setPreviewCharacter] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editing, setEditing] = useState(false);
  const [lastClickedChar, setLastClickedChar] = useState(null);
  const [charModal, setCharModal] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [gallerySort, setGallerySort] = useState('newest');
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryRange, setGalleryRange] = useState('all');
  const [selectedGallery, setSelectedGallery] = useState(new Set());
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('seducecraft.txs') || '[]'));
  const [referralCode, setReferralCode] = useState(() => localStorage.getItem('seducecraft.ref') || '');
  const [checkoutPkg, setCheckoutPkg] = useState(null);
  const [paying, setPaying] = useState(false);

  const [undressPhoto, setUndressPhoto] = useState(null);
  const [undressStyle, setUndressStyle] = useState('nude');
  const [templateCategory, setTemplateCategory] = useState([]);
  const [templateSort, setTemplateSort] = useState('az');
  const [catSearch, setCatSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [balance, setBalance] = useState(null);
  const [spentCredits, setSpentCredits] = useState(() => parseInt(localStorage.getItem('seducecraft.spent') || '0'));
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('seducecraft.notifs') || '[]'));
  const PHOTO_COST = 1;
  const VIDEO_COST = 5;

  const calcPhotoCost = () => {
    let base = selectedModel === 'xSD5Pro' ? 2 : 1;
    if (selectedModel === 'xSD5Pro') {
      if (imageSize === '1.5K') base = 3;
      if (imageSize === '2K') base = 4;
    } else {
      if (imageSize.includes('2048')) base = 1.5;
      if (imageSize.includes('2560')) base = 2;
      if (imageSize.includes('3072')) base = 3;
    }
    return Math.round(base * numImages);
  };

    const handlePurchase = async (packageId) => {
    setPaying(true);
    try {
      const userId = getUserId();
      const res = await fetch('/api/payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'checkout', packageId, userId }) });
      const data = await res.json();
      if (data.demo) {
        const confirm = await fetch('/api/payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirm', packageId, userId }) });
        const result = await confirm.json();
        if (result.ok) {
          onAddCredits(data.credits);
          addTx('Purchase', data.credits, `$${data.price}`);
          showToast(lang === 'en' ? `Added ${data.credits} credits` : `Добавлено ${data.credits} кредитов`);
        }
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || 'Payment error');
      }
    } catch (e) {
      showToast(e.message || 'Payment failed');
    }
    setPaying(false);
    setCheckoutPkg(null);
  };

  const addTx = (desc, amount, details) => {
    const tx = { id: crypto.randomUUID(), desc, amount, details, at: Date.now() };
    setTransactions(prev => {
      const next = [tx, ...prev].slice(0, 50);
      localStorage.setItem('seducecraft.txs', JSON.stringify(next));
      return next;
    });
  };
    const playSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const addNotification = (msg) => {
    const n = { id: crypto.randomUUID(), msg, time: Date.now(), read: false };
    setNotifications(prev => {
      const next = [n, ...prev].slice(0, 50);
      localStorage.setItem('seducecraft.notifs', JSON.stringify(next));
      return next;
    });
  };
  const [selectedModel, setSelectedModel] = useState('xSD4.5');
  const [numImages, setNumImages] = useState(1);
  const [sequential, setSequential] = useState(false);
  const [imageSize, setImageSize] = useState('1920x1920');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoRatio, setVideoRatio] = useState('16:9');
  const [videoModel, setVideoModel] = useState('xW3.0s');
  const [videoMode, setVideoMode] = useState('text'); // text | image | templates
  const [videoImage, setVideoImage] = useState(null);
  const [customPhoto, setCustomPhoto] = useState(null);
  const [galleryPicker, setGalleryPicker] = useState(null); // 'swap' | 'video' | 'undress' | 'custom'
  const [videoStatus, setVideoStatus] = useState(null);
  const [swapSource, setSwapSource] = useState(null);
  const [swapTarget, setSwapTarget] = useState(null);

  const getUserId = () => localStorage.getItem('seducecraft.anonCode') || 'guest';

  useEffect(() => {
    (async () => {
      const userId = getUserId();
      if (!isLoggedIn) return;
      try {
        const [charRes, galRes] = await Promise.all([
          fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'loadCharacters', userId }) }),
          fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'loadGallery', userId }) })
        ]);
        const charData = await charRes.json();
        const galData = await galRes.json();
        if (charRes.ok && Array.isArray(charData)) setCharacters(charData.map(c => ({ ...c, photos: c.photos || [], saved: true })));
        if (galRes.ok && Array.isArray(galData)) setGallery(galData);
      } catch {}
    })();
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeMode === 'faceswap' || photoMode === 'undress') setSelectedModel('xSD5Pro');
  }, [activeMode]);

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/balance').then(r => r.json()).then(d => setBalance(d.balance)).catch(() => {});
    }
  }, [isLoggedIn]);

    const editGalleryImage = async () => {
    const src = viewer?.src || previewSrc;
    if (!editPrompt.trim() || !src || editing) return;
    setEditing(true);
    try {
      const email = isLoggedIn && userName?.includes('@') ? userName : `anon-${localStorage.getItem('anonId') || 'x'}@seducecraft.app`;
      const body = {
        prompt: editPrompt.trim(),
        endUserEmail: email,
        model: 'xSD4.5',
        n: 1,
        size: '2048x2048',
        references: [src],
      };
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'edit failed');
      const item = { id: crypto.randomUUID(), title: 'Edit', prompt: editPrompt.trim(), characterName: 'Edit', src: data.url, createdAt: Date.now(), model: 'xSD4.5', size: '2048x2048' };
      setGallery(prev => [item, ...prev]);
      if (viewer) setViewer({ ...viewer, src: data.url }); else setPreviewSrc(data.url);
      setEditPrompt('');
      showToast(lang === 'en' ? 'Edited! Added to gallery' : 'Отредактировано!');
    } catch (e) {
      showToast(e.message || 'Edit failed');
    }
    setEditing(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 8000); };
  const saveCharacters = async (list) => {
    setCharacters(list);
    const userId = getUserId();
    for (const c of list) {
      if (!c.saved) {
        try {
          // Upload photos first, get URLs
          const photoUrls = [];
          for (const photo of (c.photos || [])) {
            if (photo.startsWith('http')) {
              photoUrls.push(photo);
            } else if (photo.startsWith('data:')) {
              const upRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64: photo }) });
              if (upRes.ok) {
                const upData = await upRes.json();
                if (upData.url) photoUrls.push(upData.url);
              }
            }
          }
          // Save character with URLs only
          const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'saveCharacter', userId, name: c.name, photos: photoUrls }) });
          if (res.ok) { 
            const data = await res.json(); 
            c.id = data.id;
            c.saved = true;
            c.photos = photoUrls;
            showToast('Character saved!');
          } else {
            const text = await res.text();
            showToast('Save failed: ' + text.slice(0, 50));
          }
        } catch (e) { 
          showToast('Save error: ' + e.message);
        }
      }
    }
  };
  const saveGallery = async (listOrUpdater) => {
    setGallery(prev => {
      const next = typeof listOrUpdater === 'function' ? listOrUpdater(prev) : listOrUpdater;
      const userId = getUserId();
      const newItems = next.filter(g => !prev.find(p => p.id === g.id));
      newItems.forEach(g => {
        fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'saveGallery', userId, item: g }) });
      });
      return next;
    });
  };
  const deleteGalleryItems = async (ids) => {
    setGallery(prev => prev.filter(g => !ids.has(g.id)));
    const userId = getUserId();
    for (const id of ids) {
      fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deleteGallery', userId, id }) });
    }
    setSelectedGallery(new Set());
    setConfirmDelete(null);
  };
  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;

  const buildPrompt = () => {
    if (photoMode === 'undress') {
      const styles = {
        nude: 'Remove all clothing and replace with bare skin. Keep the exact same crop and framing — do not zoom in, do not crop tighter, do not change the camera distance.',
        lingerie: 'Replace clothes with elegant lingerie (bra and panties). Keep the exact same crop and framing.',
        bikini: 'Replace clothes with a bikini. Keep the exact same crop and framing.',
      };
      return `Inpaint edit: keep this exact photograph unchanged. Same framing, same crop, same camera distance, same pose, same face, same body proportions, same background, same lighting. The only modification is changing the clothing. ${styles[undressStyle] || styles.nude} Do not regenerate, do not reframe, do not change anything else.`;
    }
    let p = (photoMode === 'templates' && selectedTemplate?.prompt) || prompt || 'photo';
    p = p.trim();
    return p;
  };

  const handleGenerate = async () => {
    const needsPhoto = photoMode === 'undress' || (activeMode === 'faceswap' && swapMode === 'upload') || (activeMode === 'deepfake' && deepMode === 'upload');
    if (needsPhoto && !undressPhoto) return;
    if (!needsPhoto && !selectedCharacter && !customPhoto) return;
    const p = buildPrompt();
    setPendingGens(c => c + numImages);
    const genId = crypto.randomUUID();
    setActiveGens(prev => [...prev, { id: genId, type: photoMode, started: Date.now() }]);
    showToast(lang === 'en' ? 'Sent to generation…' : 'Отправлено на генерацию…');
    let images = [];
    try {
      const email = isLoggedIn && userName?.includes('@') ? userName : `anon-${localStorage.getItem('anonId') || (() => { const id = crypto.randomUUID().slice(0,8); localStorage.setItem('anonId', id); return id; })()}@seducecraft.app`;
      const body = { prompt: p, endUserEmail: email, model: selectedModel, n: numImages, size: imageSize, sequential: sequential ? 'auto' : undefined };
      const photos = photoMode === 'undress' ? [undressPhoto] : (customPhoto ? [customPhoto] : (selectedCharacter?.photos || []));
      const refUrls = [];
      const base64s = [];
      for (const photo of photos) {
        if (photo && photo.startsWith('http')) refUrls.push(photo);
        else if (photo && photo.startsWith('data:')) {
          // Upload base64 first to avoid payload limit
          try {
            const upRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64: photo }) });
            if (!upRes.ok) { console.error('Upload failed', await upRes.text()); continue; }
            const upData = await upRes.json();
            if (upData.url) refUrls.push(upData.url);
          } catch (e) { console.error('Upload error', e); }
        }
      }
      // For templates: add template image as second reference for pose/clothing
      if (photoMode === 'templates' && selectedTemplate?.src) {
        refUrls.push(window.location.origin + selectedTemplate.src);
        body.prompt = `IMPORTANT: The face must come ONLY from image_1. Do not use the face from image_2. Replace the face completely with image_1. Use image_2 only for pose, body position, clothing, and background. ${p}`;
      }
      if (base64s.length) body.referenceBase64 = base64s;
      if (refUrls.length) body.references = refUrls;
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 200) || 'Invalid response'); }
      if (!res.ok) {
        const errMsg = data.full?.error?.code 
          ? `${data.full.error.code}: ${data.error}` 
          : (typeof data.error === 'string' ? data.error : JSON.stringify(data.error || data));
        const rid = data.requestId ? ` [id: ${data.requestId}]` : '';
        throw new Error((errMsg + rid).slice(0, 500));
      }
      images = data.images || (data.url ? [{url: data.url}] : []);
      const gens = images.map((img, i) => ({ id: crypto.randomUUID(), title: photoMode === 'undress' ? 'Undress' : (photoMode === 'templates' ? (selectedTemplate?.title?.[lang] || 'Template') : 'Custom') + (images.length>1 ? ` #${i+1}` : ''), prompt: p, characterName: selectedCharacter?.name || 'Photo', src: img.url || img, createdAt: Date.now(), model: selectedModel, size: imageSize }));
      saveGallery(prev => [...gens, ...prev]);
      const cost = calcPhotoCost();
      setSpentCredits(prev => { const next = prev + cost; localStorage.setItem('seducecraft.spent', String(next)); return next; });
      addTx(photoMode === 'undress' ? 'Undress' : (photoMode === 'templates' ? 'Template' : 'Custom'), cost, `${selectedModel === 'xSD5Pro' ? 'Pro' : 'Normal'} ${imageSize}`);
      addNotification(lang === 'en' ? `Generation complete: ${images.length} image(s)` : `Генерация готова: ${images.length} изображений`);
      showToast(lang === 'en' ? 'Generation complete! Added to gallery' : 'Готово! Добавлено в галерею');
      playSound();
      if (isLoggedIn) fetch('/api/balance').then(r => r.json()).then(d => setBalance(d.balance)).catch(() => {});
    } catch (e) {
      const msg = e.message || 'Error';
      const cost = calcPhotoCost();
      onAddCredits(cost);
      addTx('Refund', -cost, 'Generation failed');
      addNotification(lang === 'en' ? `Refunded ${cost} credits` : `Возвращено ${cost} кредитов`);
      showToast(msg.includes('{') ? 'Generation failed — refunded' : msg + ' — refunded');
    }
    setPendingGens(c => Math.max(0, c - (images?.length || numImages)));
    setActiveGens(prev => prev.slice(1));
  };

  const handleVideoGenerate = async () => {
    if (videoMode === 'image' && !videoImage) return;
    if (videoMode !== 'image' && !selectedCharacter) return;
    if (!prompt.trim()) return;
    setPendingGens(c => c + 1);
    setVideoStatus('queued');
    showToast(lang === 'en' ? 'Sent to video generation…' : 'Отправлено на генерацию видео…');
    try {
      const email = isLoggedIn && userName?.includes('@') ? userName : `anon-${localStorage.getItem('anonId') || crypto.randomUUID().slice(0,8)}@seducecraft.app`;
      const photos = videoMode === 'image' ? [videoImage] : (selectedCharacter?.photos || []);
      const refUrls = [];
      for (const photo of photos) {
        if (photo?.startsWith('http')) refUrls.push(photo);
        else if (photo?.startsWith('data:')) {
          try {
            const upRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64: photo }) });
            if (upRes.ok) {
              const upData = await upRes.json();
              if (upData.url) refUrls.push(upData.url);
            }
          } catch {}
        }
      }
      const body = {
        prompt: prompt.trim(),
        endUserEmail: email,
        model: videoMode === 'image' ? 'xW2.7S' : videoModel,
        duration: videoDuration,
        ratio: videoRatio,
        references: videoMode === 'image' ? [] : refUrls,
        image: videoMode === 'image' ? refUrls[0] : undefined,
      };
      setVideoStatus('processing');
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Video generation failed');
      const gen = {
        id: crypto.randomUUID(),
        title: videoMode === 'image' ? 'Image to Video' : 'Video',
        prompt: prompt.trim(),
        characterName: selectedCharacter?.name || 'Video',
        src: data.url,
        type: 'video',
        createdAt: Date.now()
      };
      saveGallery(prev => [gen, ...prev]);
      setSpentCredits(prev => {
        const next = prev + VIDEO_COST;
        localStorage.setItem('seducecraft.spent', String(next));
        return next;
      });
      addTx(videoMode === 'image' ? 'Image to Video' : 'Video', VIDEO_COST);
      addNotification(lang === 'en' ? 'Video generation complete' : 'Видео готово');
      showToast(lang === 'en' ? 'Video added to gallery' : 'Видео добавлено в галерею');
      setVideoStatus('done');
    } catch (e) {
      showToast(e.message || 'Error');
      setVideoStatus('error');
    }
    setPendingGens(c => Math.max(0, c - 1));
  };

  const downloadImage = async (src, name) => {
    try {
      const r = await fetch(src);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (name || 'seducecraft') + (src.includes('.mp4') ? '.mp4' : '.jpg');
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, '_blank');
    }
  };
  const sortedGallery = [...gallery]
    .filter(g => {
      if (gallerySearch && !(g.title?.toLowerCase().includes(gallerySearch.toLowerCase()) || g.characterName?.toLowerCase().includes(gallerySearch.toLowerCase()) || g.prompt?.toLowerCase().includes(gallerySearch.toLowerCase()))) return false;
      if (galleryFilter === 'video') return g.type === 'video';
      if (galleryFilter === 'photo') return g.type !== 'video';
      if (galleryFilter === 'undress') return g.title === 'Undress';
      if (galleryFilter === 'swap') return g.title === 'Face Swap';
      if (galleryFilter === 'template') return g.title && !['Undress','Face Swap','Custom','Video','Image to Video'].includes(g.title) && !g.title.startsWith('Custom');
      if (galleryFilter === 'fav') return g.fav;
      if (galleryRange !== 'all') {
        const now = Date.now();
        const ms = galleryRange === 'hour' ? 3600000 : galleryRange === 'day' ? 86400000 : galleryRange === 'week' ? 604800000 : 2592000000;
        if (now - g.createdAt > ms) return false;
      }
      return true;
    })
    .sort((a, b) => gallerySort === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  const menu = [
    { id: 'home', name: t.home },
    { id: 'characters', name: t.myCharacters },
    { id: 'photo', name: t.photo, subs: [
      { id: 'templates', name: t.templates },
      { id: 'custom', name: t.custom },
      { id: 'undress', name: t.undress },
    ]},
    { id: 'faceswap', name: t.faceSwap },
    { id: 'video', name: t.video },
    { id: 'deepfake', name: t.deepfake },
    { id: 'gallery', name: t.myGallery },
    { id: 'balance', name: lang === 'en' ? 'Balance' : 'Баланс' },
    { id: 'notifications', name: lang === 'en' ? 'Notifications' : 'Уведомления' },
    { id: 'profile', name: lang === 'en' ? 'Profile' : 'Профиль' },
    { id: 'help', name: lang === 'en' ? 'Help' : 'Помощь' },
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
          className={`flex items-center gap-3 px-3 py-2.5 text-sm w-full rounded-xl border transition-all ${
            selectedCharacter
              ? 'border-orange-500/40 bg-zinc-900 hover:border-orange-500/60'
              : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
          }`}
        >
          {selectedCharacter ? (
            <>
              {selectedCharacter.photos?.[0] && (
                <img src={selectedCharacter.photos[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium truncate">{selectedCharacter.name}</div>
                {selectedCharacter.favorite && <div className="text-[10px] text-orange-400">★ Favorite</div>}
              </div>
              <span className="text-zinc-500 text-xs">Change</span>
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
    return !!selectedCharacter || !!customPhoto;
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-md">
          <div className="bg-zinc-900 border border-orange-500/40 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl">
            {toast}
          </div>
        </div>
      )}
      {previewSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewSrc(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img src={previewSrc} alt="" className="max-h-[70vh] mx-auto rounded-xl" />
            <div className="mt-3 flex gap-2">
              <input value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder={lang === 'en' ? 'Edit with prompt...' : 'Редактировать промптом...'} className="flex-1 h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm" onKeyDown={e => e.key === 'Enter' && editGalleryImage()} />
              <button onClick={editGalleryImage} disabled={editing || !editPrompt.trim()} className="px-4 h-10 bg-orange-500 text-white rounded-lg text-sm disabled:opacity-40">{editing ? '...' : 'Edit'}</button>
            </div>
            <div className="flex gap-2 mt-2 justify-center">
              <button onClick={() => downloadImage(previewSrc, 'image')} className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm">Download</button>
              <button onClick={() => { setPreviewSrc(null); setEditPrompt(''); }} className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
      {previewCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewCharacter(null)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            {previewCharacter.photos?.[0] && <img src={previewCharacter.photos[0]} alt="" className="w-full aspect-[3/4] object-cover rounded-xl mb-3" />}
            <div className="font-medium text-center">{previewCharacter.name}</div>
            {previewCharacter.favorite && <div className="text-xs text-orange-400 text-center mt-1">★ Favorite</div>}
            <button onClick={() => setPreviewCharacter(null)} className="mt-3 w-full py-2 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:border-zinc-500">Close</button>
          </div>
        </div>
      )}
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
                <div className="flex justify-end items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCharacterSort('newest')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        characterSort === 'newest'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                          : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {lang === 'en' ? 'New' : 'Новые'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCharacterSort('oldest')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        characterSort === 'oldest'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                          : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {lang === 'en' ? 'Old' : 'Старые'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCharacterFilter(characterFilter === 'favorites' ? 'all' : 'favorites')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      characterFilter === 'favorites'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5l1.8 3.7 4.1.6-3 2.9.7 4.1L8 10.8 4.4 12.8l.7-4.1-3-2.9 4.1-.6L8 1.5z" /></svg>
                    {lang === 'en' ? 'Fav' : 'Избр'}
                  </button>
                </div>
                {[...characters]
                  .filter(c => characterFilter === 'favorites' ? c.favorite : true)
                  .sort((a, b) => characterSort === 'oldest' ? (a.createdAt || 0) - (b.createdAt || 0) : (b.createdAt || 0) - (a.createdAt || 0))
                  .map(c => (
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
            {viewer.type === 'video' || viewer.src?.includes('.mp4') ? (
              <video src={viewer.src} controls className="w-full max-h-[70vh] object-contain rounded-md" />
            ) : (
              <img src={viewer.src} alt="" className="w-full max-h-[70vh] object-contain rounded-md" />
            )}
            {showPrompt && viewer.prompt && (
              <div className="mt-3 p-3 bg-bg-secondary border border-border rounded-lg text-sm text-text-secondary">{viewer.prompt}</div>
            )}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div><div className="font-medium">{viewer.title}</div><div className="text-text-secondary text-xs">{viewer.characterName}</div></div>
              <div className="flex gap-2">
                {viewer.model && <span className="text-xs text-zinc-500">{viewer.model === 'xSD5Pro' ? 'Pro' : 'Normal'}{viewer.size ? ` · ${viewer.size}` : ''}</span>}
                {viewer.prompt && (viewer.title === 'Custom' || viewer.title?.startsWith('Custom') || viewer.type === 'video') && <button onClick={() => setShowPrompt(!showPrompt)} className="px-4 py-2 border border-border rounded-full text-sm hover:border-accent">{showPrompt ? 'Hide' : 'i'}</button>}
                <button onClick={() => downloadImage(viewer.src, viewer.title)} className="btn-glow px-4 py-2 text-white text-sm">{lang === 'en' ? 'Download' : 'Скачать'}</button>
                {!(viewer.type === 'video' || viewer.src?.includes('.mp4')) && (
                  <>
                    <button onClick={() => { setCustomPhoto(viewer.src); setSelectedCharacterId(null); setActiveMode('photo'); setPhotoMode('custom'); setViewer(null); }} className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm">Edit</button>
                    <button onClick={() => { setVideoImage(viewer.src); setActiveMode('video'); setVideoMode('image'); setViewer(null); }} className="px-4 py-2 bg-zinc-700 text-white rounded-full text-sm">Animate</button>
                  </>
                )}
                <button onClick={() => { setViewer(null); setShowPrompt(false); }} className="px-4 py-2 border border-border rounded-full text-sm hover:border-accent">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {galleryPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setGalleryPicker(null)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Select from gallery</h3>
              <button onClick={() => setGalleryPicker(null)} className="text-zinc-500 hover:text-white">×</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto">
              {gallery.filter(g => g.type !== 'video' && !g.src?.includes('.mp4') && !g.src?.includes('video')).map(g => (
                <button key={g.id} onClick={() => {
                  if (galleryPicker === 'swap') setSwapTarget(g.src);
                  else if (galleryPicker === 'video') setVideoImage(g.src);
                  else if (galleryPicker === 'undress') setUndressPhoto(g.src);
                  else if (galleryPicker === 'custom') setCustomPhoto(g.src);
                  setGalleryPicker(null);
                }} className="aspect-[3/4] rounded-lg overflow-hidden border border-zinc-800 hover:border-orange-500">
                  <img src={g.src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {checkoutPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setCheckoutPkg(null)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{lang === 'en' ? 'Confirm purchase' : 'Подтвердить покупку'}</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-orange-500">{checkoutPkg.credits}</div>
              <div className="text-sm text-zinc-400">{lang === 'en' ? 'credits' : 'кредитов'}</div>
              <div className="text-xl mt-2">${checkoutPkg.price}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCheckoutPkg(null)} className="flex-1 py-2 border border-zinc-700 rounded-lg text-sm">{lang === 'en' ? 'Cancel' : 'Отмена'}</button>
              <button onClick={() => handlePurchase(checkoutPkg.id)} disabled={paying} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm disabled:opacity-50">{paying ? '...' : (lang === 'en' ? 'Pay' : 'Оплатить')}</button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-3 text-center">{lang === 'en' ? 'Demo mode — credits added instantly' : 'Демо — кредиты добавятся сразу'}</p>
          </div>
        </div>
      )}
<header className="border-b border-border h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/layer-logo-icon.png" alt="" className="h-11 w-11 object-contain" />
          <img src="/layer-logo.png" alt="Seducecraft" className="h-8 object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen(!langOpen)} className="text-text-secondary hover:text-text-primary flex items-center gap-1">{lang === 'en' ? '🇺🇸' : '🇷🇺'}</button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-20 min-w-[120px]">
                <button onClick={() => { onLangChange('en'); setLangOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-zinc-800">🇺🇸 English</button>
                <button onClick={() => { onLangChange('ru'); setLangOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-zinc-800">🇷🇺 Русский</button>
              </div>
            )}
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-3 text-sm">
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-zinc-400 hover:text-white">
                  🔔
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">{notifications.filter(n => !n.read).length}</span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-30 max-h-80 overflow-hidden">
                    <div className="flex justify-between items-center p-3 border-b border-zinc-800">
                      <span className="text-sm font-medium">{lang === 'en' ? 'Notifications' : 'Уведомления'}</span>
                      <button onClick={() => { setNotifications(prev => { const next = prev.map(n => ({...n, read: true})); localStorage.setItem('seducecraft.notifs', JSON.stringify(next)); return next; }); }} className="text-xs text-zinc-500 hover:text-white">{lang === 'en' ? 'Read all' : 'Прочитать'}</button>
                    </div>
                    <div className="overflow-y-auto max-h-60">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-zinc-500 text-center">{lang === 'en' ? 'No notifications' : 'Нет уведомлений'}</div>
                      ) : notifications.slice(0, 10).map(n => (
                        <div key={n.id} className={`p-3 border-b border-zinc-800 flex justify-between ${n.read ? '' : 'bg-orange-500/5'}`}>
                          <div className="text-sm">{n.msg}</div>
                          <button onClick={() => setNotifications(prev => { const next = prev.filter(x => x.id !== n.id); localStorage.setItem('seducecraft.notifs', JSON.stringify(next)); return next; })} className="text-zinc-600 hover:text-red-400 ml-2">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setActiveMode('profile')} className="hover:text-orange-400 transition-colors">{userName}</button>
              <span className="text-zinc-600">·</span>
              <button onClick={() => setActiveMode('balance')} className="text-orange-400 hover:text-orange-300 transition-colors">
                {balance !== null ? balance : credits} {t.credits}
              </button>
            </div>
          )}
          {!isLoggedIn && <button onClick={onLogin} className="text-sm text-text-secondary hover:text-text-primary">{t.login}</button>}
          {isLoggedIn && <button onClick={onLogout} className="text-sm text-text-secondary hover:text-text-primary">{t.logout}</button>}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-border bg-bg-secondary flex flex-col">
          <nav className="flex-1 py-4">
            {menu.map(({id, name, subs}) => (
              <div key={id}>
                <button onClick={() => setActiveMode(id)} className={`menu-item w-full text-left px-5 py-2.5 text-sm flex items-center justify-between ${activeMode===id ? 'menu-active text-text-primary' : 'text-text-secondary'}`}>
                  <span>{name}</span>
                  {id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                    <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">{notifications.filter(n => !n.read).length}</span>
                  )}
                </button>
                {subs && activeMode === id && (
                  <div className="ml-4 border-l border-zinc-800">
                    {subs.map(s => (
                      <button key={s.id} onClick={() => setPhotoMode(s.id)} className={`w-full text-left px-4 py-1.5 text-xs ${photoMode===s.id ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-border space-y-1">
            {!isAnonymous && <button onClick={onShowTerms} className="text-xs text-text-secondary hover:text-text-primary block">{t.terms}</button>}
            <button onClick={() => onLegal?.('privacy')} className="text-xs text-text-secondary hover:text-text-primary block">Privacy</button>
            <button onClick={() => onLegal?.('cookies')} className="text-xs text-text-secondary hover:text-text-primary block">Cookies</button>
            <button onClick={() => onLegal?.('dmca')} className="text-xs text-text-secondary hover:text-text-primary block">DMCA</button>
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <div className="w-full">
            {activeMode === 'home' && (
              <div className="space-y-6">
                {/* Balance bar */}
                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-orange-500">{balance ?? credits}</div>
                    <div className="text-sm text-zinc-400">{lang === 'en' ? 'credits' : 'кредитов'}</div>
                  </div>
                  <button onClick={() => setActiveMode('balance')} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
                    {lang === 'en' ? 'Top up' : 'Пополнить'}
                  </button>
                </div>

                {/* Promo banner */}
                <div className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{lang === 'en' ? '+25% bonus on first top-up' : '+25% к первому пополнению'}</div>
                    <div className="text-sm text-zinc-400">{lang === 'en' ? 'Limited time offer' : 'Ограниченное предложение'}</div>
                  </div>
                  <button onClick={() => setActiveMode('balance')} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                    {lang === 'en' ? 'Get bonus' : 'Получить'}
                  </button>
                </div>

                {/* Section cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'photo', label: lang === 'en' ? 'Photo' : 'Фото', desc: lang === 'en' ? 'Generate images' : 'Генерация изображений', icon: '🖼️' },
                    { id: 'faceswap', label: 'Face Swap', desc: lang === 'en' ? 'Swap faces' : 'Замена лица', icon: '🔄' },
                    { id: 'video', label: lang === 'en' ? 'Video' : 'Видео', desc: lang === 'en' ? 'Generate videos' : 'Генерация видео', icon: '🎬' },
                    { id: 'deepfake', label: 'DeepFake', desc: lang === 'en' ? 'Face in video' : 'Лицо в видео', icon: '🎭' },
                    { id: 'characters', label: lang === 'en' ? 'Characters' : 'Персонажи', desc: lang === 'en' ? 'Manage faces' : 'Управление лицами', icon: '👤' },
                    { id: 'gallery', label: lang === 'en' ? 'Gallery' : 'Галерея', desc: lang === 'en' ? 'Your creations' : 'Ваши работы', icon: '📁' },
                  ].map(m => (
                    <button key={m.id} onClick={() => setActiveMode(m.id)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-left hover:border-orange-500/50 transition-all group">
                      <div className="text-3xl mb-3">{m.icon}</div>
                      <div className="font-medium group-hover:text-orange-400 transition-colors">{m.label}</div>
                      <div className="text-xs text-zinc-500 mt-1">{m.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Recent templates */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{lang === 'en' ? 'Templates' : 'Шаблоны'}</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {presets.slice(0, 6).map(p => (
                      <button key={p.id} onClick={() => { setActiveMode('photo'); setPhotoMode('templates'); setSelectedTemplate(p); }} className="relative group rounded-xl overflow-hidden">
                        <img src={p.src} alt="" className="aspect-[3/4] w-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeMode === 'characters' && <Characters onRequireTerms={onRequireTerms} termsAccepted={termsAccepted} characters={characters} onSave={saveCharacters} />}
            {activeMode === 'gallery' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">{t.myGallery}</h2>
                  {gallery.length > 0 && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <input value={gallerySearch} onChange={e => setGallerySearch(e.target.value)} placeholder={lang === 'en' ? 'Search prompt, name...' : 'Поиск по промпту...'} className="h-9 bg-bg-secondary border border-border rounded-md px-3 text-sm w-40" />
                      <select value={galleryFilter} onChange={e => setGalleryFilter(e.target.value)} className="h-9 bg-bg-secondary border border-border rounded-md px-2 text-sm">
                        <option value="all">{lang === 'en' ? 'All' : 'Все'}</option>
                        <option value="photo">{lang === 'en' ? 'Photos' : 'Фото'}</option>
                        <option value="video">{lang === 'en' ? 'Videos' : 'Видео'}</option>
                        <option value="undress">Undress</option>
                        <option value="swap">Face Swap</option>
                        <option value="template">{lang === 'en' ? 'Templates' : 'Шаблоны'}</option>
                        <option value="fav">{lang === 'en' ? 'Favorites' : 'Избранное'}</option>
                      </select>
                      <select value={galleryRange} onChange={e => setGalleryRange(e.target.value)} className="h-9 bg-bg-secondary border border-border rounded-md px-2 text-sm">
                        <option value="all">{lang === 'en' ? 'Any time' : 'Всё время'}</option>
                        <option value="hour">{lang === 'en' ? 'Last hour' : 'Последний час'}</option>
                        <option value="day">{lang === 'en' ? 'Last 24h' : 'Сутки'}</option>
                        <option value="week">{lang === 'en' ? 'Last week' : 'Неделя'}</option>
                        <option value="month">{lang === 'en' ? 'Last month' : 'Месяц'}</option>
                      </select>
                      <select value={gallerySort} onChange={e => setGallerySort(e.target.value)} className="h-9 bg-bg-secondary border border-border rounded-md px-2 text-sm">
                        <option value="newest">{lang === 'en' ? 'Newest' : 'Сначала новые'}</option>
                        <option value="oldest">{lang === 'en' ? 'Oldest' : 'Сначала старые'}</option>
                      </select>
                      <button onClick={() => setSelectedGallery(selectedGallery.size === gallery.length ? new Set() : new Set(gallery.map(g => g.id)))} className="h-9 px-3 border border-zinc-700 text-zinc-400 rounded-md text-sm hover:border-zinc-500">
                        {selectedGallery.size === gallery.length ? (lang === 'en' ? 'Deselect all' : 'Снять все') : (lang === 'en' ? 'Select all' : 'Выбрать все')}
                      </button>
                      {selectedGallery.size > 0 && (
                        <>
                          <button onClick={() => {
                            const items = gallery.filter(g => selectedGallery.has(g.id));
                            items.forEach((g, i) => setTimeout(() => downloadImage(g.src, g.title || 'item'), i * 300));
                          }} className="h-9 px-3 border border-zinc-700 text-zinc-300 rounded-md text-sm hover:border-zinc-500">{lang === 'en' ? `Download (${selectedGallery.size})` : `Скачать (${selectedGallery.size})`}</button>
                          <button onClick={() => setConfirmDelete(selectedGallery)} className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">{lang === 'en' ? `Delete (${selectedGallery.size})` : `Удалить (${selectedGallery.size})`}</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {gallery.length === 0 ? <p className="text-text-secondary">{t.galleryEmpty}</p> : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sortedGallery.map(g => (
                      <div key={g.id} className="relative group border border-border rounded-lg overflow-hidden bg-bg-secondary">
                        <label className="absolute top-2 left-2 z-10"><input type="checkbox" checked={selectedGallery.has(g.id)} onChange={() => { const n = new Set(selectedGallery); n.has(g.id) ? n.delete(g.id) : n.add(g.id); setSelectedGallery(n); }} className="w-4 h-4" /></label>
                        <button onClick={() => setViewer(g)} className="text-left w-full">
                          {g.type === 'video' || g.src?.includes('.mp4') ? (
                            <video src={g.src} controls className="aspect-[3/4] w-full object-cover" />
                          ) : (
                            <img src={g.src} alt="" className="aspect-[3/4] w-full object-cover" />
                          )}
                          <div className="p-3 text-sm"><div className="font-medium">{g.title}</div><div className="text-xs text-text-secondary">{g.characterName}</div>{g.model && <div className="text-[10px] text-zinc-500">{g.model === 'xSD5Pro' ? 'Pro' : 'Normal'} · {g.size}</div>}</div>
                        </button>
                        <button onClick={() => setConfirmDelete(new Set([g.id]))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600 text-white text-xs rounded flex items-center justify-center">×</button>
                        <button onClick={() => saveGallery(prev => prev.map(x => x.id === g.id ? {...x, fav: !x.fav} : x))} className={`absolute top-2 right-10 opacity-0 group-hover:opacity-100 w-6 h-6 text-xs rounded flex items-center justify-center ${g.fav ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300'}`}>★</button>
                      </div>
                      ))}
                    </div>
                )}
              </>
            )}
            {activeMode === 'faceswap' && (
              <div className="w-full max-w-7xl mx-auto py-6 px-4">
                <h2 className="text-2xl font-semibold mb-6 text-center">{lang === 'en' ? 'Face Swap' : 'Замена лица'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">{lang === 'en' ? 'Source face' : 'Лицо'}</label>
                    <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center min-h-[400px]">
                      {swapSource ? <img src={swapSource} alt="" className="max-h-80 mx-auto rounded-lg mb-2" /> : <div className="text-4xl mb-2">👤</div>}
                      <label className="text-orange-400 text-sm cursor-pointer">
                        {lang === 'en' ? 'Upload face' : 'Загрузить лицо'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const r = new FileReader();
                          r.onload = () => setSwapSource(r.result);
                          r.readAsDataURL(f);
                        }} />
                      </label>
                      {characters.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-zinc-500 mb-2">{lang === 'en' ? 'or from characters' : 'или из персонажей'}</p>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {characters.slice(0, 6).map(c => (
                              <button key={c.id} onClick={() => setSwapSource(c.photos?.[0])} className={`w-20 h-20 rounded-full overflow-hidden border-2 ${swapSource === c.photos?.[0] ? 'border-orange-500' : 'border-zinc-700'}`}>
                                {c.photos?.[0] && <img src={c.photos[0]} alt="" className="w-full h-full object-cover" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">{lang === 'en' ? 'Target photo' : 'Целевое фото'}</label>
                    <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center min-h-[400px]">
                      {swapTarget ? <img src={swapTarget} alt="" className="max-h-80 mx-auto rounded-lg mb-2" /> : <div className="text-4xl mb-2">🖼️</div>}
                      <label className="text-orange-400 text-sm cursor-pointer">
                        {lang === 'en' ? 'Upload target' : 'Загрузить цель'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const r = new FileReader();
                          r.onload = () => setSwapTarget(r.result);
                          r.readAsDataURL(f);
                        }} />
                      </label>
                      {gallery.filter(g => g.type !== 'video').length > 0 && (
                        <div className="mt-3">
                          <button onClick={() => setGalleryPicker('swap')} className="text-xs text-orange-400 hover:text-orange-300 mb-2">{lang === 'en' ? 'or from gallery' : 'или из галереи'}</button>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {gallery.filter(g => g.type !== 'video' && !g.src?.includes('.mp4') && !g.src?.includes('video')).slice(0, 6).map(g => (
                              <button key={g.id} onClick={() => setSwapTarget(g.src)} className={`w-24 h-28 rounded-lg overflow-hidden border-2 ${swapTarget === g.src ? 'border-orange-500' : 'border-zinc-700'}`}>
                                <img src={g.src} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!swapSource || !swapTarget) return;
                    setPendingGens(c => c + 1);
                    showToast(lang === 'en' ? 'Face swap started…' : 'Замена лица запущена…');
                    try {
                      const ensureUrl = async (img) => {
                        if (!img) return null;
                        if (img.startsWith('http')) return img;
                        if (img.startsWith('data:')) {
                          const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64: img }) });
                          const d = await res.json();
                          return d.url;
                        }
                        return null;
                      };
                      const srcUrl = await ensureUrl(swapSource);
                      const tgtUrl = await ensureUrl(swapTarget);
                      if (!srcUrl || !tgtUrl) throw new Error('Failed to prepare images');
                      const body = {
                        prompt: 'Take the face from image_1 and place it onto the person in image_2. Match the face identity exactly from image_1. Keep the pose, body, clothing, lighting and background from image_2 unchanged. Seamless face replacement, natural skin tone match.',
                        model: selectedModel,
                        n: 1,
                        size: selectedModel === 'xSD5Pro' ? '1K' : imageSize,
                        references: [srcUrl, tgtUrl],
                        endUserEmail: `anon@seducecraft.app`,
                      };
                      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Failed');
                      const gen = { id: crypto.randomUUID(), title: 'Face Swap', prompt: body.prompt, characterName: 'Swap', src: data.url || data.images?.[0]?.url || data.images?.[0], createdAt: Date.now(), model: selectedModel, size: selectedModel === 'xSD5Pro' ? '1K' : imageSize };
                      saveGallery(prev => [gen, ...prev]);
                      const cost = calcPhotoCost();
                      setSpentCredits(prev => { const next = prev + cost; localStorage.setItem('seducecraft.spent', String(next)); return next; });
                      addTx('Face Swap', cost, `Pro ${imageSize}`);
                      addNotification(lang === 'en' ? 'Face swap complete' : 'Замена лица готова');
                      showToast(lang === 'en' ? 'Face swap done' : 'Замена готова');
                    } catch (e) {
                      showToast(e.message || 'Error');
                    }
                    setPendingGens(c => Math.max(0, c - 1));
                  }}
                  disabled={!swapSource || !swapTarget}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 hover:brightness-110 disabled:opacity-40"
                >
                  {pendingGens > 0 ? (lang === 'en' ? `Swapping (${pendingGens})` : `Замена (${pendingGens})`) : (lang === 'en' ? 'Swap Face' : 'Заменить лицо')}
                </button>
                <div className="text-xs text-zinc-500 text-center mt-2">~{calcPhotoCost()} token{calcPhotoCost() > 1 ? 's' : ''}</div>
                <div className="flex justify-center gap-2 mt-3">
                  {[{id:'xSD4.5', label:'Normal'},{id:'xSD5Pro', label:'Pro'}].map(m => (
                    <button key={m.id} onClick={() => setSelectedModel(m.id)} className={`px-3 py-1.5 rounded-lg text-xs ${selectedModel===m.id ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-400'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeMode === 'balance' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">{lang === 'en' ? 'Balance' : 'Баланс'}</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                  <div className="text-sm text-zinc-500 mb-1">{lang === 'en' ? 'Current balance' : 'Текущий баланс'}</div>
                  <div className="text-4xl font-bold text-orange-500">{balance ?? credits} <span className="text-lg text-zinc-400">{lang === 'en' ? 'credits' : 'кредитов'}</span></div>
                  <div className="mt-3 text-sm text-zinc-400">
                    📷 {Math.floor((balance ?? credits) / PHOTO_COST)} {lang === 'en' ? 'photos' : 'фото'} · 🎬 {Math.floor((balance ?? credits) / VIDEO_COST)} {lang === 'en' ? 'videos' : 'видео'}
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-4">{lang === 'en' ? 'Top up' : 'Пополнить'}</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 100, credits: 100, price: 9.99 },
                    { id: 500, credits: 525, price: 39.99 },
                    { id: 1000, credits: 1100, price: 69.99 },
                  ].map(pkg => (
                    <button key={pkg.id} onClick={() => setCheckoutPkg(pkg)} disabled={paying} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-orange-500/50 transition-colors relative disabled:opacity-50">
                      {pkg.credits > pkg.id && <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">+{pkg.credits - pkg.id}</div>}
                      <div className="text-xl font-bold">{pkg.credits}</div>
                      <div className="text-xs text-zinc-500">{lang === 'en' ? 'credits' : 'кредитов'}</div>
                      <div className="text-sm text-orange-400 mt-1">${pkg.price}</div>
                    </button>
                  ))}
                </div>
                <h3 className="text-lg font-medium mb-4">{lang === 'en' ? 'Referral' : 'Рефералка'}</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
                  <div className="text-sm text-zinc-400 mb-2">{lang === 'en' ? 'Your code' : 'Ваш код'}</div>
                  <div className="flex gap-2">
                    <input value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder={lang === 'en' ? 'Enter or generate' : 'Введите или создайте'} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm" />
                    <button onClick={() => { const code = crypto.randomUUID().slice(0, 8).toUpperCase(); setReferralCode(code); localStorage.setItem('seducecraft.ref', code); }} className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm">{lang === 'en' ? 'Generate' : 'Создать'}</button>
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">{lang === 'en' ? 'Share code. Both get +50 credits when used.' : 'Поделитесь кодом. Оба получат +50 кредитов.'}</div>
                </div>
                <h3 className="text-lg font-medium mb-4">{lang === 'en' ? 'History' : 'История'}</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm">
                  {transactions.length === 0 ? (
                    <div className="text-zinc-500">{lang === 'en' ? 'No transactions yet' : 'Транзакций пока нет'}</div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.slice(0, 20).map(tx => (
                        <div key={tx.id} className="flex justify-between items-center py-1 border-b border-zinc-800 last:border-0">
                          <div>
                            <span className="text-zinc-300">{tx.desc}</span>
                            {tx.details && <span className="text-zinc-500 text-xs ml-2">{tx.details}</span>}
                          </div>
                          <span className="text-zinc-500 text-xs">{new Date(tx.at).toLocaleString()}</span>
                          <span className="text-orange-400">-{tx.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeMode === 'active' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">{lang === 'en' ? 'Active generations' : 'Активные генерации'}</h2>
                {activeGens.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-500">{lang === 'en' ? 'No active generations' : 'Нет активных генераций'}</div>
                ) : (
                  <div className="space-y-3">
                    {activeGens.map(g => (
                      <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{g.type}</span>
                          <span className="text-xs text-zinc-500">{Math.round((Date.now() - g.started) / 1000)}s</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 animate-pulse" style={{width: '60%'}} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeMode === 'notifications' && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">{lang === 'en' ? 'Notifications' : 'Уведомления'}</h2>
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={() => { setNotifications(prev => { const next = prev.map(n => ({...n, read: true})); localStorage.setItem('seducecraft.notifs', JSON.stringify(next)); return next; }); }} className="text-sm text-zinc-400 hover:text-white">{lang === 'en' ? 'Read all' : 'Прочитать все'}</button>
                      <button onClick={() => { setNotifications([]); localStorage.setItem('seducecraft.notifs', '[]'); }} className="text-sm text-red-400 hover:text-red-300">{lang === 'en' ? 'Clear all' : 'Очистить'}</button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {pendingGens > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span>{lang === 'en' ? `${pendingGens} generation(s) in progress` : `${pendingGens} генераций в процессе`}</span>
                    </div>
                  )}
                  {notifications.length === 0 && pendingGens === 0 && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-500">{lang === 'en' ? 'No notifications' : 'Нет уведомлений'}</div>
                  )}
                  {notifications.map(n => (
                    <div key={n.id} className={`bg-zinc-900 border rounded-xl p-4 flex items-center justify-between ${n.read ? 'border-zinc-800' : 'border-orange-500/30'}`}>
                      <div>
                        <div className={n.read ? 'text-zinc-400' : 'text-white'}>{n.msg}</div>
                        <div className="text-xs text-zinc-600">{new Date(n.time).toLocaleString()}</div>
                      </div>
                      <button onClick={() => { setNotifications(prev => { const next = prev.filter(x => x.id !== n.id); localStorage.setItem('seducecraft.notifs', JSON.stringify(next)); return next; }); }} className="text-zinc-600 hover:text-red-400">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeMode === 'profile' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">{lang === 'en' ? 'Profile' : 'Профиль'}</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">{lang === 'en' ? 'Username' : 'Имя'}</div>
                    <div className="font-medium">{userName || 'Anonymous'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">{lang === 'en' ? 'Login code' : 'Код входа'}</div>
                    <div className="font-mono text-orange-400">{localStorage.getItem('seducecraft.anonCode') || '—'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">{lang === 'en' ? 'Characters' : 'Персонажей'}</div>
                    <div className="font-medium">{characters.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">{lang === 'en' ? 'Generations' : 'Генераций'}</div>
                    <div className="font-medium">{gallery.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">{lang === 'en' ? 'Credits spent' : 'Потрачено кредитов'}</div>
                    <div className="font-medium text-orange-400">{spentCredits}</div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="text-sm text-zinc-500 mb-1">{lang === 'en' ? 'Language' : 'Язык'}</div>
                    <div className="flex gap-2">
                      <button onClick={() => onLangChange('en')} className={`px-4 py-2 rounded-lg text-sm ${lang==='en' ? 'bg-orange-500 text-white' : 'border border-zinc-700'}`}>EN</button>
                      <button onClick={() => onLangChange('ru')} className={`px-4 py-2 rounded-lg text-sm ${lang==='ru' ? 'bg-orange-500 text-white' : 'border border-zinc-700'}`}>RU</button>
                    </div>
                  </div>
                  <button onClick={() => { if (confirm(lang === 'en' ? 'Delete all data?' : 'Удалить все данные?')) { localStorage.clear(); window.location.reload(); } }} className="text-sm text-red-400 hover:text-red-300">{lang === 'en' ? 'Delete account data' : 'Удалить данные аккаунта'}</button>
                </div>
              </div>
            )}
            {activeMode === 'help' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">{lang === 'en' ? 'Help' : 'Помощь'}</h2>
                <div className="space-y-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="font-medium mb-2">{lang === 'en' ? 'How to create a character?' : 'Как создать персонажа?'}</div>
                    <div className="text-sm text-zinc-400">{lang === 'en' ? 'Go to My Characters → Create character → Upload 1-5 clear face photos. More photos = better consistency.' : 'Перейдите в Мои персонажи → Создать → Загрузите 1-5 чётких фото лица. Больше фото = лучше консистентность.'}</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="font-medium mb-2">{lang === 'en' ? 'How to generate?' : 'Как генерировать?'}</div>
                    <div className="text-sm text-zinc-400">{lang === 'en' ? 'Select a character, choose a template or write a prompt in Custom, click Generate. Results appear in Gallery.' : 'Выберите персонажа, выберите шаблон или напишите промпт в Custom, нажмите Генерировать. Результаты появятся в Галерее.'}</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="font-medium mb-2">{lang === 'en' ? 'Face Swap tips' : 'Советы по Face Swap'}</div>
                    <div className="text-sm text-zinc-400">{lang === 'en' ? 'Use a clear front-facing face as source. Target should have similar lighting. Try Pro model for better quality.' : 'Используйте чёткое лицо анфас как источник. Цель должна иметь похожее освещение. Попробуйте Pro модель для лучшего качества.'}</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="font-medium mb-2">{lang === 'en' ? 'Undress tips' : 'Советы по Undress'}</div>
                    <div className="text-sm text-zinc-400">{lang === 'en' ? 'Works best with full-body or half-body photos. Face-only will not work well.' : 'Лучше работает с фото в полный рост или по пояс. Только лицо работает плохо.'}</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="font-medium mb-2">{lang === 'en' ? 'Pricing' : 'Цены'}</div>
                    <div className="text-sm text-zinc-400">{lang === 'en' ? 'Normal: 1-3 tokens. Pro: 2-4 tokens. Video: 5-15 tokens. Price shown before generation.' : 'Normal: 1-3 токена. Pro: 2-4 токена. Видео: 5-15 токенов. Цена показывается перед генерацией.'}</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="font-medium mb-2">{lang === 'en' ? 'Lost your code?' : 'Потеряли код?'}</div>
                    <div className="text-sm text-zinc-400">{lang === 'en' ? 'Your login code is shown in Profile. Save it to access your data later.' : 'Ваш код входа показан в Профиле. Сохраните его для доступа к данным.'}</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="font-medium mb-2">{lang === 'en' ? 'Contact' : 'Контакт'}</div>
                    <div className="text-sm text-zinc-400">Telegram: @seducecraft_support</div>
                  </div>
                </div>
              </div>
            )}
            {activeMode === 'photo' && (
              <>
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  <TabBtn active={photoMode==='templates'} onClick={() => setPhotoMode('templates')}>{t.templates}</TabBtn>
                  <TabBtn active={photoMode==='custom'} onClick={() => setPhotoMode('custom')}>{t.custom}</TabBtn>
                  <TabBtn active={photoMode==='undress'} onClick={() => { setPhotoMode('undress'); setSelectedTemplate(null); }}>{t.undress}</TabBtn>
                </div>

                {photoMode === 'undress' && (
                  <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-xl font-semibold mb-1">AI Photo Undress</h2>
                    <p className="text-sm text-zinc-500 mb-6">{lang === 'en' ? 'Upload a full-body photo to generate an undressed version' : 'Загрузите фото в полный рост для генерации'}</p>
                    <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-10 hover:border-orange-500/40 transition-colors mb-6">
                      {undressPhoto ? (
                        <img src={undressPhoto} alt="" className="max-h-48 mx-auto rounded-lg mb-3" />
                      ) : (
                        <div className="text-orange-500 text-5xl mb-3">👤</div>
                      )}
                      <p className="text-zinc-300 mb-1">{lang === 'en' ? 'Drop a full-body photo here' : 'Перетащите фото сюда'}</p>
                      <p className="text-xs text-zinc-600 mb-3">JPG, PNG · Max 10MB</p>
                      <label className="text-orange-400 text-sm cursor-pointer hover:text-orange-300">
                        {lang === 'en' ? 'or click to browse' : 'или нажмите для выбора'}
                        <input type="file" accept="image/*" onChange={e => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const reader = new FileReader();
                          reader.onload = () => setUndressPhoto(reader.result);
                          reader.readAsDataURL(f);
                        }} className="hidden" />
                      </label>
                      {gallery.filter(g => g.type !== 'video').length > 0 && (
                        <div className="mt-3">
                          <button onClick={() => setGalleryPicker('undress')} className="text-xs text-orange-400 hover:text-orange-300 mb-2">{lang === 'en' ? 'or pick from gallery' : 'или выберите из галереи'}</button>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {gallery.filter(g => g.type !== 'video').slice(0, 8).map(g => (
                              <button key={g.id} onClick={() => setUndressPhoto(g.src)} className={`w-12 h-16 rounded overflow-hidden border-2 ${undressPhoto === g.src ? 'border-orange-500' : 'border-zinc-700'}`}>
                                <img src={g.src} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center gap-2 mb-4">
                      {[{id:'nude',label:'Nude'},{id:'lingerie',label:'Lingerie'},{id:'bikini',label:'Bikini'}].map(s => (
                        <button key={s.id} onClick={() => setUndressStyle(s.id)} className={`px-4 py-2 rounded-full text-sm ${undressStyle===s.id ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-400'}`}>{s.label}</button>
                      ))}
                    </div>
                    <div className="flex justify-center gap-6 mb-6">
                      <div className="text-center">
                        <img src="/examples/full.jpg" alt="" className="w-20 h-28 object-cover object-top rounded-lg mb-1 border border-zinc-700" />
                        <span className="text-[10px] text-zinc-500 uppercase">Full body</span>
                      </div>
                      <div className="text-center">
                        <img src="/examples/half.jpg" alt="" className="w-20 h-28 object-cover object-top rounded-lg mb-1 border border-zinc-700" />
                        <span className="text-[10px] text-zinc-500 uppercase">Half body</span>
                      </div>
                      <div className="text-center relative">
                        <img src="/examples/face.jpg" alt="" className="w-20 h-28 object-cover object-top rounded-lg mb-1 border border-zinc-700 brightness-50" />
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-2xl font-bold -mt-2">✕</div>
                        <span className="text-[10px] text-zinc-500 uppercase">Face only</span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 mb-3">~{calcPhotoCost()} token{calcPhotoCost() > 1 ? 's' : ''}</div>
                    <div className="flex justify-center gap-3 mb-4">
                      <span className="text-sm text-orange-400 font-medium">Pro</span>
                      <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
                        {['1K','1.5K','2K'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={handleGenerate} disabled={!canGenerate()} className="px-10 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 hover:brightness-110 disabled:opacity-40">
                      ✦ {pendingGens > 0 ? `${t.generating} (${pendingGens})` : t.generate}
                    </button>
                    {gallery.filter(g => g.title === 'Undress').length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs uppercase tracking-wider text-zinc-500">Recent</p>
                          <button onClick={() => setActiveMode('gallery')} className="text-xs text-orange-400 hover:text-orange-300">→ Gallery</button>
                        </div>
                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
                          {gallery.filter(g => g.title === 'Undress').slice(0, 8).map(g => (
                            <button key={g.id} onClick={() => { setPreviewSrc(g.src); }} className="aspect-[3/4] rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-500/50">
                              <img src={g.src} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {photoMode === 'custom' && (
                  <>
                  <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_340px] gap-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                      {customPhoto && (
                        <div className="mb-3">
                          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Photo</p>
                          <img src={customPhoto} alt="" className="w-full aspect-[3/4] object-cover rounded-lg mb-2" />
                          <button onClick={() => setCustomPhoto(null)} className="text-xs text-zinc-500 hover:text-zinc-300">Clear</button>
                        </div>
                      )}
                      {!customPhoto && (
                        <label className="mb-3 block">
                          <span className="text-xs uppercase tracking-wider text-zinc-500">Or upload photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const r = new FileReader();
                            r.onload = () => { setCustomPhoto(r.result); setSelectedCharacterId(null); };
                            r.readAsDataURL(f);
                          }} />
                          <div className="mt-1 h-10 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-sm text-zinc-400 cursor-pointer hover:border-zinc-500">Upload</div>
                        </label>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Character</p>
                        <div className="flex gap-1">
                          <button onClick={() => setCharacterSort('newest')} className={`px-2 py-0.5 rounded text-[10px] ${characterSort==='newest' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>New</button>
                          <button onClick={() => setCharacterSort('oldest')} className={`px-2 py-0.5 rounded text-[10px] ${characterSort==='oldest' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Old</button>
                          <button onClick={() => setCharacterFilter(characterFilter==='favorites'?'all':'favorites')} className={`px-2 py-0.5 rounded text-[10px] ${characterFilter==='favorites' ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-500 hover:text-zinc-300'}`}>★</button>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {characters.length === 0 ? (
                          <button onClick={() => setActiveMode('characters')} className="text-sm text-orange-400 hover:text-orange-300">Create a character first</button>
                        ) : [...characters]
                          .filter(c => characterFilter === 'favorites' ? c.favorite : true)
                          .sort((a, b) => characterSort === 'oldest' ? (a.createdAt || 0) - (b.createdAt || 0) : (b.createdAt || 0) - (a.createdAt || 0))
                          .map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              if (selectedCharacterId === c.id) {
                                setPreviewCharacter(c);
                              } else {
                                setSelectedCharacterId(c.id);
                              }
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                              selectedCharacterId === c.id
                                ? 'border-orange-500/60 bg-zinc-800'
                                : 'border-zinc-800 hover:border-zinc-600'
                            }`}
                          >
                            {c.photos?.[0] && <img src={c.photos[0]} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{c.name}</div>
                              {c.favorite && <div className="text-[10px] text-orange-400">★ Fav</div>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <textarea
                          value={prompt}
                          onChange={e => setPrompt(e.target.value)}
                          placeholder={t.placeholder}
                          className="w-full h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 pr-24 focus:border-orange-500/50 focus:outline-none resize-none"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!prompt.trim()) return;
                            showToast(lang === 'en' ? 'Improving…' : 'Улучшаю…');
                            try {
                              const r = await fetch('/api/improve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
                              const d = await r.json();
                              if (d.improved) setPrompt(d.improved);
                              setToast(null);
                            } catch (e) { showToast('Improve failed'); }
                          }}
                          className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 hover:border-orange-500/50 hover:text-white"
                        >
                          ✦ Improve
                        </button>
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4">
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Settings</p>
                      <div>
                        <p className="text-xs text-zinc-500 mb-2">Model</p>
                        <div className="flex flex-col gap-2">
                          {[{id:'xSD4.5', label:'Normal'},{id:'xSD5Pro', label:'Pro'}].map(m => (
                            <button key={m.id} type="button" onClick={() => { setSelectedModel(m.id); setImageSize(m.id === 'xSD5Pro' ? '1K' : '1920x1920'); }}
                              className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${selectedModel===m.id ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'border border-zinc-700 text-zinc-300 hover:border-orange-500/50'}`}>
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-2">Size</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(selectedModel === 'xSD5Pro' 
                            ? ['1K','1.5K','2K'] 
                            : ['1920x1920','2048x2048','2560x2560','3072x3072']
                          ).map(s => (
                            <button key={s} type="button" onClick={() => setImageSize(s)}
                              className={`px-2 py-1.5 rounded text-xs ${imageSize===s ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                              {s.replace('x','×')}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-500 mb-2"><span>Images</span><span className="text-orange-400 font-medium">{numImages}</span></div>
                        <input type="range" min="1" max="8" value={numImages} onChange={e => setNumImages(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.7)]" />
                      </div>
                      <label className={`flex items-center gap-2 text-sm ${selectedModel === 'xSD5Pro' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        <input type="checkbox" checked={sequential && selectedModel !== 'xSD5Pro'} onChange={e => setSequential(e.target.checked)} disabled={selectedModel === 'xSD5Pro'} className="accent-orange-500" />
                        Sequential {selectedModel === 'xSD5Pro' && <span className="text-[10px]">(not for Pro)</span>}
                      </label>
                      <div className="text-xs text-zinc-500 text-center">
                        ~{calcPhotoCost()} token{calcPhotoCost() > 1 ? 's' : ''}
                      </div>
                      <button onClick={handleGenerate} disabled={!canGenerate()} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 hover:brightness-110 disabled:opacity-40">
                        {pendingGens > 0 ? `${t.generating} (${pendingGens})` : t.generate}
                      </button>
                      <button onClick={() => setActiveMode('gallery')} className="w-full mt-2 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors">
                        → Open Gallery
                      </button>
                    </div>
                  </div>
                  {gallery.filter(g => g.title?.startsWith('Custom')).length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Recent</p>
                        <button onClick={() => setActiveMode('gallery')} className="text-xs text-orange-400 hover:text-orange-300">→ Gallery</button>
                      </div>
                      <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
                        {gallery.filter(g => g.title?.startsWith('Custom')).slice(0, 6).map(g => (
                          <button key={g.id} onClick={() => setViewer(g)} className="rounded-lg overflow-hidden border border-zinc-800">
                            <img src={g.src} alt="" className="aspect-[3/4] w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  </>
                )}

                {photoMode === 'templates' && (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        <button onClick={() => setTemplateSort('az')} className={`px-2 py-1 rounded text-xs ${templateSort==='az'?'bg-zinc-700 text-white':'text-zinc-500'}`}>A–Z</button>
                        <button onClick={() => setTemplateSort('za')} className={`px-2 py-1 rounded text-xs ${templateSort==='za'?'bg-zinc-700 text-white':'text-zinc-500'}`}>Z–A</button>
                      </div>
                    </div>
                    <div className="mb-4 relative">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCatOpen(o => !o)} className="px-3 py-1.5 rounded-lg border border-zinc-700 text-sm text-zinc-200 hover:border-zinc-500">
                          {lang === 'en' ? 'Categories' : 'Категории'} {templateCategory.length ? `(${templateCategory.length})` : ''} ▾
                        </button>
                        {templateCategory.length > 0 && (
                          <button onClick={() => setTemplateCategory([])} className="text-xs text-zinc-500 hover:text-zinc-300">Clear</button>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {templateCategory.map(c => (
                            <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">{c}</span>
                          ))}
                        </div>
                      </div>
                      {catOpen && (
                        <div className="absolute z-20 mt-2 w-72 max-h-80 overflow-hidden bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl">
                          <input autoFocus value={catSearch} onChange={e => setCatSearch(e.target.value)} placeholder={lang === 'en' ? 'Search categories...' : 'Поиск категорий...'} className="w-full px-3 py-2 bg-zinc-800 border-b border-zinc-700 text-sm outline-none" />
                          <div className="max-h-64 overflow-y-auto p-1">
                            <button onClick={() => { setTemplateCategory([]); setCatOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm ${templateCategory.length===0 ? 'bg-orange-500 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}>{lang === 'en' ? 'All' : 'Все'}</button>
                            {Array.from(new Set(presets.flatMap(p => p.tags || []))).sort().filter(c => c.toLowerCase().includes(catSearch.toLowerCase())).map(cat => (
                              <button key={cat} onClick={() => setTemplateCategory(prev => prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat])} className={`w-full text-left px-3 py-1.5 rounded text-sm ${templateCategory.includes(cat) ? 'bg-orange-500/30 text-orange-200' : 'hover:bg-zinc-800 text-zinc-300'}`}>
                                {templateCategory.includes(cat) ? '✓ ' : ''}{cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6 mb-6">
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs uppercase tracking-wider text-zinc-500">Character</p>
                          <div className="flex gap-1">
                            <button onClick={() => setCharacterSort('newest')} className={`px-2 py-0.5 rounded text-[10px] ${characterSort==='newest' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>New</button>
                            <button onClick={() => setCharacterSort('oldest')} className={`px-2 py-0.5 rounded text-[10px] ${characterSort==='oldest' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Old</button>
                            <button onClick={() => setCharacterFilter(characterFilter==='favorites'?'all':'favorites')} className={`px-2 py-0.5 rounded text-[10px] ${characterFilter==='favorites' ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-500 hover:text-zinc-300'}`}>★</button>
                          </div>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {characters.length === 0 ? (
                            <button onClick={() => setActiveMode('characters')} className="text-sm text-orange-400 hover:text-orange-300">Create a character first</button>
                          ) : [...characters]
                            .filter(c => characterFilter === 'favorites' ? c.favorite : true)
                            .sort((a, b) => characterSort === 'oldest' ? (a.createdAt || 0) - (b.createdAt || 0) : (b.createdAt || 0) - (a.createdAt || 0))
                            .map(c => (
                            <button
                              key={c.id}
                              onClick={() => setSelectedCharacterId(c.id)}
                              className={`w-full flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                                selectedCharacterId === c.id
                                  ? 'border-orange-500/60 bg-zinc-800'
                                  : 'border-zinc-800 hover:border-zinc-600'
                              }`}
                            >
                              {c.photos?.[0] && <img src={c.photos[0]} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{c.name}</div>
                                {c.favorite && <div className="text-[10px] text-orange-400">★ Fav</div>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[...presets.filter(p => templateCategory.length === 0 || templateCategory.every(c => p.tags?.includes(c)))].sort((a,b) => templateSort==='za' ? (b.title?.en||'').localeCompare(a.title?.en||'') : (a.title?.en||'').localeCompare(b.title?.en||'')).map(p => (
                        <button key={p.id} type="button" onClick={() => setSelectedTemplate(p)} 
                          className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left ${selectedTemplate?.id === p.id ? 'ring-2 ring-orange-500 scale-[1.02]' : 'hover:scale-[1.02] hover:ring-1 hover:ring-zinc-600'}`}>
                          <img src={p.src} alt="" className="aspect-[3/4] w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                            <div className="text-sm font-medium text-white">{p.title.en || p.title[lang]}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.tags?.slice(0, 10).map(t => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white/20 text-white/80 rounded backdrop-blur-sm">{t}</span>
                              ))}
                            </div>
                          </div>
                          {selectedTemplate?.id === p.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedTemplate && (
                      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 h-fit sticky top-4">
                        <div className="text-center">
                          <div className="text-xs text-zinc-500 mb-1">Selected</div>
                          <div className="font-medium">{selectedTemplate.title[lang] || selectedTemplate.title.en}</div>
                        </div>
                        <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl">
                          {[{id:'xSD4.5', label:'Normal'},{id:'xSD5Pro', label:'Pro'}].map(m => (
                            <button key={m.id} type="button" onClick={() => { setSelectedModel(m.id); setImageSize(m.id === 'xSD5Pro' ? '1K' : '1920x1920'); }}
                              className={`flex-1 py-2 rounded-lg text-sm transition-all ${selectedModel===m.id ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>
                              {m.label}
                            </button>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-2">Size</p>
                          <div className="flex gap-1 flex-wrap">
                            {(selectedModel === 'xSD5Pro' ? ['1K','1.5K','2K'] : ['1920x1920','2048x2048']).map(s => (
                              <button key={s} type="button" onClick={() => setImageSize(s)}
                                className={`px-2 py-1 rounded text-xs ${imageSize===s ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-400'}`}>
                                {s.replace('x','×')}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-zinc-500 mb-2"><span>Images</span><span className="text-white font-medium">{numImages}</span></div>
                          <input type="range" min="1" max="8" value={numImages} onChange={e => setNumImages(Number(e.target.value))} className="w-full accent-orange-500 h-2" />
                        </div>
                        <div className="text-xs text-zinc-500 text-center py-2 bg-zinc-800 rounded-lg">~{calcPhotoCost()} token{calcPhotoCost() > 1 ? 's' : ''}</div>
                        <button onClick={handleGenerate} disabled={!canGenerate()} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 hover:brightness-110 disabled:opacity-40 transition-all">
                          ✦ {pendingGens > 0 ? `${t.generating} (${pendingGens})` : t.generate}
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                )}
              </>
            )}
            {activeMode === 'video' && (
              <>
              <div className="max-w-5xl mx-auto py-6">
                <h2 className="text-2xl font-semibold mb-4 text-center">{t.video || (lang === 'en' ? 'Video' : 'Видео')}</h2>
                <div className="flex justify-center gap-2 mb-6">
                  {[
                    { id: 'text', label: lang === 'en' ? 'Text to Video' : 'Текст в видео' },
                    { id: 'image', label: lang === 'en' ? 'Image to Video' : 'Фото в видео' },
                    { id: 'templates', label: lang === 'en' ? 'Templates' : 'Шаблоны' },
                  ].map(m => (
                    <button key={m.id} onClick={() => setVideoMode(m.id)} className={`px-4 py-2 rounded-full text-sm ${videoMode===m.id ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-300'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {videoMode === 'templates' && (
                  <div className="mb-6">
                    <div className="flex gap-2 mb-4 justify-center">
                      {['all', 'motion', 'pose'].map(cat => (
                        <button key={cat} onClick={() => setTemplateCategory(prev => Array.isArray(prev) && prev.includes(cat) ? prev.filter(x => x !== cat) : [cat])} className={`px-3 py-1.5 rounded-full text-xs ${templateCategory===cat ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-400'}`}>
                          {cat === 'all' ? (lang === 'en' ? 'All' : 'Все') : cat}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { title: lang === 'en' ? 'Slow smile' : 'Медленная улыбка', prompt: 'woman slowly smiles and looks at camera, soft natural lighting, gentle head movement' },
                      { title: lang === 'en' ? 'Walking' : 'Идёт', prompt: 'woman walking towards camera, confident pose, outdoor lighting, natural motion' },
                      { title: lang === 'en' ? 'Looking back' : 'Оглядывается', prompt: 'woman looks back over shoulder, seductive expression, bedroom lighting, slow motion' },
                    ].map(tpl => (
                      <button key={tpl.title} onClick={() => { setPrompt(tpl.prompt); setVideoMode('text'); }} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-orange-500/50">
                        <div className="font-medium text-sm">{tpl.title}</div>
                        <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{tpl.prompt}</div>
                      </button>
                    ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
                  <div>
                    {videoMode !== 'image' && <CharacterPicker />}
                    {videoMode === 'image' && (
                      <div className="mb-4">
                        <label className="block text-sm text-zinc-400 mb-2">{lang === 'en' ? 'Source image' : 'Исходное фото'}</label>
                        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center min-h-[400px]">
                          {videoImage ? <img src={videoImage} alt="" className="max-h-80 mx-auto rounded-lg mb-2" /> : <div className="text-4xl mb-2">🖼️</div>}
                          <label className="text-orange-400 text-sm cursor-pointer">
                            {lang === 'en' ? 'Upload image' : 'Загрузить фото'}
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const r = new FileReader();
                              r.onload = () => setVideoImage(r.result);
                              r.readAsDataURL(f);
                            }} />
                          </label>
                          {gallery.filter(g => g.type !== 'video').length > 0 && (
                            <div className="mt-3">
                              <button onClick={() => setGalleryPicker('video')} className="text-xs text-orange-400 hover:text-orange-300 mb-2">{lang === 'en' ? 'or from gallery' : 'или из галереи'}</button>
                              <div className="flex gap-2 justify-center flex-wrap">
                                {gallery.filter(g => g.type !== 'video' && !g.src?.includes('.mp4') && !g.src?.includes('video')).slice(0, 6).map(g => (
                                  <button key={g.id} onClick={() => setVideoImage(g.src)} className={`w-10 h-14 rounded overflow-hidden border-2 ${videoImage === g.src ? 'border-orange-500' : 'border-zinc-700'}`}>
                                    <img src={g.src} alt="" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Prompt</label>
                      <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-orange-500/50"
                        placeholder={lang === 'en' ? 'Describe the action and motion...' : 'Опишите действие и движение...'}
                      />
                    </div>
                    {videoMode !== 'image' && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-2">Model</p>
                        <div className="flex gap-2">
                          {[{id:'xW3.0s', label:'Normal'},{id:'xW3.0sPro', label:'Pro'}].map(m => (
                            <button key={m.id} onClick={() => setVideoModel(m.id)} className={`px-4 py-2 rounded-lg text-sm ${videoModel===m.id ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-300'}`}>
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <p className="text-xs text-zinc-500 mb-2">Duration</p>
                        <div className="flex gap-2">
                          {[5, 10].map(d => (
                            <button key={d} onClick={() => setVideoDuration(d)} className={`px-4 py-2 rounded-lg text-sm ${videoDuration===d ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-300'}`}>
                              {d}s
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-2">Ratio</p>
                        <div className="flex gap-2">
                          {['16:9', '9:16', '1:1'].map(r => (
                            <button key={r} onClick={() => setVideoRatio(r)} className={`px-3 py-2 rounded-lg text-sm ${videoRatio===r ? 'bg-orange-500 text-white' : 'border border-zinc-700 text-zinc-300'}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {videoStatus && (
                      <div className="text-sm text-center py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        {videoStatus === 'queued' && (lang === 'en' ? 'Queued…' : 'В очереди…')}
                        {videoStatus === 'processing' && (lang === 'en' ? 'Generating…' : 'Генерация…')}
                        {videoStatus === 'done' && (lang === 'en' ? 'Done' : 'Готово')}
                        {videoStatus === 'error' && (lang === 'en' ? 'Failed' : 'Ошибка')}
                      </div>
                    )}
                    <div className="text-xs text-zinc-500 text-center py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                      ~{VIDEO_COST * (videoDuration === 10 ? 2 : 1) * (videoModel === 'xW3.0sPro' ? 1.5 : 1)} tokens
                    </div>
                    <button
                      onClick={handleVideoGenerate}
                      disabled={(videoMode === 'image' ? !videoImage : !selectedCharacter) || !prompt.trim()}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 hover:brightness-110 disabled:opacity-40"
                    >
                      {lang === 'en' ? 'Generate Video' : 'Сгенерировать видео'}
                    </button>
                  </div>
                </div>
              </div>
              {gallery.filter(g => g.type === 'video').length > 0 && (
                <div className="mt-8 max-w-5xl mx-auto">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">Recent</p>
                    <button onClick={() => setActiveMode('gallery')} className="text-xs text-orange-400 hover:text-orange-300">→ Gallery</button>
                  </div>
                  <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
                    {gallery.filter(g => g.type === 'video').slice(0, 6).map(g => (
                      <button key={g.id} onClick={() => setViewer(g)} className="rounded-lg overflow-hidden border border-zinc-800">
                        <video src={g.src} className="aspect-[3/4] w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
