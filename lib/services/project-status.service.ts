import { prisma } from '../db';
import type { Project, ProjectStatus } from '@prisma/client';

/**
 * Valid project status transitions
 * Status can only move forward through this flow
 */
const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  CREATED: ['GBP_SELECTED'],
  GBP_SELECTED: ['GBP_SCRAPED'],
  GBP_SCRAPED: ['IMAGES_ANALYZED'],
  IMAGES_ANALYZED: ['WEBSITE_SCRAPED'],
  WEBSITE_SCRAPED: ['HTML_GENERATED'],
  HTML_GENERATED: ['READY'],
  READY: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export function canTransition(
  fromStatus: ProjectStatus,
  toStatus: ProjectStatus
): boolean {
  const allowedTransitions = VALID_TRANSITIONS[fromStatus];
  return allowedTransitions.includes(toStatus);
}

/**
 * Get all allowed next statuses for a given status
 */
export function getAllowedNextStatuses(
  currentStatus: ProjectStatus
): ProjectStatus[] {
  return VALID_TRANSITIONS[currentStatus];
}

/**
 * Advance project status with validation
 * Throws error if transition is invalid
 */
export async function advanceStatus(
  projectId: string,
  toStatus: ProjectStatus
): Promise<Project> {
  // Get current project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  // Validate transition
  if (!canTransition(project.status, toStatus)) {
    throw new Error(
      `Invalid status transition: ${project.status} → ${toStatus}. ` +
        `Allowed transitions: ${VALID_TRANSITIONS[project.status].join(', ')}`
    );
  }

  // Update status
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { status: toStatus },
  });

  console.log(
    `[Status] Project ${projectId} transitioned: ${project.status} → ${toStatus}`
  );

  return updatedProject;
}

/**
 * Force set project status (bypasses validation - use with caution)
 * Useful for testing or administrative operations
 */
export async function forceSetStatus(
  projectId: string,
  status: ProjectStatus
): Promise<Project> {
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });

  console.log(`[Status] Project ${projectId} force set to: ${status}`);

  return updatedProject;
}

/**
 * Get human-readable status labels
 */
export function getStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    CREATED: 'Project Created',
    GBP_SELECTED: 'Business Profile Selected',
    GBP_SCRAPED: 'Profile Data Collected',
    IMAGES_ANALYZED: 'Images Analyzed',
    WEBSITE_SCRAPED: 'Website Content Scraped',
    HTML_GENERATED: 'Website Generated',
    READY: 'Ready to Publish',
  };

  return labels[status];
}

/**
 * Get status progress percentage (0-100)
 */
export function getStatusProgress(status: ProjectStatus): number {
  const statusOrder: ProjectStatus[] = [
    'CREATED',
    'GBP_SELECTED',
    'GBP_SCRAPED',
    'IMAGES_ANALYZED',
    'WEBSITE_SCRAPED',
    'HTML_GENERATED',
    'READY',
  ];

  const currentIndex = statusOrder.indexOf(status);
  const totalSteps = statusOrder.length - 1;

  return Math.round((currentIndex / totalSteps) * 100);
}
