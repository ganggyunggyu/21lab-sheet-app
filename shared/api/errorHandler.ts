import { NextResponse } from 'next/server';

export const createErrorResponse = (
  message: string,
  status: number,
  details?: unknown
) => {
  const body: { error: string; details?: string } = { error: message };

  if (details) {
    body.details = details instanceof Error ? details.message : String(details);
  }

  return NextResponse.json(body, { status });
};

export const createSuccessResponse = <T>(data: T, status = 200) => {
  return NextResponse.json(data, { status });
};
