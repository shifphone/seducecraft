export default function AgeGate({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
        <div className="text-2xl font-bold mb-2">Seducecraft <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-sm">AI</span></div>
        <h2 className="text-xl font-semibold mt-6 mb-3">This site is for adults only</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          By entering this website, you confirm that you are 18 years old or over. By using the site, you agree to our Terms of Service and Privacy Policy.
        </p>
        <div className="flex gap-3 justify-center mb-6">
          <button onClick={onAccept} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-sm font-medium">I'm 18 years old</button>
          <button onClick={() => window.location.href = 'https://google.com'} className="border border-zinc-600 text-zinc-300 px-6 py-3 rounded-lg text-sm font-medium hover:border-zinc-500">I'm underage</button>
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          <span className="text-lg">🇺🇸</span>
          <span className="text-lg">🇷🇺</span>
          <span className="text-lg">🇩🇪</span>
          <span className="text-lg">🇪🇸</span>
          <span className="text-lg">🇫🇷</span>
          <span className="text-lg">🇧🇷</span>
          <span className="text-lg">🇯🇵</span>
          <span className="text-lg">🇨🇳</span>
        </div>
      </div>
    </div>
  );
}
