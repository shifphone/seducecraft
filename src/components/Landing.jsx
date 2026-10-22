export default function Landing({ onStart, isLoggedIn, userName, onLogin }) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm tracking-wide font-medium">Seducecraft</span>
            <span className="text-xs border border-accent text-accent px-2 py-0.5 rounded">18+</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-text-secondary hover:text-text-primary text-sm">🌐</button>
            <button onClick={isLoggedIn ? onStart : onLogin} className="text-sm text-text-secondary hover:text-text-primary">
              {isLoggedIn ? userName : 'Log in'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-widest text-accent mb-4">Adult studio · 18+</p>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-none mb-6">
                Make the idea <span className="italic text-text-secondary">visible.</span>
              </h1>
              <p className="text-lg text-text-secondary max-w-md mb-8 leading-relaxed">
                A studio for adults only. Images and video, no extra steps — access from 18.
              </p>
              <button
                onClick={onStart}
                className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-md text-base font-medium"
              >
                Start free
              </button>
            </div>
            <div className="bg-bg-secondary border border-border rounded-lg p-5">
              <div className="aspect-video rounded-md mb-4 overflow-hidden bg-black relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-red-900/20 to-black" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-48 bg-gradient-to-b from-red-600/30 to-transparent rounded-full blur-2xl" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-white/60">Studio preview</div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['Custom', 'Photo', 'Video', 'Templates'].map(item => (
                  <div key={item} className="bg-bg-tertiary rounded-md py-3 text-center text-sm text-text-secondary">{item}</div>
                ))}
              </div>
              <button
                onClick={onStart}
                className="w-full h-12 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium"
              >
                Open the studio
              </button>
              <p className="text-xs text-text-secondary text-center mt-3">18+ only · no sign-up</p>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-semibold mb-12">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: '01', t: 'Describe', d: 'A short line is enough. No technical setup to begin.' },
                { n: '02', t: 'Choose', d: 'Custom or a template on the left. Photo and video switch inside.' },
                { n: '03', t: 'Receive', d: 'The frame appears in the workspace. Refine and run again.' },
              ].map((item) => (
                <div key={item.n} className="bg-bg-secondary border border-border rounded-lg p-6">
                  <div className="text-xs text-accent mb-2">{item.n}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.t}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-semibold mb-12">Why Seducecraft</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { t: 'Simple', d: 'One screen. Nothing between the idea and the result.' },
                { t: 'Quiet', d: 'No noise, no extra screens. A scenario and a finished frame.' },
                { t: 'Direct', d: 'What you wrote is what gets made. No hidden modes.' },
                { t: 'For adults', d: 'An 18+ studio. Entry only after an age check.' },
              ].map((item) => (
                <div key={item.t} className="bg-bg-secondary border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">{item.t}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-text-secondary">
        Seducecraft · Adult studio · 18+
      </footer>
    </div>
  );
}
