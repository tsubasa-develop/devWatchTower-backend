
import type { ContentInsert } from '@/lib/supabase';
import type { RSSFeed, RSSItem } from './types';
import { createHash } from 'crypto';

function generateArticleId(guid: string): string {
  const hash = createHash('sha256')
    .update(`line-techblog:${guid}`)
    .digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16), // version 4
    '8' + hash.slice(17, 20), // variant
    hash.slice(20, 32),
  ].join('-');
}

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

function transformItem(feed: RSSFeed, item: RSSItem): ContentInsert {
  const id = generateArticleId(item.guid);

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

export function transformToContents(
  feeds: RSSFeed[],
  options: {
    maxItemsPerFeed?: number;
  } = {}
): ContentInsert[] {
  const { maxItemsPerFeed } = options;

  const contents: ContentInsert[] = [];

  for (const feed of feeds) {
    let items = feed.items;

    if (maxItemsPerFeed !== undefined) {
      items = items.slice(0, maxItemsPerFeed);
    }

    for (const item of items) {
      contents.push(transformItem(feed, item));
    }
  }

  return contents;
}

