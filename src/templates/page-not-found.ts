import { wrapInLayout } from './layout';
import { brandColor, animationStyles, icons } from './styles';

export function pageNotFoundPage(businessName?: string): string {
  const title = businessName ? `${businessName} - Page Not Found` : 'Page Not Found';

  const body = `
<style>${animationStyles}</style>
<div class="site-page-wrapper" style="background-color: #fafafa;">
  <div style="text-align: center; padding: 3rem 2rem; max-width: 500px;">
    <div style="font-size: 6rem; font-weight: 800; color: ${brandColor}; line-height: 1; margin-bottom: 1rem; opacity: 0.2;">
      404
    </div>
    <h1 style="color: #1f2937; font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem;">
      Page Not Found
    </h1>
    <p style="color: #6b7280; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem;">
      The page you&#39;re looking for doesn&#39;t exist or has been moved.
    </p>
    <a href="/" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background-color: ${brandColor}; color: white; border-radius: 0.75rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; box-shadow: 0 4px 14px ${brandColor}40;">
      ${icons.arrowLeft}
      Go to Homepage
    </a>
    <p style="margin-top: 3rem; font-size: 0.75rem; color: #9ca3af;">
      Powered by <span style="color: ${brandColor}; font-weight: 600;">Alloro</span>
    </p>
  </div>
</div>`;

  return wrapInLayout(title, body);
}
