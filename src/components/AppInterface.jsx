import { useState, useEffect } from 'react';
import Characters from './Characters';

const modes = [
  { id: 'custom', name: 'Custom' },
  { id: 'templates', name: 'Templates' },
  { id: 'history', name: 'History' },
  { id: 'characters', name: 'Characters' },
];

const SAMPLE_PRESETS = [
  { id: 1, title: { en: 'On the counter — ass on display', ru: 'На столешнице — попа на отображении' }, prompt: 'Bathroom mirror selfie pov. She sits backwards on the bathroom counter with her large cellulite covered pawg ass fully on display. She twists her torso to take the selfie with an iPhone in a rose gold case in her hand. Her other hand reaches across the room and rests on the open door for balance. Topless with perky natural boobs. Her hair is up in a tight bun with a white scrunchie. Bored I don\'t give a fuck attitude.', model: 'СД', tags: ['18+', 'ass', 'back view', 'bathroom', 'selfie', 'mirror', 'nude', 'sitting'], src: '/stills/beam.jpg' },
  { id: 2, title: { en: 'Kneeling — burgundy lingerie', ru: 'На коленях — бордовое бельё' }, prompt: 'romantic bedroom with deep red satin sheets, scattered rose petals, black velvet headboard, candles, kneeling on the bed facing the mirror, strappy crimson bralette and matching thong, holding iphone for selfie, biting lower lip, one hand on thigh', model: 'СД', tags: ['18+', 'lingerie', 'kneeling', 'bed', 'selfie', 'mirror'], src: '/stills/silk.jpg' },
  { id: 3, title: { en: 'Mirror — red bikini in bedroom', ru: 'Зеркало — красное бикини в спальне' }, prompt: 'Mid-to-full body indoor mirror selfie at eye-level, framed slightly off-center with a soft handheld tilt, close-friend distance. She stands in a sunlit bedroom on pale oak floorboards, wearing a cherry-red ribbed triangle bikini with a high-waist tie-side bottom, a sheer cropped white cotton kimono slipping off one shoulder. Phone held at the hip, hip cocked seductively, free hand slowly brushing hair back, relaxed half-smile with a playful intimate gaze into the mirror.', model: 'СД', tags: ['18+', 'selfie', 'mirror', 'bedroom', 'boobs', 'standing'], src: '/stills/lake.jpg' },
  { id: 4, title: { en: 'On stomach — burgundy lingerie', ru: 'На животе — бордовое бельё' }, prompt: 'A woman lies prone on her stomach across white bedsheets in a bedroom, captured from a high slightly overhead selfie angle. Torso propped on elbows creating a strong arch that lifts and presents her extremely round full buttocks high toward the camera. She wears a dark maroon lace lingerie set: strappy bralette with thin criss-cross straps and a high-cut lace thong that disappears between the buttocks.', model: 'СД', tags: ['18+', 'lingerie', 'ass', 'bed', 'back view', 'lying down'], src: '/stills/silk.jpg' },
  { id: 5, title: { en: 'Nude on white bench — choker', ru: 'Голая на белой скамейке — чокер' }, prompt: 'Photorealistic image of a woman, wearing only a black choker necklace, sitting on the edge of a white cushioned bench in a minimalist studio with soft dramatic lighting and neutral gray walls. She is nude, knees bent and spread wide, feet in strappy black high-heeled sandals.', model: 'СД', tags: ['18+', 'nude', 'sitting', 'pussy', 'boobs', 'indoor'], src: '/stills/beam.jpg' },
  { id: 6, title: { en: 'Midnight snack — topless', ru: 'Ночной перекус у холодильника — топлесс' }, prompt: 'She is topless in her kitchen, naked breasts, eating a cake, the cake is all around her mouth and dropping onto her breasts, night time, midnight snack, dark room light from an open fridge', model: 'СД', tags: ['18+', 'nude', 'topless', 'standing', 'indoor', 'night', 'boobs'], src: '/stills/lake.jpg' },
];

