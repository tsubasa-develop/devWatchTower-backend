import { NextRequest, NextResponse } from 'next/server';
import { contentListItems } from '@/lib/data/contents';
import { getContents } from '@/lib/supabase/contents';
import type { ContentListItem, ContentListResponse, ErrorResponse, SortField, SortOrder } from '@/lib/types';

const VALID_SORT_FIELDS: SortField[] = ['created_at', 'updated_at', 'published_at', 'title'];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const typeFilter = searchParams.get('type') ?? undefined;
  const searchQuery = searchParams.get('q') ?? undefined;
  let limit = parseInt(searchParams.get('limit') ?? '20') || 20;
  let offset = parseInt(searchParams.get('offset') ?? '0') || 0;
  let sort: SortField = (searchParams.get('sort') as SortField) || 'published_at';
  const order: SortOrder = (searchParams.get('order') as SortOrder) || 'desc';

  if (limit < 1) limit = 1;
  if (limit > 200) limit = 200;

  if (offset < 0) offset = 0;

  if (!VALID_SORT_FIELDS.includes(sort)) {
    sort = 'published_at';
  }

  if (searchQuery && searchQuery.length > 200) {
    const error: ErrorResponse = {
      code: 'bad_request',
      message: '検索キーワードは200文字以内で指定してください'
    };
    return NextResponse.json(error, { status: 400 });
  }

  const useMockData = process.env.USE_MOCK_DATA === 'true';

  if (useMockData) {
    let filteredItems = [...contentListItems];

    if (typeFilter) {
      filteredItems = filteredItems.filter(item => item.type === typeFilter);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const summaryMatch = item.summary?.toLowerCase().includes(lowerQuery) ?? false;
        return titleMatch || summaryMatch;
      });
    }

    filteredItems.sort((a, b) => {
      let aValue: string = a[sort as keyof ContentListItem] as string;
      let bValue: string = b[sort as keyof ContentListItem] as string;

      if (sort === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filteredItems.length;
    const paginatedItems = filteredItems.slice(offset, offset + limit);

    const response: ContentListResponse = {
      items: paginatedItems,
      limit,
      offset,
      total
    };

    return NextResponse.json(response);
  } else {
    const { data: rows, total } = await getContents({
      type: typeFilter,
      q: searchQuery,
      limit,
      offset,
      orderBy: sort as any,
      order: order
    });

    const items: ContentListItem[] = rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      summary: row.summary,
      metadata: JSON.stringify(row.metadata),
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    const response: ContentListResponse = {
      items,
      limit,
      offset,
      total
    };

    return NextResponse.json(response);
  }
}

