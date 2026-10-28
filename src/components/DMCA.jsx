export default function DMCA({ onBack }) {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        
        <h1 className="text-3xl font-semibold mb-6">DMCA / Content Removal</h1>
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>If you believe content on Seducecraft infringes your rights, send a notice to dmca@seducecraft.app with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your contact information</li>
            <li>Description of the content and its location (URL)</li>
            <li>Statement of good faith belief</li>
            <li>Statement of accuracy under penalty of perjury</li>
            <li>Your signature (electronic is fine)</li>
          </ul>
          <p>We will review and remove infringing content promptly.</p>
        </div>
      </div>
    </div>
  );
}
