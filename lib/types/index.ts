// OpenAPI仕様書から自動生成された型をエクスポート
export type { paths, components, operations } from './api-schema';

// 使いやすいエイリアス型
import type { components } from './api-schema';

// スキーマ型のエイリアス
export type Content = components['schemas']['Content'];
export type ContentListItem = components['schemas']['ContentListItem'];
export type ContentListResponse = components['schemas']['ContentListResponse'];
export type ErrorResponse = components['schemas']['Error'];

// パラメータ型のエイリアス
export type SortField = components['parameters']['QuerySort'];
export type SortOrder = components['parameters']['QueryOrder'];

// クエリパラメータ型
export interface ContentQueryParams {
  type?: string;
  q?: string;
  limit?: number;
  offset?: number;
  sort?: SortField;
  order?: SortOrder;
}

