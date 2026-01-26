import { NextRequest, NextResponse } from 'next/server';
import { contentListItems } from '@/lib/data/contents';
import type { ContentListItem, ContentListResponse, ErrorResponse, SortField, SortOrder } from '@/lib/types';

// 有効なソートフィールド
const VALID_SORT_FIELDS: SortField[] = ['created_at', 'updated_at', 'published_at', 'title'];

/**
 * GET /api/contents - 公開コンテンツ一覧取得
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // クエリパラメータを取得
  const typeFilter = searchParams.get('type') ?? undefined;
  const searchQuery = searchParams.get('q') ?? undefined;
  let limit = parseInt(searchParams.get('limit') ?? '20') || 20;
  let offset = parseInt(searchParams.get('offset') ?? '0') || 0;
  let sort: SortField = (searchParams.get('sort') as SortField) || 'published_at';
  const order: SortOrder = (searchParams.get('order') as SortOrder) || 'desc';

  // limitの範囲チェック (1-200)
  if (limit < 1) limit = 1;
  if (limit > 200) limit = 200;

  // offsetの範囲チェック (0以上)
  if (offset < 0) offset = 0;

  // ソートフィールドの検証
  if (!VALID_SORT_FIELDS.includes(sort)) {
    sort = 'published_at';
  }

  // qの長さチェック
  if (searchQuery && searchQuery.length > 200) {
    const error: ErrorResponse = {
      code: 'bad_request',
      message: '検索キーワードは200文字以内で指定してください'
    };
    return NextResponse.json(error, { status: 400 });
  }

  // フィルタリング処理
  let filteredItems = [...contentListItems];

  // typeでフィルタリング
  if (typeFilter) {
    filteredItems = filteredItems.filter(item => item.type === typeFilter);
  }

  // qでフリーテキスト検索（タイトルとサマリー）
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const summaryMatch = item.summary?.toLowerCase().includes(lowerQuery) ?? false;
      return titleMatch || summaryMatch;
    });
  }

  // ソート処理
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

  // 総件数を保存
  const total = filteredItems.length;

  // ページネーション処理
  const paginatedItems = filteredItems.slice(offset, offset + limit);

  // レスポンスを返す
  const response: ContentListResponse = {
    items: paginatedItems,
    limit,
    offset,
    total
  };

  return NextResponse.json(response);
}

