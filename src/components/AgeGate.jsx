export default function AgeGate({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary border border-border rounded-2xl max-w-md w-full p-10 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-accent flex items-center justify-center text-accent font-semibold">18+</div>
        <div className="text-xs tracking-widest text-text-secondary mb-4">AGE VERIFICATION</div>
        <h2 className="text-3xl font-semibold mb-4 leading-tight">Confirm<br />age</h2>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">This content is intended only for users 18 years or older. Confirm that you are at least 18.</p>
        <div className="flex gap-3 justify-center mb-6">
          <button onClick={onAccept} className="bg-white text-black px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-100">I am 18 or older</button>
          <button className="border border-border text-text-secondary px-6 py-3 rounded-xl text-sm font-medium">No, I am under 18</button>
        </div>
        <p className="text-xs text-text-secondary/70">By continuing, you confirm that you are legally allowed to view adult content.</p>
      </div>
    </div>
  );
}
