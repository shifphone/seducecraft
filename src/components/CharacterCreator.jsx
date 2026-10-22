import { useState } from 'react';

const PHOTO_GUIDANCE = `Best results for your character:
• Clear front, 3/4 and side views
• Even soft lighting, no harsh shadows
• Sharp focus, face fully visible
• Neutral expression, no sunglasses or heavy filters
• Up to 5 photos`;

export default function CharacterCreator({ onSave, onCancel, onRequireTerms, termsAccepted }) {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('realistic');
  const [photos, setPhotos] = useState([]);
  const [showGuidance, setShowGuidance] = useState(false);
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

  const handlePhotoClick = () => {
    if (!termsAccepted) {
      onRequireTerms();
      return;
    }
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
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      style,
      photos,
      params,
      createdAt: Date.now(),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Create character</h2>
        <button onClick={onCancel} className="text-sm text-text-secondary hover:text-text-primary">Cancel</button>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full h-11 bg-bg-secondary border border-border rounded-md px-3" placeholder="Character name" />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">Style</label>
          <div className="flex gap-2">
            {['realistic', 'stylized'].map(s => (
              <button key={s} onClick={() => setStyle(s)} className={`h-10 px-4 rounded-md border text-sm ${style === s ? 'border-accent text-white' : 'border-border text-text-secondary'}`}>{s === 'realistic' ? 'Realistic' : 'Stylized'}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">Reference photos (up to 5)</label>
          <button onClick={handlePhotoClick} className="h-11 px-4 border border-border rounded-md text-sm hover:border-accent">Add photos</button>
          {photos.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {photos.map((src, i) => (<img key={i} src={src} alt="" className="w-16 h-16 object-cover rounded" />))}
            </div>
          )}
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

        <button onClick={handleSave} disabled={!name.trim()} className="h-12 px-6 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-md text-sm font-medium">Save character</button>
      </div>

      {showGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-bg-secondary border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Photo guidelines</h3>
            <pre className="text-sm text-text-secondary whitespace-pre-wrap mb-5">{PHOTO_GUIDANCE}</pre>
            <div className="flex gap-3">
              <label className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium flex items-center justify-center cursor-pointer">Choose files<input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} /></label>
              <button onClick={() => setShowGuidance(false)} className="h-11 px-4 text-text-secondary">Cancel</button>
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
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 bg-bg-secondary border border-border rounded-md px-2 text-sm">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
