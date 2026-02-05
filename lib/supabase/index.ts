
export { getSupabaseClient, getSupabaseAnonClient } from './client';

export type { Database, ContentRow, ContentInsert, ContentUpdate } from './types';

export {
  upsertContents,
  getContentById,
  getContents,
  deleteContent,
  deleteContentsByType,
} from './contents';
export type { UpsertResult } from './contents';

