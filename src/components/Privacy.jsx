export default function Privacy({ onBack }) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="text-sm text-text-secondary hover:text-text-primary mb-6">← Back</button>
        <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>Last updated: October 2026</p>
          <h2 className="text-lg font-medium text-text-primary mt-6">What we collect</h2>
          <p>Account data (email or anonymous code), uploaded reference photos, generated images, usage logs. We do not sell personal data.</p>
          <h2 className="text-lg font-medium text-text-primary mt-6">How we use it</h2>
          <p>To provide the service, store your characters and gallery, process generations, and improve the platform. Reference photos are used only for your generations.</p>
          <h2 className="text-lg font-medium text-text-primary mt-6">Storage</h2>
          <p>Data is stored in Supabase (EU/US depending on region). Generated content and uploads are kept until you delete them or your account.</p>
          <h2 className="text-lg font-medium text-text-primary mt-6">Your rights</h2>
          <p>You can request deletion of your data by contacting us. Anonymous accounts are tied to a code — losing the code means losing access.</p>
          <h2 className="text-lg font-medium text-text-primary mt-6">Cookies</h2>
          <p>We use local storage for session state (language, credits, login). No third-party tracking cookies at this time.</p>
          <h2 className="text-lg font-medium text-text-primary mt-6">Contact</h2>
          <p>For privacy requests: privacy@seducecraft.app</p>
        </div>
      </div>
    </div>
  );
}
