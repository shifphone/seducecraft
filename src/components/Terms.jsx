export default function Terms({ onBack }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Terms of Service</h1>
      <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
        <p>Last updated: October 2026</p>
        <h2 className="text-lg font-medium text-text-primary mt-6">Age requirement</h2>
        <p>You must be 18 years or older to use Seducecraft. By using the service, you confirm you meet this requirement and are legally allowed to view adult content in your jurisdiction.</p>
        <h2 className="text-lg font-medium text-text-primary mt-6">Your content</h2>
        <p>You are responsible for all content you generate and any reference photos you upload. Do not upload images of minors or anyone without their consent. Do not generate illegal content.</p>
        <h2 className="text-lg font-medium text-text-primary mt-6">Usage</h2>
        <p>Generated content is for personal use. You may not redistribute it as your own work or use it to deceive others. We may remove content or suspend accounts that violate these terms.</p>
        <h2 className="text-lg font-medium text-text-primary mt-6">Credits</h2>
        <p>Credits are non-refundable except where required by law. Failed generations are automatically refunded.</p>
        <h2 className="text-lg font-medium text-text-primary mt-6">Changes</h2>
        <p>These terms may be updated. Continued use means acceptance of any changes.</p>
      </div>
    </div>
  );
}
