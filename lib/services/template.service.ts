import { prisma } from '../db';
import type { Template } from '@prisma/client';

/**
 * Get the currently active template
 * In MVP, there's only one active template
 */
export async function getActiveTemplate(): Promise<Template | null> {
  return prisma.template.findFirst({
    where: { isActive: true },
  });
}

/**
 * Get a template by its ID
 */
export async function getTemplateById(id: string): Promise<Template | null> {
  return prisma.template.findUnique({
    where: { id },
  });
}

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<Template[]> {
  return prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Create a new template
 */
export async function createTemplate(
  name: string,
  htmlTemplate: string,
  isActive: boolean = false
): Promise<Template> {
  // If setting as active, deactivate all others first
  if (isActive) {
    await prisma.template.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  return prisma.template.create({
    data: {
      name,
      htmlTemplate,
      isActive,
    },
  });
}

/**
 * Set a template as the active template
 */
export async function setActiveTemplate(id: string): Promise<Template> {
  // Deactivate all templates
  await prisma.template.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Activate the specified template
  return prisma.template.update({
    where: { id },
    data: { isActive: true },
  });
}
