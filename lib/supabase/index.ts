/**
 * Supabase モジュール
 */

// クライアント
export { getSupabaseClient, getSupabaseAnonClient } from './client';

// 型定義
export type { Database, ContentRow, ContentInsert, ContentUpdate } from './types';

// Contents CRUD
export {
  upsertContents,
  getContentById,
  getContents,
  deleteContent,
  deleteContentsByType,
} from './contents';
export type { UpsertResult } from './contents';

