import { NextResponse } from 'next/server';

export const createErrorResponse = (
  message: string,
  status: number,
  details?: unknown
) => {
  return NextResponse.json(
    {
      error: message,
      ...(details && {
        details: details instanceof Error ? details.message : String(details),
      }),
    },
    { status }
  );
};

export const createSuccessResponse = <T>(data: T, status = 200) => {
  return NextResponse.json(data, { status });
};
