import { prisma } from '../db';
import type { Page, PageStatus } from '@prisma/client';

/**
 * Create a new page version for a project
 * - Marks any existing draft as inactive
 * - Creates new page with incremented version
 */
export async function createPageVersion(
  projectId: string,
  path: string,
  htmlContent: string
): Promise<Page> {
  // Get the latest version for this project+path
  const latestPage = await prisma.page.findFirst({
    where: { projectId, path },
    orderBy: { version: 'desc' },
  });

  const newVersion = latestPage ? latestPage.version + 1 : 1;

  // Mark any existing draft as inactive
  await prisma.page.updateMany({
    where: {
      projectId,
      path,
      status: 'draft',
    },
    data: {
      status: 'inactive',
    },
  });

  // Create the new draft
  return prisma.page.create({
    data: {
      projectId,
      path,
      version: newVersion,
      status: 'draft',
      htmlContent,
    },
  });
}

/**
 * Get the published page for a project and path
 */
export async function getPublishedPage(
  projectId: string,
  path: string
): Promise<Page | null> {
  return prisma.page.findFirst({
    where: {
      projectId,
      path,
      status: 'published',
    },
  });
}

/**
 * Get the draft page for a project and path
 */
export async function getDraftPage(
  projectId: string,
  path: string
): Promise<Page | null> {
  return prisma.page.findFirst({
    where: {
      projectId,
      path,
      status: 'draft',
    },
  });
}

/**
 * Get all page versions for a project and path, ordered by version descending
 */
export async function getAllPageVersions(
  projectId: string,
  path: string
): Promise<Page[]> {
  return prisma.page.findMany({
    where: {
      projectId,
      path,
    },
    orderBy: { version: 'desc' },
  });
}

/**
 * Get a page by its ID
 */
export async function getPageById(id: string): Promise<Page | null> {
  return prisma.page.findUnique({
    where: { id },
  });
}

/**
 * Get the page to render for a project (published first, then draft)
 */
export async function getPageToRender(
  projectId: string,
  path: string
): Promise<Page | null> {
  // Try published first
  const published = await getPublishedPage(projectId, path);
  if (published) return published;

  // Fallback to draft
  return getDraftPage(projectId, path);
}
