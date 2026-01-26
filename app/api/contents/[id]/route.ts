import { NextRequest, NextResponse } from 'next/server';
import { contentDatabase } from '@/lib/data/contents';
import type { ErrorResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contents/:id - IDによる公開コンテンツ取得
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id: contentId } = await params;

  if (!contentId) {
    const error: ErrorResponse = {
      code: 'bad_request',
      message: 'コンテンツIDが指定されていません'
    };
    return NextResponse.json(error, { status: 400 });
  }

  const content = contentDatabase[contentId];

  if (content) {
    return NextResponse.json(content);
  } else {
    const error: ErrorResponse = {
      code: 'not_found',
      message: `ID "${contentId}" のコンテンツが見つかりません`
    };
    return NextResponse.json(error, { status: 404 });
  }
}

