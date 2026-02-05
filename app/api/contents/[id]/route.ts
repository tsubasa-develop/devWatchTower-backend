import { NextRequest, NextResponse } from 'next/server';
import { contentDatabase } from '@/lib/data/contents';
import { getContentById } from '@/lib/supabase/contents';
import type { Content, ErrorResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

  const useMockData = process.env.USE_MOCK_DATA === 'true';

  if (useMockData) {
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
  } else {
    const row = await getContentById(contentId);

    if (row) {
      const content: Content = {
        id: row.id,
        type: row.type,
        title: row.title,
        summary: row.summary,
        body: row.body,
        metadata: JSON.stringify(row.metadata),
        published_at: row.published_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
      return NextResponse.json(content);
    } else {
      const error: ErrorResponse = {
        code: 'not_found',
        message: `ID "${contentId}" のコンテンツが見つかりません`
      };
      return NextResponse.json(error, { status: 404 });
    }
  }
}

