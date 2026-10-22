export default function LoginModal({ onLogin, onClose }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    if (name.trim()) onLogin(name);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-bg-secondary border border-border rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-semibold">Log in</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">✕</button>
        </div>
        <p className="text-sm text-text-secondary mb-5">Enter a name to open the studio. It stays only in this browser.</p>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-text-secondary mb-1">Name</label>
          <input name="name" autoFocus className="w-full h-11 bg-bg-primary border border-border rounded-md px-3" placeholder="Your name" />
          <div className="mt-5 flex gap-3">
            <button type="submit" className="flex-1 h-11 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium">Continue</button>
            <button type="button" onClick={onClose} className="h-11 px-4 text-text-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
