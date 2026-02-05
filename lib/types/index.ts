export type { paths, components, operations } from './api-schema';

import type { components } from './api-schema';

export type Content = components['schemas']['Content'];
export type ContentListItem = components['schemas']['ContentListItem'];
export type ContentListResponse = components['schemas']['ContentListResponse'];
export type ErrorResponse = components['schemas']['Error'];

export type SortField = components['parameters']['QuerySort'];
export type SortOrder = components['parameters']['QueryOrder'];

export interface ContentQueryParams {
  type?: string;
  q?: string;
  limit?: number;
  offset?: number;
  sort?: SortField;
  order?: SortOrder;
}

