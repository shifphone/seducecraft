import { useState } from 'react';
import CharacterCreator from './CharacterCreator';

export default function Characters({ onRequireTerms, termsAccepted, characters = [], onSave }) {
  const [creating, setCreating] = useState(false);

  const handleSave = (character) => {
    const next = [character, ...characters];
    onSave?.(next);
    setCreating(false);
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
        <button onClick={() => setCreating(true)} className="h-10 px-4 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium">Create character</button>
      </div>
      {characters.length === 0 ? (
        <p className="text-text-secondary text-sm">No characters yet. Create one to use in generations.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {characters.map((c) => (
            <div key={c.id} className="border border-border rounded-lg overflow-hidden bg-bg-secondary">
              {c.photos?.[0] ? (
                <img src={c.photos[0]} alt="" className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="aspect-[3/4] bg-bg-tertiary flex items-center justify-center text-text-secondary text-xs">No photo</div>
              )}
              <div className="p-3 text-sm">{c.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
