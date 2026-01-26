/**
 * LINE TechBlog RSSフィード取得ロジック
 */

import type { RSSFeed, RSSItem } from './types';

/** デフォルトのフィードURL */
export const DEFAULT_FEED_URL = 'https://techblog.lycorp.co.jp/ja/feed/index.xml';

/**
 * XMLからRSSアイテムを抽出するヘルパー関数
 * 属性付きタグ（例: <guid isPermaLink="true">）にも対応
 */
function extractTextContent(xml: string, tagName: string): string {
  // CDATAセクションを含む場合と含まない場合、属性付きタグにも対応
  // パターン: <tagName ...attributes...>content</tagName> または <tagName>content</tagName>
  const cdataMatch = xml.match(
    new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`)
  );
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // 属性付きまたは属性なしのシンプルなタグ
  const simpleMatch = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`));
  return simpleMatch ? simpleMatch[1].trim() : '';
}

/**
 * RSSのitem要素をパースする
 */
function parseRSSItem(itemXml: string): RSSItem {
  return {
    title: extractTextContent(itemXml, 'title'),
    description: extractTextContent(itemXml, 'description'),
    link: extractTextContent(itemXml, 'link'),
    guid: extractTextContent(itemXml, 'guid'),
    pubDate: extractTextContent(itemXml, 'pubDate'),
  };
}

/**
 * RSSフィード全体をパースする
 */
function parseRSSFeed(xml: string): RSSFeed {
  const channelMatch = xml.match(/<channel>([\s\S]*)<\/channel>/);
  const channelXml = channelMatch ? channelMatch[1] : xml;

  // フィードのメタ情報を抽出
  const title = extractTextContent(channelXml, 'title');
  const description = extractTextContent(channelXml, 'description');
  const link = extractTextContent(channelXml, 'link');
  const lastBuildDate = extractTextContent(channelXml, 'lastBuildDate');

  // 各item要素を抽出
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

/**
 * RSSフィードを取得する
 *
 * @param feedUrl - フィードのURL
 * @param maxItems - 取得する最大アイテム数（省略時は全件）
 * @returns 取得結果
 */
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

    // maxItems が指定されていれば制限
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

