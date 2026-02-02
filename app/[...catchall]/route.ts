import { NextRequest, NextResponse } from 'next/server';
import { getProjectByHostname } from '@/lib/services/project.service';
import { getPageToRender } from '@/lib/services/page.service';

/**
 * Catch-all route handler for hostname-based site rendering
 * This acts as a fallback for all routes that don't match other App Router pages
 */
export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  console.log('[Catchall Route] Request:', { hostname, pathname });

  // Get BASE_DOMAIN from env
  const baseDomain = process.env.BASE_DOMAIN || 'sites.localhost';
  const [hostWithoutPort] = hostname.split(':');
  const [baseWithoutPort] = baseDomain.split(':');

  console.log('[Catchall Route] Checking hostname:', { hostWithoutPort, baseWithoutPort });

  // Check if this is a subdomain of our base domain
  if (
    hostWithoutPort === 'localhost' ||
    hostWithoutPort === baseWithoutPort ||
    !hostWithoutPort.endsWith(`.${baseWithoutPort}`)
  ) {
    console.log('[Catchall Route] Not a site subdomain, passing through');
    // Not a site preview, let Next.js handle normally
    return NextResponse.next();
  }

  console.log('[Catchall Route] Site subdomain detected!');

  // Lookup project by hostname (strip port for DB lookup)
  const project = await getProjectByHostname(hostWithoutPort);

  if (!project) {
    console.log('[Catchall Route] Project not found');
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Site Not Found</title></head>
        <body style="font-family: system-ui; padding: 2rem; text-align: center;">
          <h1>Site Not Found</h1>
          <p>No site exists at <code>${hostname}</code></p>
        </body>
      </html>
      `,
      {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  console.log('[Catchall Route] Found project:', project.id);

  // Load the page
  const page = await getPageToRender(project.id, '/');

  if (!page) {
    console.log('[Catchall Route] No page found');
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Page Not Found</title></head>
        <body style="font-family: system-ui; padding: 2rem; text-align: center;">
          <h1>Page Not Found</h1>
          <p>This site exists but has no published content yet.</p>
        </body>
      </html>
      `,
      {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  console.log('[Catchall Route] Rendering page:', page.version, page.status);

  // Return the raw HTML
  return new NextResponse(page.htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
