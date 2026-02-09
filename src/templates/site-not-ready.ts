import { wrapInLayout } from './layout';
import { brandColor, animationStyles, statusMessages } from './styles';

export function siteNotReadyPage(status: string, businessName?: string): string {
  const statusInfo = statusMessages[status] || statusMessages.DEFAULT;
  const title = businessName ? `${businessName} - Coming Soon` : 'Site Coming Soon';

  const body = `
<style>${animationStyles}</style>
<div class="site-page-wrapper bg-gradient">
  <div style="text-align: center; padding: 3rem 2rem; max-width: 500px;">
    <div class="icon-bounce" style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
      ${statusInfo.icon}
    </div>
    <h1 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: -0.025em;">
      ${statusInfo.title}
    </h1>
    <p style="color: #6b7280; font-size: 1.125rem; line-height: 1.6; margin-bottom: 2rem;">
      ${statusInfo.message}
    </p>
    <div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-bottom: 2rem;">
      <div style="width: 200px; height: 6px; background-color: #e5e7eb; border-radius: 9999px; overflow: hidden;">
        <div class="progress-fill" style="width: 40%; height: 100%; background-color: ${brandColor}; border-radius: 9999px;"></div>
      </div>
    </div>
    <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: white; border-radius: 9999px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); font-size: 0.875rem; color: #6b7280;">
      <div class="status-dot" style="width: 8px; height: 8px; background-color: ${brandColor}; border-radius: 50%;"></div>
      <span>Status: ${status.replace(/_/g, ' ')}</span>
    </div>
    <p style="margin-top: 3rem; font-size: 0.75rem; color: #9ca3af;">
      Powered by <span style="color: ${brandColor}; font-weight: 600;">Alloro</span>
    </p>
  </div>
</div>`;

  return wrapInLayout(title, body);
}
