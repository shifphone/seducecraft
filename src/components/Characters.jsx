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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Sort by</span>
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
          <button onClick={() => setCreating(true)} className="h-10 px-4 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors">Create character</button>
        </div>
      </div>
      {characters.length === 0 ? (
        <p className="text-text-secondary text-sm">No characters yet. Create one to use in generations.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sorted.map((c) => (
            <div key={c.id} className="border border-border rounded-lg overflow-hidden bg-bg-secondary relative group hover:border-accent/40 transition-colors">
              {c.photos?.[0] ? (
                <img src={c.photos[0]} alt="" className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="aspect-[3/4] bg-bg-tertiary flex items-center justify-center text-text-secondary text-xs">No photo</div>
              )}
              <div className="p-3 text-sm flex items-center justify-between">
                <span>{c.name}</span>
                <button onClick={() => handleDelete(c.id)} className="text-xs text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
