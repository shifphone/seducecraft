export default function Landing({ onStart, isLoggedIn, userName, onLogin }) {
  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm tracking-wide font-medium">Seducecraft</span>
            <span className="text-xs border border-orange-600 text-orange-500 px-2 py-0.5 rounded">18+</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-zinc-400 hover:text-white">🌐</button>
            <button onClick={isLoggedIn ? onStart : onLogin} className="text-sm text-zinc-400 hover:text-white">
              {isLoggedIn ? userName : 'Log in'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-widest text-orange-500 mb-4">Adult studio · 18+</p>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-none mb-6">
                Make the idea <span className="italic text-zinc-400">visible.</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-md mb-8 leading-relaxed">
                A studio for adults only. Images and video, no extra steps — access from 18.
              </p>
              <button
                onClick={onStart}
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3.5 rounded-md text-base font-medium"
              >
                Start free
              </button>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-lg p-5">
              <img
                src="/stills/beam.jpg"
                alt="Studio preview"
                className="aspect-video w-full rounded-md object-cover mb-4"
              />
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['Custom', 'Photo', 'Video', 'Templates'].map(item => (
                  <div key={item} className="bg-zinc-900 rounded-md py-3 text-center text-sm text-zinc-400">{item}</div>
                ))}
              </div>
              <button
                onClick={onStart}
                className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-sm font-medium"
              >
                Open the studio
              </button>
              <p className="text-xs text-zinc-500 text-center mt-3">18+ only · no sign-up</p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-semibold mb-8">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { n: '01', t: 'Upload a photo', d: 'Add a clear image of the person you want to work with.' },
                { n: '02', t: 'Choose or describe', d: 'Pick a template from the library, or write your own scenario.' },
                { n: '03', t: 'Enjoy', d: 'Generate and review the result. Refine if you want, then run again.' },
              ].map((item) => (
                <div key={item.n} className="bg-zinc-950 border border-white/10 rounded-lg p-6">
                  <p className="text-orange-500 text-sm mb-2">{item.n}</p>
                  <h3 className="text-lg font-semibold mb-2">{item.t}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-semibold mb-8">Why Seducecraft</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { t: 'Simple', d: 'One screen. Nothing between the idea and the result.' },
                { t: 'Quiet', d: 'No noise, no extra screens. A scenario and a finished frame.' },
                { t: 'Direct', d: 'What you wrote is what gets made. No hidden modes.' },
                { t: 'For adults', d: 'An 18+ studio. Entry only after an age check.' },
              ].map((item) => (
                <div key={item.t} className="bg-zinc-950 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">{item.t}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-6 flex justify-between text-sm text-zinc-500">
          <span>Seducecraft</span>
          <span>Adult studio · 18+</span>
        </div>
      </footer>
    </div>
  );
}
