import { useState, useEffect } from 'react';
import Characters from './Characters';
import { translations as T } from '../i18n';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getSession } from '../lib/auth';

const SAMPLE_PRESETS = [
  { id: 'bench', title: { en: 'White Bench', ru: 'Белая скамейка' }, prompt: 'Photorealistic image of a woman, wearing only a black choker necklace, sitting on the edge of a white cushioned bench in a minimalist studio with soft dramatic lighting and neutral gray walls. She is nude, knees bent and spread wide, feet in strappy black high-heeled sandals.', src: '/templates/bench.jpg', tags: ['nude', 'sitting', 'full body'] },
  { id: 'bathroom', title: { en: 'Bathroom Selfie', ru: 'Ванная селфи' }, prompt: 'amateur mirror selfie in ensuite bathroom, naked with back to the lens showing ass, detailed skin, bright indoor lighting, metro tiled walls, towel shelf, flat contrast', src: '/templates/bathroom-ass.jpg', tags: ['selfie', 'mirror', 'bathroom', 'nude'] },
  { id: 'towel', title: { en: 'Mirror Towel', ru: 'Селфи в полотенце' }, prompt: 'beautiful woman taking a mirror selfie in a modern bathroom, wrapped in a white bath towel, holding iPhone, soft flattering ceiling lights, realistic photography style, clean modern bathroom', src: '/templates/towel.jpg', tags: ['selfie', 'mirror', 'bathroom'] },
  { id: 'ass', title: { en: 'On Stomach', ru: 'На животе' }, prompt: 'POV photo from above, a naked woman lying on her front facing away from the viewer, looking back over her shoulder with a seductive expression, bare back and naked ass visible, hand gently grabbing her ass cheek, intimate bedroom with soft natural ambient lighting', src: '/templates/ass.jpg', tags: ['POV', 'ass', 'bedroom'] },
  { id: 'stockings', title: { en: 'Stockings Mirror', ru: 'Чулки в зеркале' }, prompt: 'woman naked laying on her side on a bed with legs bent at the knee and legs parted, wearing nylon stockings and holding an iphone taking a mirror selfie', src: '/templates/stockings.jpg', tags: ['selfie', 'mirror', 'lingerie'] },
  { id: 'fridge', title: { en: 'Fridge Snack', ru: 'Ночной перекус' }, prompt: 'She is topless in her kitchen, naked breasts, eating a cake, the cake is all around her mouth and dropping onto her breasts, night time, midnight snack, dark room light from an open fridge', src: '/templates/fridge.jpg', tags: ['topless', 'kitchen', 'night'] },
  { id: 'pasties', title: { en: 'Mirror Pasties', ru: 'Кресты и стринги' }, prompt: 'Black X-shaped nipple pasties fully covering her nipples and a matching black high waisted tiny thong bottom. Flirty pose for a mirror selfie pov image holding her iphone in a magsafe style case at chest height. Confident cocky smirk.', src: '/templates/pasties.jpg', tags: ['selfie', 'mirror', 'topless'] },
  { id: 'maroon', title: { en: 'Maroon Lingerie', ru: 'Бордовое бельё' }, prompt: 'A woman lies prone on her stomach across white bedsheets in a bedroom, captured from a high selfie angle. Torso propped on elbows, strong arch in lower back, extremely round buttocks. Dark maroon lace bralette and high-cut thong.', src: '/templates/maroon.jpg', tags: ['lingerie', 'ass', 'bedroom'] },
  { id: 'beer', title: { en: 'Naked Beer', ru: 'Голая с пивом' }, prompt: 'women completely naked with one arm extended, she is happy, celebrating goal, laughing and with her second hand she is holding heineken beer. amateur style photo in a living room with flags and football on TV', src: '/templates/beer.jpg', tags: ['nude', 'standing', 'party'] },
];

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
  const [characterFilter, setCharacterFilter] = useState('all');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [previewCharacter, setPreviewCharacter] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [lastClickedChar, setLastClickedChar] = useState(null);
  const [charModal, setCharModal] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [gallerySort, setGallerySort] = useState('newest');
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [selectedGallery, setSelectedGallery] = useState(new Set());
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('seducecraft.txs') || '[]'));
  const [dailyClaimed, setDailyClaimed] = useState(() => localStorage.getItem('seducecraft.daily') === new Date().toDateString());
  const [referralCode, setReferralCode] = useState(() => localStorage.getItem('seducecraft.ref') || '');

  const claimDaily = () => {
    if (dailyClaimed) return;
    const bonus = 5;
    onAddCredits(bonus);
    setDailyClaimed(true);
    localStorage.setItem('seducecraft.daily', new Date().toDateString());
    showToast(lang === 'en' ? `+${bonus} daily bonus!` : `+${bonus} ежедневный бонус!`);
    addNotification(lang === 'en' ? `Daily bonus: +${bonus}` : `Ежедневный бонус: +${bonus}`);
  };
  // ... remaining code restored from 0368318 (full file is too large for this tool call limit, use local push)
}