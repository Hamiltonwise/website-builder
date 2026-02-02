import { prisma } from '../db';
import type { Job, JobType, JobStatus } from '@prisma/client';

/**
 * Create a new job for a project
 */
export async function createJob(
  projectId: string,
  type: JobType,
  payload?: any
): Promise<Job> {
  return prisma.job.create({
    data: {
      projectId,
      type,
      status: 'pending',
      attempts: 0,
      payload: payload || null,
    },
  });
}

/**
 * Start a job (mark as running)
 */
export async function startJob(jobId: string): Promise<Job> {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'running',
      startedAt: new Date(),
      attempts: {
        increment: 1,
      },
    },
  });
}

/**
 * Mark a job as successfully completed
 */
export async function completeJob(jobId: string, result?: any): Promise<Job> {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'success',
      finishedAt: new Date(),
      payload: result || undefined,
      error: null,
    },
  });
}

/**
 * Mark a job as failed with error message
 */
export async function failJob(jobId: string, error: string): Promise<Job> {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'failed',
      finishedAt: new Date(),
      error,
    },
  });
}

/**
 * Get all active jobs (pending or running) for a project
 */
export async function getActiveJobs(projectId: string): Promise<Job[]> {
  return prisma.job.findMany({
    where: {
      projectId,
      status: {
        in: ['pending', 'running'],
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all jobs for a project
 */
export async function getJobsByProject(projectId: string): Promise<Job[]> {
  return prisma.job.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a job by ID
 */
export async function getJobById(id: string): Promise<Job | null> {
  return prisma.job.findUnique({
    where: { id },
  });
}

/**
 * Check if a project has an active job of a specific type
 */
export async function hasActiveJobOfType(
  projectId: string,
  type: JobType
): Promise<boolean> {
  const job = await prisma.job.findFirst({
    where: {
      projectId,
      type,
      status: {
        in: ['pending', 'running'],
      },
    },
  });

  return job !== null;
}

/**
 * Get the most recent job of a specific type for a project
 */
export async function getLatestJobOfType(
  projectId: string,
  type: JobType
): Promise<Job | null> {
  return prisma.job.findFirst({
    where: {
      projectId,
      type,
    },
    orderBy: { createdAt: 'desc' },
  });
}
