import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProjectByHostname } from '@/lib/services/project.service';
import { getPageToRender } from '@/lib/services/page.service';

export default async function HomePage() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  console.log('[Root Page] Hostname:', hostname);

  // Get BASE_DOMAIN from env
  const baseDomain = process.env.BASE_DOMAIN || 'sites.localhost';
  const [hostWithoutPort] = hostname.split(':');
  const [baseWithoutPort] = baseDomain.split(':');

  // Check if this is a site subdomain
  const isSiteSubdomain =
    hostWithoutPort !== 'localhost' &&
    hostWithoutPort !== baseWithoutPort &&
    hostWithoutPort.endsWith(`.${baseWithoutPort}`);

  console.log('[Root Page] Is site subdomain?', isSiteSubdomain);

  if (isSiteSubdomain) {
    // This is a site preview - render the site
    const project = await getProjectByHostname(hostWithoutPort);

    if (!project) {
      return (
        <html>
          <head><title>Site Not Found</title></head>
          <body style={{ fontFamily: 'system-ui', padding: '2rem', textAlign: 'center' }}>
            <h1>Site Not Found</h1>
            <p>No site exists at <code>{hostname}</code></p>
          </body>
        </html>
      );
    }

    const page = await getPageToRender(project.id, '/');

    if (!page) {
      return (
        <html>
          <head><title>Page Not Found</title></head>
          <body style={{ fontFamily: 'system-ui', padding: '2rem', textAlign: 'center' }}>
            <h1>Page Not Found</h1>
            <p>This site exists but has no published content yet.</p>
          </body>
        </html>
      );
    }

    console.log('[Root Page] Rendering site page:', page.version, page.status);

    // Return raw HTML
    return (
      <div
        dangerouslySetInnerHTML={{ __html: page.htmlContent }}
        suppressHydrationWarning
      />
    );
  }

  // This is the main app - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Website Builder</h1>
        <p className="text-xl mb-8 opacity-90">
          AI-powered website generation for local businesses
        </p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-left">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-2">
            <li>✓ Phase 1: Database schema complete</li>
            <li>✓ Phase 2: Hostname routing complete</li>
            <li className="opacity-50">Phase 3: Job system</li>
            <li className="opacity-50">Phase 4: GBP integration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
