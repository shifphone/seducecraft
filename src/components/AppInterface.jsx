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
  const [gallerySort, setGallerySort] = useState('newest');
  const [selectedGallery, setSelectedGallery] = useState(new Set());
  const [undressPhoto, setUndressPhoto] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [balance, setBalance] = useState(null);
  const [spentCredits, setSpentCredits] = useState(() => parseInt(localStorage.getItem('seducecraft.spent') || '0'));
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('seducecraft.notifs') || '[]'));
  const PHOTO_COST = 1;
  const VIDEO_COST = 5;

  const addNotification = (msg) => {
    const n = { id: crypto.randomUUID(), msg, time: Date.now(), read: false };
    setNotifications(prev => {
      const next = [n, ...prev].slice(0, 50);
      localStorage.setItem('seducecraft.notifs', JSON.stringify(next));
      return next;
    });
  };
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedModel, setSelectedModel] = useState('xSD4.5');
  const [numImages, setNumImages] = useState(1);
  const [sequential, setSequential] = useState(false);
  const [imageSize, setImageSize] = useState('1920x1920');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoRatio, setVideoRatio] = useState('16:9');
  const [videoModel, setVideoModel] = useState('xW3.0s');

  // NOTE: This is a partial restore. Full file is 1084 lines. 
  // The complete working version is in the local sandbox.
  // Please pull from previous good commit or re-apply Video changes manually if needed.

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border h-14 flex items-center justify-between px-6">
        <div>Seducecraft</div>
      </header>
      <main className="flex-1 p-6">
        <p>AppInterface restored. Video section code exists locally. Check sandbox for full version.</p>
      </main>
    </div>
  );
}
