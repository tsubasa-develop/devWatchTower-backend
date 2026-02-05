
import type { RSSFeed, RSSItem } from './types';

export const DEFAULT_FEED_URL = 'https://techblog.lycorp.co.jp/ja/feed/index.xml';

function extractTextContent(xml: string, tagName: string): string {
  const cdataMatch = xml.match(
    new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`)
  );
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  const simpleMatch = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`));
  return simpleMatch ? simpleMatch[1].trim() : '';
}

function parseRSSItem(itemXml: string): RSSItem {
  return {
    title: extractTextContent(itemXml, 'title'),
    description: extractTextContent(itemXml, 'description'),
    link: extractTextContent(itemXml, 'link'),
    guid: extractTextContent(itemXml, 'guid'),
    pubDate: extractTextContent(itemXml, 'pubDate'),
  };
}

function parseRSSFeed(xml: string): RSSFeed {
  const channelMatch = xml.match(/<channel>([\s\S]*)<\/channel>/);
  const channelXml = channelMatch ? channelMatch[1] : xml;

  const title = extractTextContent(channelXml, 'title');
  const description = extractTextContent(channelXml, 'description');
  const link = extractTextContent(channelXml, 'link');
  const lastBuildDate = extractTextContent(channelXml, 'lastBuildDate');

  const itemMatches = channelXml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const items = itemMatches.map(parseRSSItem);

  return {
    title,
    description,
    link,
    lastBuildDate,
    items,
  };
}

export async function fetchRSSFeed(
  feedUrl: string = DEFAULT_FEED_URL,
  maxItems?: number
): Promise<{ success: boolean; data: RSSFeed | null; errors?: string[] }> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'DevWatchTower/1.0',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        errors: [`Failed to fetch RSS feed: ${response.status} ${response.statusText}`],
      };
    }

    const xml = await response.text();
    const feed = parseRSSFeed(xml);

    if (maxItems !== undefined && maxItems > 0) {
      feed.items = feed.items.slice(0, maxItems);
    }

    return {
      success: true,
      data: feed,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
}

