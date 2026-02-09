import { Request, Response } from 'express';
import { getProjectByHostname } from '../services/project.service';
import { getPageToRender } from '../services/page.service';
import { siteNotFoundPage } from '../templates/site-not-found';
import { siteNotReadyPage } from '../templates/site-not-ready';
import { pageNotFoundPage } from '../templates/page-not-found';
import type { Project } from '../types';

function getBusinessName(project: Project): string | undefined {
  if (project.step_gbp_scrape && typeof project.step_gbp_scrape === 'object') {
    return (project.step_gbp_scrape as { name?: string }).name;
  }
  return undefined;
}

export async function siteRoute(req: Request, res: Response): Promise<void> {
  const hostname = res.locals.hostname as string;
  const pagePath = req.path === '/' ? '/' : req.path;

  const project = await getProjectByHostname(hostname);

  if (!project) {
    res.status(404).type('html').send(siteNotFoundPage(hostname));
    return;
  }

  const businessName = getBusinessName(project);

  // Check if project is ready
  if (project.status !== 'HTML_GENERATED' && project.status !== 'READY') {
    res.type('html').send(siteNotReadyPage(project.status, businessName));
    return;
  }

  // Get the page content
  const page = await getPageToRender(project.id, pagePath);

  if (!page) {
    // Try the home page as fallback for non-root paths
    if (pagePath !== '/') {
      const homePage = await getPageToRender(project.id, '/');
      if (homePage?.html_content?.html) {
        res.type('html').send(homePage.html_content.html);
        return;
      }
    }

    res.status(404).type('html').send(pageNotFoundPage(businessName));
    return;
  }

  const htmlToRender = page.html_content?.html || '';
  res.type('html').send(htmlToRender);
}
