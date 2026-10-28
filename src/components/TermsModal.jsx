export default function TermsModal({ onAccept, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary border border-border rounded-lg max-w-lg w-full p-6 shadow-2xl">
        <h3 className="text-xl font-semibold mb-4">Terms of Use</h3>
        <div className="text-sm text-text-secondary leading-relaxed mb-6 max-h-60 overflow-y-auto space-y-3">
          <p>By using Seducecraft you confirm you are 18 or older and legally allowed to view adult content in your jurisdiction.</p>
          <p>You are responsible for all content you generate and for any reference photos you upload. Do not upload images of minors or anyone without their consent. Do not generate illegal content.</p>
          <p>Generated content is for personal use. You may not redistribute it as your own work or use it to deceive others.</p>
          <p>We may remove content or suspend accounts that violate these terms. Credits are non-refundable except where required by law.</p>
          <p>These terms may be updated. Continued use means acceptance.</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">Close</button>
          <button onClick={onAccept} className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-md text-sm font-medium">Accept</button>
        </div>
      </div>
    </div>
  );
}
