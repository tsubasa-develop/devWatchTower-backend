/**
 * Contents テーブルの CRUD 操作
 */

import { getSupabaseClient } from './client';
import type { ContentInsert, ContentRow, ContentUpdate } from './types';

export interface UpsertResult {
  success: boolean;
  data?: ContentRow[];
  error?: string;
  inserted: number;
  updated: number;
}

/**
 * コンテンツを作成または更新（Upsert）
 *
 * id が指定されている場合は更新、なければ新規作成
 *
 * @param contents - 挿入/更新するコンテンツ配列
 * @returns 結果
 */
export async function upsertContents(contents: ContentInsert[]): Promise<UpsertResult> {
  if (contents.length === 0) {
    return { success: true, inserted: 0, updated: 0 };
  }

  // 重複IDを除去（同じIDが複数ある場合は後のものを優先）
  const uniqueContents = Array.from(
    new Map(contents.map((c) => [c.id, c])).values()
  );

  const client = getSupabaseClient();

  // id が指定されているものは更新対象として確認
  const existingIds = uniqueContents.filter((c) => c.id).map((c) => c.id);

  let existingCount = 0;
  if (existingIds.length > 0) {
    const { count } = await client
      .from('contents')
      .select('id', { count: 'exact', head: true })
      .in('id', existingIds);
    existingCount = count || 0;
  }

  const { data, error } = await client
    .from('contents')
    .upsert(uniqueContents as any, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    return {
      success: false,
      error: error.message,
      inserted: 0,
      updated: 0,
    };
  }

  return {
    success: true,
    data: data || [],
    inserted: uniqueContents.length - existingCount,
    updated: existingCount,
  };
}

/**
 * コンテンツを取得（ID指定）
 */
export async function getContentById(id: string): Promise<ContentRow | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('contents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching content:', error.message);
    return null;
  }

  return data;
}

/**
 * コンテンツ一覧を取得
 */
export async function getContents(options: {
  type?: string;
  q?: string;
  limit?: number;
  offset?: number;
  orderBy?: keyof ContentRow;
  order?: 'asc' | 'desc';
}): Promise<{ data: ContentRow[]; total: number }> {
  const client = getSupabaseClient();
  const { type, q, limit = 20, offset = 0, orderBy = 'published_at', order = 'desc' } = options;

  let query = client.from('contents').select('*', { count: 'exact' });

  if (type) {
    query = query.eq('type', type);
  }

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }

  query = query.order(orderBy, { ascending: order === 'asc' });
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching contents:', error.message);
    return { data: [], total: 0 };
  }

  return {
    data: data || [],
    total: count || 0,
  };
}

/**
 * コンテンツを削除
 */
export async function deleteContent(id: string): Promise<boolean> {
  const client = getSupabaseClient();

  const { error } = await client.from('contents').delete().eq('id', id);

  if (error) {
    console.error('Error deleting content:', error.message);
    return false;
  }

  return true;
}

/**
 * 指定した type のコンテンツを全削除（同期用）
 */
export async function deleteContentsByType(type: string): Promise<number> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('contents')
    .delete()
    .eq('type', type)
    .select('id');

  if (error) {
    console.error('Error deleting contents by type:', error.message);
    return 0;
  }

  return data?.length || 0;
}

