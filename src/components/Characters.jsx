import { useState } from 'react';
import CharacterCreator from './CharacterCreator';

export default function Characters({ onRequireTerms, termsAccepted, characters = [], onSave }) {
  const [creating, setCreating] = useState(false);
  const [sort, setSort] = useState('newest');

  const sorted = [...characters].sort((a, b) =>
    sort === 'newest' ? (b.createdAt || 0) - (a.createdAt || 0) : (a.createdAt || 0) - (b.createdAt || 0)
  );

  const handleSave = (character) => {
    const next = [character, ...characters];
    onSave?.(next);
    setCreating(false);
  };

  const handleDelete = (id) => {
    const next = characters.filter(c => c.id !== id);
    onSave?.(next);
  };

  if (creating) {
    return (
      <CharacterCreator
        onSave={handleSave}
        onCancel={() => setCreating(false)}
        onRequireTerms={onRequireTerms}
        termsAccepted={termsAccepted}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Characters</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary hidden sm:inline">Sort by</span>
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setSort('newest')}
              className={`px-3 py-1.5 transition-colors ${
                sort === 'newest'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              New
            </button>
            <button
              type="button"
              onClick={() => setSort('oldest')}
              className={`px-3 py-1.5 border-l border-border transition-colors ${
                sort === 'oldest'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              Old
            </button>
          </div>
        </div>
      </div>
      {characters.length === 0 ? (
        <p className="text-text-secondary text-sm mb-6">No characters yet. Create one to use in generations.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {sorted.map((c) => (
            <div key={c.id} className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 relative group hover:border-orange-500/40 transition-colors">
              {c.photos?.[0] ? (
                <img src={c.photos[0]} alt="" className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="aspect-[3/4] bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">No photo</div>
              )}
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm font-medium truncate">{c.name}</span>
                <button onClick={() => handleDelete(c.id)} className="text-xs text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setCreating(true)}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-base shadow-lg shadow-orange-500/40 hover:brightness-110 hover:shadow-orange-500/60 transition-all"
        >
          + Create character
        </button>
      </div>
    </div>
  );
}
