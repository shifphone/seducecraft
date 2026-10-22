export default function TermsModal({ onAccept, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary border border-border rounded-lg max-w-lg w-full p-6 shadow-2xl">
        <h3 className="text-xl font-semibold mb-4">Terms of Use</h3>
        <div className="text-sm text-text-secondary leading-relaxed mb-6 max-h-60 overflow-y-auto">
          <p className="mb-3">By using Seducecraft, you agree to use the platform responsibly. You are responsible for the content you generate.</p>
          <p className="mb-3">Do not generate illegal, harmful, or copyrighted content without proper rights. The platform may retain generated content for service improvement.</p>
          <p>These terms may be updated. Continued use constitutes acceptance of the current terms.</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">Close</button>
          <button onClick={onAccept} className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-md text-sm font-medium">Accept</button>
        </div>
      </div>
    </div>
  );
}
