import { useState, useEffect } from 'react';
import Characters from './Characters';
import { translations as T } from '../i18n';

const SAMPLE_PRESETS = [
  { id: 1, title: { en: 'On the counter — ass on display', ru: 'На столешнице — попа на отображении' }, prompt: 'Bathroom mirror selfie pov. She sits backwards on the bathroom counter with her large cellulite covered pawg ass fully on display. She twists her torso to take the selfie with an iPhone in a rose gold case in her hand. Her other hand reaches across the room and rests on the open door for balance. Topless with perky natural boobs. Her hair is up in a tight bun with a white scrunchie. Bored I don\'t give a fuck attitude.', model: 'СД', tags: ['18+', 'ass', 'back view', 'bathroom', 'selfie', 'mirror', 'nude', 'sitting'], src: '/stills/beam.jpg' },
  { id: 2, title: { en: 'Kneeling — burgundy lingerie', ru: 'На коленях — бордовое бельё' }, prompt: 'romantic bedroom with deep red satin sheets, scattered rose petals, black velvet headboard, candles, kneeling on the bed facing the mirror, strappy crimson bralette and matching thong, holding iphone for selfie, biting lower lip, one hand on thigh', model: 'СД', tags: ['18+', 'lingerie', 'kneeling', 'bed', 'selfie', 'mirror'], src: '/stills/silk.jpg' },
  { id: 3, title: { en: 'Mirror — red bikini in bedroom', ru: 'Зеркало — красное бикини в спальне' }, prompt: 'Mid-to-full body indoor mirror selfie at eye-level, framed slightly off-center with a soft handheld tilt, close-friend distance. She stands in a sunlit bedroom on pale oak floorboards, wearing a cherry-red ribbed triangle bikini with a high-waist tie-side bottom, a sheer cropped white cotton kimono slipping off one shoulder. Phone held at the hip, hip cocked seductively, free hand slowly brushing hair back, relaxed half-smile with a playful intimate gaze into the mirror.', model: 'СД', tags: ['18+', 'selfie', 'mirror', 'bedroom', 'boobs', 'standing'], src: '/stills/lake.jpg' },
  { id: 4, title: { en: 'On stomach — burgundy lingerie', ru: 'На животе — бордовое бельё' }, prompt: 'A woman lies prone on her stomach across white bedsheets in a bedroom, captured from a high slightly overhead selfie angle. Torso propped on elbows creating a strong arch that lifts and presents her extremely round full buttocks high toward the camera. She wears a dark maroon lace lingerie set: strappy bralette with thin criss-cross straps and a high-cut lace thong that disappears between the buttocks.', model: 'СД', tags: ['18+', 'lingerie', 'ass', 'bed', 'back view', 'lying down'], src: '/stills/silk.jpg' },
  { id: 5, title: { en: 'Nude on white bench — choker', ru: 'Голая на белой скамейке — чокер' }, prompt: 'Photorealistic image of a woman, wearing only a black choker necklace, sitting on the edge of a white cushioned bench in a minimalist studio with soft dramatic lighting and neutral gray walls. She is nude, knees bent and spread wide, feet in strappy black high-heeled sandals.', model: 'СД', tags: ['18+', 'nude', 'sitting', 'pussy', 'boobs', 'indoor'], src: '/stills/beam.jpg' },
  { id: 7, title: { en: 'Behind vanity — bent over nude', ru: 'Сзади у трюмо — голая наклонилась' }, prompt: 'she is naked in her bedroom, facing away from the viewer leaning over her vanity unit looking into the mirror', tags: ['18+', 'nude', 'ass', 'back view', 'bent over', 'bedroom', 'mirror', 'pussy'], src: '/stills/silk.jpg' },
  { id: 8, title: { en: 'Pulls down jeans — shows ass', ru: 'Снимает джинсы — показывает попу' }, prompt: 'She pulls down her jeans to show her naked ass her ass is big', tags: ['18+', 'ass', 'half nude', 'standing', 'back view'], src: '/stills/beam.jpg' },
  { id: 9, title: { en: 'On bed with handcuffs and chain', ru: 'На кровати — наручники и цепь' }, prompt: 'She lays on a bed completely naked, legs raised bent at the knees and spread wide, wearing leather handcuffs and ankle cuffs connected with a silver chain', tags: ['18+', 'nude', 'bed', 'boobs', 'pussy', 'lying down'], src: '/stills/lake.jpg' },
  { id: 10, title: { en: 'Night beach selfie — topless', ru: 'Ночное селфи на пляже — топлес' }, prompt: 'Low quality, blurry night selfie. Posing topless on a beach', tags: ['18+', 'nude', 'selfie', 'boobs', 'night'], src: '/stills/beam.jpg' },
];

