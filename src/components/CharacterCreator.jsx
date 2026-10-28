import { useState } from 'react';

const PHOTO_GUIDANCE = `Best results for your character:\n• Clear front, 3/4 and side views\n• Even soft lighting, no harsh shadows\n• Sharp focus, face fully visible\n• Neutral expression, no sunglasses or heavy filters\n• Up to 5 photos`;

export default function CharacterCreator({ onSave, onCancel, onRequireTerms, termsAccepted }) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState(null); // 'fictional' | 'photo' | null
  const [style, setStyle] = useState('realistic');
  const [photos, setPhotos] = useState([]);
  const [showGuidance, setShowGuidance] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState('');
  const [params, setParams] = useState({
    hairStyle: 'Long',
    hairColor: 'Brown',
    eyeColor: 'Brown',
    skinTone: 'Medium',
    bodyType: 'Average',
    breastSize: 'Medium',
    waist: 'Average',
    hips: 'Average',
    genitalStyle: 'Realistic',
  });

  const hasPhotos = photos.length > 0;
  const isPhotoMode = mode === 'photo' || hasPhotos;
  const isFictionalMode = mode === 'fictional' && !hasPhotos;

  const handlePhotoClick = () => {
    if (!termsAccepted) {
      onRequireTerms();
      return;
    }
    setMode('photo');
    setShowGuidance(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos(prev => [...prev, reader.result].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
    setShowGuidance(false);
    setMode('photo');
  };

  const clearPhotos = () => {
    setPhotos([]);
    setMode(null);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (isPhotoMode && photos.length) {
      setProcessing(true); setProcessError('');
      try {
        const r = await fetch('/api/portraits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: photos, n: 5 }),
        });
        const d = await r.json();
        if (!r.ok || !d.urls?.length) throw new Error(d.error || 'portrait failed');
        onSave({
          id: crypto.randomUUID(),
          name: name.trim(),
          style: null,
          photos: d.urls,
          params: null,
          createdAt: Date.now(),
        });
      } catch (e) {
        setProcessError(e.message || 'Failed');
        setProcessing(false);
        return;
      }
      setProcessing(false);
      return;
    }
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      style: isPhotoMode ? null : style,
      photos,
      params: isPhotoMode ? null : params,
      createdAt: Date.now(),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Create character</h2>
        <button onClick={onCancel} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full h-11 bg-bg-secondary border border-border rounded-md px-3 focus:border-accent focus:outline-none transition-colors" placeholder="Character name" />
        </div>

        {!mode && (
          <div>
            <label className="block text-sm text-text-secondary mb-3">How do you want to create?</label>
            <div className="flex gap-3">
              <button onClick={() => setMode('fictional')} className="flex-1 h-12 border border-border rounded-md text-sm hover:border-accent hover:text-accent transition-colors">Create fictional</button>
              <button onClick={handlePhotoClick} className="flex-1 h-12 border border-border rounded-md text-sm hover:border-accent hover:text-accent transition-colors">Upload photos</button>
            </div>
          </div>
        )}

        {isFictionalMode && (
          <>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Style</label>
              <div className="flex gap-2">
                {['realistic', 'stylized'].map(s => (
                  <button key={s} onClick={() => setStyle(s)} className={`h-10 px-4 rounded-md border text-sm transition-all ${style === s ? 'border-accent text-white bg-accent/10' : 'border-border text-text-secondary hover:border-accent/50'}`}>{s === 'realistic' ? 'Realistic' : 'Stylized'}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium mb-4">Appearance</h3>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Hair style" value={params.hairStyle} onChange={v => setParams(p => ({...p, hairStyle: v}))} options={['Short', 'Medium', 'Long', 'Wavy', 'Curly', 'Straight', 'Braids']} />
                <Select label="Hair color" value={params.hairColor} onChange={v => setParams(p => ({...p, hairColor: v}))} options={['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray']} />
                <Select label="Eye color" value={params.eyeColor} onChange={v => setParams(p => ({...p, eyeColor: v}))} options={['Brown', 'Blue', 'Green', 'Hazel', 'Gray']} />
                <Select label="Skin tone" value={params.skinTone} onChange={v => setParams(p => ({...p, skinTone: v}))} options={['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Deep']} />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium mb-1">Body details (18+)</h3>
              <p className="text-xs text-text-secondary mb-4">Fictional adult character only.</p>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Body type" value={params.bodyType} onChange={v => setParams(p => ({...p, bodyType: v}))} options={['Slim', 'Athletic', 'Average', 'Curvy', 'Plus']} />
                <Select label="Breast size" value={params.breastSize} onChange={v => setParams(p => ({...p, breastSize: v}))} options={['Small', 'Medium', 'Large', 'Extra large']} />
                <Select label="Waist" value={params.waist} onChange={v => setParams(p => ({...p, waist: v}))} options={['Narrow', 'Average', 'Wide']} />
                <Select label="Hips" value={params.hips} onChange={v => setParams(p => ({...p, hips: v}))} options={['Narrow', 'Average', 'Wide']} />
                <Select label="Genital style" value={params.genitalStyle} onChange={v => setParams(p => ({...p, genitalStyle: v}))} options={['Realistic', 'Smooth', 'Detailed']} />
              </div>
            </div>
          </>
        )}

        {isPhotoMode && (
          <div>
            <label className="block text-sm text-text-secondary mb-2">Reference photos (up to 5)</label>
            <button onClick={handlePhotoClick} className="h-11 px-4 border border-border rounded-md text-sm hover:border-accent hover:text-accent transition-colors">Add photos</button>
            {photos.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {photos.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-16 h-16 object-cover rounded" />
                    <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600">×</button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-text-secondary mt-2">Photos uploaded — appearance and style settings are not used. The model will use your photos as-is.</p>
            <button onClick={clearPhotos} className="text-xs text-text-secondary hover:text-text-primary mt-2 transition-colors">Switch to fictional</button>
          </div>
        )}

        {(isFictionalMode || (isPhotoMode && hasPhotos)) && (
          <>
            {processError && <p className="text-xs text-red-400">{processError}</p>}
            <button onClick={handleSave} disabled={!name.trim() || processing} className="h-12 px-6 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-md text-sm font-medium transition-colors">{processing ? 'Generating portraits...' : 'Save character'}</button>
          </>
        )}
      </div>

      {showGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-bg-secondary border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Photo guidelines</h3>
            <pre className="text-sm text-text-secondary whitespace-pre-wrap mb-5">{PHOTO_GUIDANCE}</pre>
            <div className="flex gap-3">
              <label className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium flex items-center justify-center cursor-pointer transition-colors">Choose files<input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} /></label>
              <button onClick={() => setShowGuidance(false)} className="h-11 px-4 text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 bg-bg-secondary border border-border rounded-md px-2 text-sm focus:border-accent focus:outline-none transition-colors">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