export default function AppInterface({ isLoggedIn, onLogin, onLogout, onShowTerms, termsAccepted, onRequireTerms }) {
  const [activeMode, setActiveMode] = useState('custom');
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('normal');
  const [media, setMedia] = useState('photo');
  const [apiKey, setApiKey] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [presets] = useState(SAMPLE_PRESETS);
  const [lang, setLang] = useState('en');
  const [activeTag, setActiveTag] = useState(null);
  const [pickedTemplate, setPickedTemplate] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('seducecraft.xmode_key');
      if (saved) setApiKey(saved);
    } catch {}
  }, []);

  const saveApiKey = (key) => {
    setApiKey(key.trim());
    try { localStorage.setItem('seducecraft.xmode_key', key.trim()); } catch {}
    setShowApiSettings(false);
  };

  const handleGenerate = async () => {
    if (!termsAccepted) {
      onRequireTerms();
      return;
    }
    if (!prompt.trim()) return;

    setGenerating(true);
    setResult(null);

    if (apiKey) {
      try {
        const modelMap = { flash: 'xSD4.5', normal: 'xSD4.5', pro: 'xSD4.5' };
        const res = await fetch('https://api.xmode.ai/v1/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelMap[quality] || 'xSD4.5',
            prompt: prompt.trim(),
            size: media === 'video' ? '1024x576' : '1024x1024',
            n: 1,
          }),
        });
        const data = await res.json();
        setResult({ status: 'queued', requestId: data.requestId || 'stub', message: 'Generation queued via xMode. Polling not implemented in demo.' });
      } catch (e) {
        setResult({ status: 'error', message: 'API call failed. Check key or try again.' });
      }
    } else {
      setTimeout(() => {
        setResult({ status: 'demo', message: 'Demo mode. Add xMode API key in Account → API to generate for real.' });
        setGenerating(false);
      }, 800);
      return;
    }
    setGenerating(false);
  };

  const applyPreset = (p) => {
    setPrompt(p.prompt);
    setPickedTemplate(p);
    setActiveMode('custom');
  };

  const allTags = [...new Set(presets.flatMap(p => p.tags))].slice(0, 12);
  const filtered = activeTag ? presets.filter(p => p.tags.includes(activeTag)) : presets;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border h-14 flex items-center justify-between px-6">
        <div className="text-lg font-semibold">Seducecraft</div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowApiSettings(true)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">API</button>
          {isLoggedIn ? (
            <button onClick={onLogout} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Account</button>
          ) : (
            <button onClick={onLogin} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Log in</button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border bg-bg-secondary flex flex-col">
          <nav className="flex-1 py-4">
            {modes.map((mode) => (
              <button key={mode.id} onClick={() => setActiveMode(mode.id)} className={`w-full text-left px-6 py-3 text-sm transition-colors ${activeMode === mode.id ? 'bg-bg-tertiary text-text-primary border-r-2 border-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'}`}>
                {mode.name}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <button onClick={onShowTerms} className="text-xs text-text-secondary hover:text-text-primary transition-colors">Terms of Use</button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="max-w-5xl w-full mx-auto">
            {activeMode === 'characters' ? (
              <Characters onRequireTerms={onRequireTerms} termsAccepted={termsAccepted} />
            ) : activeMode === 'templates' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Templates</h2>
                    <p className="text-sm text-text-secondary">From your Notion library</p>
                  </div>
                  <button onClick={() => setLang(lang === 'en' ? 'ru' : 'en')} className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1">🌐 {lang === 'en' ? 'EN' : 'RU'}</button>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <button onClick={() => setActiveTag(null)} className={`px-3 py-1 text-xs rounded border ${!activeTag ? 'border-accent text-accent' : 'border-border text-text-secondary'}`}>All</button>
                  {allTags.map(tag => (
                    <button key={tag} onClick={() => setActiveTag(tag)} className={`px-3 py-1 text-xs rounded border ${activeTag === tag ? 'border-accent text-accent' : 'border-border text-text-secondary'}`}>{tag}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filtered.map((p) => (
                    <button key={p.id} onClick={() => applyPreset(p)} className="text-left border border-border rounded-md bg-bg-secondary hover:border-accent/50 overflow-hidden transition-colors">
                      <img src={p.src} alt="" className="aspect-[3/4] w-full object-cover" />
                      <div className="p-2">
                        <div className="font-medium text-xs mb-1 line-clamp-2">{p.title[lang] || p.title.en}</div>
                        <div className="flex flex-wrap gap-1">
                          {p.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[9px] px-1 py-0.5 bg-bg-tertiary rounded text-text-secondary">{t}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">{modes.find(m => m.id === activeMode)?.name}</h2>
                  <button onClick={() => setLang(lang === 'en' ? 'ru' : 'en')} className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1">🌐 {lang === 'en' ? 'EN' : 'RU'}</button>
                </div>

                <div className="flex gap-2 mb-4">
                  <button onClick={() => setMedia('photo')} className={`px-4 py-1.5 text-sm rounded-md border ${media === 'photo' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary'}`}>Photo</button>
                  <button onClick={() => setMedia('video')} className={`px-4 py-1.5 text-sm rounded-md border ${media === 'video' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary'}`}>Video</button>
                </div>

                <div className="flex gap-2 mb-6">
                  {['flash', 'normal', 'pro'].map((q) => (
                    <button key={q} onClick={() => setQuality(q)} className={`px-3 py-1 text-xs rounded border capitalize ${quality === q ? 'border-accent text-accent' : 'border-border text-text-secondary'}`}>{q}</button>
                  ))}
                </div>

                {pickedTemplate ? (
                  <div className="mb-6 p-4 border border-border rounded-md bg-bg-secondary">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{pickedTemplate.title[lang] || pickedTemplate.title.en}</div>
                      <button onClick={() => { setPickedTemplate(null); setPrompt(''); }} className="text-xs text-text-secondary hover:text-text-primary">Clear</button>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">Template selected</div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-sm text-text-secondary mb-2">Scenario</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the frame in one or two sentences" className="w-full h-32 bg-bg-secondary border border-border rounded-md px-4 py-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent/50 resize-none" />
                  </div>
                )}

                <button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors duration-150">{generating ? 'Generating…' : 'Generate'}</button>

                {result && (
                  <div className="mt-6 p-4 border border-border rounded-md bg-bg-secondary text-sm text-text-secondary">
                    {result.message}
                    {result.requestId && <div className="mt-1 text-xs">Request: {result.requestId}</div>}
                  </div>
                )}

                <div className="mt-6 border border-border rounded-md bg-bg-secondary h-64 flex items-center justify-center text-text-secondary">The result will appear here</div>
              </>
            )}
          </div>
        </main>
      </div>

      {showApiSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">xMode API</h3>
            <p className="text-sm text-text-secondary mb-4">Paste your API key from <a href="https://dashboard.xmode.ai" target="_blank" rel="noreferrer" className="text-accent hover:underline">dashboard.xmode.ai</a>. Stored locally only.</p>
            <input type="password" defaultValue={apiKey} onKeyDown={(e) => { if (e.key === 'Enter') saveApiKey(e.target.value); }} placeholder="xm_live_..." className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:border-accent" id="xmode-key" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowApiSettings(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">Cancel</button>
              <button onClick={() => saveApiKey(document.getElementById('xmode-key').value)} className="px-4 py-2 text-sm bg-accent text-white rounded-md">Save</button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border py-3 px-6 text-xs text-text-secondary flex justify-between">
        <span>Seducecraft · Adult studio · 18+</span>
        <button onClick={onShowTerms} className="hover:text-text-primary transition-colors">Terms of Use</button>
      </footer>
    </div>
  );
}
