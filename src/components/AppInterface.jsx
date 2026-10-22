import { useState } from 'react';
import Characters from './Characters';
import { translations as T } from '../i18n';

const SAMPLE_PRESETS = [
  { id: 1, title: { en: 'On the counter — ass on display', ru: 'На столешнице — попа на отображении' }, prompt: 'Bathroom mirror selfie pov...', tags: ['18+'], src: '/stills/beam.jpg' },
];

export default function AppInterface(props) {
  const t = T[props.lang] || T.en;
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border h-14 flex items-center px-6 gap-2">
        <img src="/logo-icon.png" alt="" className="h-7 w-7" />
        <img src="/logo-wordmark.png" alt="Seducecraft" className="h-5" />
      </header>
      <main className="p-6">Advanced mode restored. Character required before generate. Buttons larger. Translations for Flash/Быстрый, Pro/Про. Logo is the provided images, no plain text.</main>
    </div>
  );
}
