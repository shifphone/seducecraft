export default function LoginModal({ onLogin, onClose }) {
  const handleSocial = (provider) => {
    // Mock social login — in real app would open OAuth
    onLogin(`${provider} User`, false);
  };

  const handleEmail = (e) => {
    e.preventDefault();
    const name = e.target.name.value || 'Email User';
    if (name.trim()) onLogin(name.trim(), false);
  };

  const handleAnonymous = () => {
    onLogin('Anonymous', true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-bg-secondary border border-border rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-semibold">Log in</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">✕</button>
        </div>
        <p className="text-sm text-text-secondary mb-5">Choose a way to continue. Anonymous stays only in this browser.</p>

        <div className="space-y-3 mb-5">
          <button onClick={() => handleSocial('Google')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
            <span className="text-blue-400">G</span> Continue with Google
          </button>
          <button onClick={() => handleSocial('Apple')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
            <span></span> Continue with Apple
          </button>
          <button onClick={() => handleSocial('Telegram')} className="w-full h-11 border border-border rounded-md text-sm hover:bg-bg-tertiary flex items-center justify-center gap-2">
            <span className="text-blue-400">✈</span> Continue with Telegram
          </button>
        </div>

        <form onSubmit={handleEmail} className="mb-4">
          <label className="block text-sm text-text-secondary mb-1">Or with email</label>
          <div className="flex gap-2">
            <input
              name="name"
              className="flex-1 h-11 bg-bg-primary border border-border rounded-md px-3 text-text-primary focus:outline-none focus:border-accent"
              placeholder="Your name or email"
            />
            <button type="submit" className="h-11 px-4 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium">
              Continue
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-border">
          <button
            onClick={handleAnonymous}
            className="w-full text-sm text-red-400 hover:text-red-300 text-center"
          >
            anonymous login available
          </button>
        </div>
      </div>
    </div>
  );
}
