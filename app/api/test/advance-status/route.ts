import { NextRequest, NextResponse } from 'next/server';
import { advanceStatus } from '@/lib/services/project-status.service';

/**
 * TEST ONLY: Advance project status
 * DELETE THIS IN PRODUCTION
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, toStatus } = body;

    if (!projectId || !toStatus) {
      return NextResponse.json(
        { error: 'Missing projectId or toStatus' },
        { status: 400 }
      );
    }

    const project = await advanceStatus(projectId, toStatus);

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 400 }
    );
  }
}
