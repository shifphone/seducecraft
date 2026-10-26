import { useState } from 'react';
import CharacterCreator from './CharacterCreator';

export default function Characters({ onRequireTerms, termsAccepted, characters = [], onSave }) {
  const [creating, setCreating] = useState(false);
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  const [sortOpen, setSortOpen] = useState(false);

  const toggleFavorite = (id) => {
    const next = characters.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c);
    onSave?.(next);
  };

  const filtered = characters.filter(c => filter === 'favorites' ? c.favorite : true);

  const sorted = [...filtered].sort((a, b) =>
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
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Characters</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 hover:border-zinc-500"
            >
              {sort === 'newest' ? 'Newest' : 'Oldest'}
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l4 4 4-4" /></svg>
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-10 z-10 min-w-[110px] rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                <button onClick={() => { setSort('newest'); setSortOpen(false); }} className={`block w-full px-3 py-1.5 text-left text-sm ${sort === 'newest' ? 'text-orange-400' : 'text-zinc-300 hover:bg-zinc-800'}`}>Newest</button>
                <button onClick={() => { setSort('oldest'); setSortOpen(false); }} className={`block w-full px-3 py-1.5 text-left text-sm ${sort === 'oldest' ? 'text-orange-400' : 'text-zinc-300 hover:bg-zinc-800'}`}>Oldest</button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFilter(filter === 'favorites' ? 'all' : 'favorites')}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm transition-colors ${
              filter === 'favorites'
                ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5l1.8 3.7 4.1.6-3 2.9.7 4.1L8 10.8 4.4 12.8l.7-4.1-3-2.9 4.1-.6L8 1.5z" /></svg>
            Favorites
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm transition-colors ${
              filter === 'all'
                ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-zinc-500 text-sm mb-8">{filter === 'favorites' ? 'No favorites yet.' : 'No characters yet. Create one to use in generations.'}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
          {sorted.map((c) => (
            <div key={c.id} className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 relative group hover:border-orange-500/40 hover:shadow-lg hover:shadow-black/40 transition-all">
              {c.photos?.[0] ? (
                <img src={c.photos[0]} alt="" className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="aspect-[16/10] bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">No photo</div>
              )}
              <div className="px-4 py-3 flex items-center justify-between gap-2 bg-zinc-900">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{c.name}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleFavorite(c.id)} className={`p-1.5 rounded-md ${c.favorite ? 'text-orange-400' : 'text-zinc-500 hover:text-orange-400 hover:bg-zinc-800'}`}>
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5l1.8 3.7 4.1.6-3 2.9.7 4.1L8 10.8 4.4 12.8l.7-4.1-3-2.9 4.1-.6L8 1.5z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-1 rounded-md hover:bg-zinc-800">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={() => setCreating(true)}
          className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-base shadow-lg shadow-orange-500/40 hover:brightness-110 transition-all"
        >
          + Create character
        </button>
      </div>
    </div>
  );
}
