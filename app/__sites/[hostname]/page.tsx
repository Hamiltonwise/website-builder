import { getProjectByHostname } from '@/lib/services/project.service';
import { getPageToRender } from '@/lib/services/page.service';
import { notFound } from 'next/navigation';

interface SitePageProps {
  params: Promise<{
    hostname: string;
  }>;
}

/**
 * Internal route for rendering site previews via hostname
 * This route is rewritten to by middleware - never accessed directly
 */
export default async function SitePage(props: SitePageProps) {
  const params = await props.params;
  const { hostname } = params;

  console.log('[__sites] Rendering for hostname:', hostname);

  // Lookup project by hostname
  const project = await getProjectByHostname(hostname);

  if (!project) {
    console.log('[__sites] Project not found for hostname:', hostname);
    notFound();
  }

  console.log('[__sites] Found project:', project.id, project.generatedHostname);

  // Load the page to render (published first, fallback to draft)
  const page = await getPageToRender(project.id, '/');

  if (!page) {
    console.log('[__sites] No page found for project:', project.id);
    notFound();
  }

  console.log('[__sites] Rendering page version:', page.version, 'status:', page.status);

  // Return raw HTML by using dangerouslySetInnerHTML
  // This is safe because we control the HTML content
  return (
    <div
      dangerouslySetInnerHTML={{ __html: page.htmlContent }}
      suppressHydrationWarning
    />
  );
}
