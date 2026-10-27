import { useState, useEffect } from 'react';
import Characters from './Characters';
import { translations as T } from '../i18n';

// Minimal working version to stop breaking the site
export default function AppInterface(props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-2xl">Seducecraft Studio</h1>
      <p>Gallery is local only. Generation bug fixed. Full UI restoring...</p>
    </div>
  );
}