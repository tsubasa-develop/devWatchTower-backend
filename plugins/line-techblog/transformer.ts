/**
 * LINE TechBlog プラグインのデータを Content 型に変換
 *
 * RSSフィードのアイテムを API の Content 型に変換します
 */

import type { ContentInsert } from '@/lib/supabase';
import type { RSSFeed, RSSItem } from './types';
import { createHash } from 'crypto';

/**
 * RSSアイテムから一意の ID を生成
 * 同じguidなら同じ ID になる（冪等性のため）
 */
function generateArticleId(guid: string): string {
  const hash = createHash('sha256')
    .update(`line-techblog:${guid}`)
    .digest('hex');
  // UUID v4 形式に変換
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16), // version 4
    '8' + hash.slice(17, 20), // variant
    hash.slice(20, 32),
  ].join('-');
}

/**
 * 記事のメタデータを構築
 */
function buildArticleMetadata(
  feed: RSSFeed,
  item: RSSItem
): Record<string, unknown> {
  return {
    source: 'line-techblog',
    feed: {
      title: feed.title,
      link: feed.link,
    },
    article: {
      guid: item.guid,
      url: item.link,
      pubDate: item.pubDate,
    },
  };
}

/**
 * 単一のRSSアイテムを Content 型に変換
 */
function transformItem(feed: RSSFeed, item: RSSItem): ContentInsert {
  const id = generateArticleId(item.guid);

  // 公開日時のパース（RSSの日付形式に対応）
  const publishedAt = item.pubDate
    ? new Date(item.pubDate).toISOString()
    : new Date().toISOString();

  return {
    id,
    type: 'article',
    title: item.title,
    summary: item.description,
    body: null, // RSSフィードには本文は含まれない
    metadata: buildArticleMetadata(feed, item),
    published_at: publishedAt,
  };
}

/**
 * RSSフィードを Content 配列に変換
 *
 * @param feeds - RSSフィードの配列
 * @param options - 変換オプション
 * @returns Content 型の配列
 */
export function transformToContents(
  feeds: RSSFeed[],
  options: {
    /** 各フィードから変換する記事数（デフォルト: 全て） */
    maxItemsPerFeed?: number;
  } = {}
): ContentInsert[] {
  const { maxItemsPerFeed } = options;

  const contents: ContentInsert[] = [];

  for (const feed of feeds) {
    let items = feed.items;

    // 数の制限
    if (maxItemsPerFeed !== undefined) {
      items = items.slice(0, maxItemsPerFeed);
    }

    // 変換
    for (const item of items) {
      contents.push(transformItem(feed, item));
    }
  }

  return contents;
}

