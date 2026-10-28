export default function CookiePolicy({ onBack }) {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        
        <h1 className="text-3xl font-semibold mb-6">Cookie Policy</h1>
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>Last updated: October 2026</p>
          <p>Seducecraft uses browser local storage to remember your language, login state, and credits. We do not use advertising or analytics cookies.</p>
          <h2 className="text-lg font-medium text-text-primary mt-6">What is stored</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Language preference</li>
            <li>Anonymous code or login session</li>
            <li>Credit balance (local cache)</li>
            <li>Age confirmation (session)</li>
          </ul>
          <h2 className="text-lg font-medium text-text-primary mt-6">How to clear</h2>
          <p>Clear your browser data for this site to remove all stored information.</p>
        </div>
      </div>
    </div>
  );
}