export default function AppInterface({ isLoggedIn, isAnonymous, userName, onLogin, onLogout, onShowTerms, termsAccepted, onRequireTerms, lang, onLangChange, credits, onAddCredits }) {
  const t = T[lang] || T.en;
  const [activeMode, setActiveMode] = useState('custom');
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('normal');
  const [media, setMedia] = useState('photo');
  const [apiKey, setApiKey] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [presets] = useState(SAMPLE_PRESETS);
  const [activeTag, setActiveTag] = useState(null);
  const [pickedTemplate, setPickedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('seducecraft.xmode_key');
      if (saved) setApiKey(saved);
    } catch {}
  }, []);

  const handleGenerate = async () => {
    if (!termsAccepted && !isAnonymous) {
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
        setResult({ status: 'demo', message: 'Demo mode. Add xMode API key to generate for real.' });
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

  const allTags = [...new Set(presets.flatMap(p => p.tags))].slice(0, 20);
  const filtered = presets.filter(p => {
    const matchesTag = !activeTag || p.tags.includes(activeTag);
    const title = (p.title[lang] || p.title.en || '').toLowerCase();
    const matchesSearch = !searchQuery || title.includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Seducecraft" className="h-7 w-7 object-contain" />
          <span className="text-lg font-semibold">{t.brand}</span>
        </div>
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button
              onClick={() => { setLangOpen(!langOpen); setCreditsOpen(false); }}
              className="text-text-secondary hover:text-text-primary"
            >
              🌐
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 bg-bg-secondary border border-border rounded-md shadow-lg z-20 min-w-[80px]">
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
          {isLoggedIn && !isAnonymous && (
            <div className="relative flex items-center gap-2">
              <span className="text-sm text-text-primary">{userName}</span>
              <button
                onClick={() => { setCreditsOpen(!creditsOpen); setLangOpen(false); }}
                className="text-sm text-accent hover:text-accent-hover flex items-center gap-1"
              >
                {credits} {t.credits}
              </button>
              {creditsOpen && (
                <div className="absolute right-0 mt-8 bg-bg-secondary border border-border rounded-md shadow-lg z-20 min-w-[140px]">
                  <div className="px-3 py-2 text-xs text-text-secondary border-b border-border">{t.topUp}</div>
                  <button onClick={() => { onAddCredits(10); setCreditsOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary text-text-secondary">+10</button>
                  <button onClick={() => { onAddCredits(50); setCreditsOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary text-text-secondary">+50</button>
                  <button onClick={() => { onAddCredits(100); setCreditsOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary text-text-secondary">+100</button>
                </div>
              )}
              <button onClick={onLogout} className="text-sm text-text-secondary hover:text-text-primary ml-2">
                {t.logout}
              </button>
            </div>
          )}
          {isLoggedIn && isAnonymous && (
            <button onClick={onLogout} className="text-sm text-text-secondary hover:text-text-primary">
              {userName}
            </button>
          )}
          {!isLoggedIn && (
            <button onClick={onLogin} className="text-sm text-text-secondary hover:text-text-primary">
              {t.logIn || t.login}
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border bg-bg-secondary flex flex-col">
          <nav className="flex-1 py-4">
            {[
              { id: 'characters', name: t.modes.characters },
              { id: 'templates', name: t.modes.templates },
              { id: 'custom', name: t.modes.custom },
              { id: 'history', name: t.modes.history },
            ].map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setActiveMode(id)}
                className={`w-full text-left px-6 py-3 text-sm transition-colors ${
                  activeMode === id
                    ? 'bg-bg-tertiary text-text-primary border-r-2 border-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                }`}
              >
                {name}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <button onClick={onShowTerms} className="text-xs text-text-secondary hover:text-text-primary transition-colors">
              {t.terms}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="max-w-4xl w-full mx-auto">
            {activeMode === 'characters' ? (
              <Characters onRequireTerms={onRequireTerms} termsAccepted={termsAccepted} />
            ) : activeMode === 'templates' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">{t.modes.templates}</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchTemplates}
                    className="flex-1 h-10 bg-bg-secondary border border-border rounded-md px-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent"
                  />
                  <select
                    value={activeTag || ''}
                    onChange={(e) => setActiveTag(e.target.value || null)}
                    className="h-10 bg-bg-secondary border border-border rounded-md px-3 text-sm text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="">{t.allTags}</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className="text-left border border-border rounded-md bg-bg-secondary hover:border-accent/50 overflow-hidden transition-colors"
                    >
                      <img src={p.src} alt="" className="aspect-[3/4] w-full object-cover" />
                      <div className="p-2">
                        <div className="font-medium text-xs mb-1 line-clamp-2">{p.title[lang] || p.title.en}</div>
                        <div className="flex flex-wrap gap-1">
                          {p.tags.slice(0, 3).map((tg) => (
                            <span key={tg} className="text-[9px] px-1 py-0.5 bg-bg-tertiary rounded text-text-secondary">{tg}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : activeMode === 'history' ? (
              <div className="text-center py-16 text-text-secondary">
                <h2 className="text-2xl font-semibold mb-2 text-text-primary">{t.modes.history}</h2>
                <p>{t.noGallery || t.galleryEmpty}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">{t.modes.custom}</h2>
                </div>

                <div className="flex gap-3 mb-4">
                  <button onClick={() => setMedia('photo')} className={`px-6 py-2.5 text-base rounded-md border font-medium ${media === 'photo' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-accent/50'}`}>{t.photo}</button>
                  <button onClick={() => setMedia('video')} className={`px-6 py-2.5 text-base rounded-md border font-medium ${media === 'video' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-accent/50'}`}>{t.video}</button>
                </div>

                <div className="flex gap-3 mb-6">
                  {['flash', 'normal', 'pro'].map((q) => (
                    <button key={q} onClick={() => setQuality(q)} className={`px-5 py-2 text-sm rounded-md border capitalize font-medium ${quality === q ? 'border-accent text-accent' : 'border-border text-text-secondary hover:border-accent/50'}`}>{t[q] || q}</button>
                  ))}
                </div>

                {pickedTemplate ? (
                  <div className="mb-6 space-y-4">
                    <div className="p-4 border border-border rounded-md bg-bg-secondary">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{pickedTemplate.title[lang] || pickedTemplate.title.en}</div>
                        <button onClick={() => { setPickedTemplate(null); setPrompt(''); }} className="text-xs text-text-secondary hover:text-text-primary">{lang === 'en' ? 'Clear' : 'Очистить'}</button>
                      </div>
                      <div className="text-xs text-text-secondary mt-1">{lang === 'en' ? 'Template selected' : 'Шаблон выбран'}</div>
                    </div>
                    <div className="border border-dashed border-border rounded-md p-6 text-center">
                      <div className="text-sm text-text-secondary mb-2">{lang === 'en' ? 'Add your photo' : 'Добавьте фото'}</div>
                      <input type="file" accept="image/*" className="text-xs text-text-secondary" />
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-sm text-text-secondary mb-2">{t.scenario}</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.placeholder} className="w-full h-32 bg-bg-secondary border border-border rounded-md px-4 py-3 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent/50 resize-none" />
                  </div>
                )}

                <button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-8 py-3.5 rounded-md text-base font-medium transition-colors duration-150">{generating ? t.generating : t.generate}</button>

                {result && (
                  <div className="mt-6 p-4 border border-border rounded-md bg-bg-secondary text-sm text-text-secondary">
                    {result.message}
                    {result.requestId && <div className="mt-1 text-xs">Request: {result.requestId}</div>}
                  </div>
                )}

                <div className="mt-6 border border-border rounded-md bg-bg-secondary h-64 flex items-center justify-center text-text-secondary">
                  {t.result}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <footer className="border-t border-border py-3 px-6 text-xs text-text-secondary flex justify-between">
        <span>{t.brand} · {t.adultStudio}</span>
        <button onClick={onShowTerms} className="hover:text-text-primary transition-colors">{t.terms}</button>
      </footer>
    </div>
  );
}
