/**
 * LINE TechBlog プラグイン固有の型定義
 */

/** RSSアイテム（記事） */
export interface RSSItem {
  /** 記事タイトル */
  title: string;
  /** 記事の概要・説明 */
  description: string;
  /** 記事URL */
  link: string;
  /** 一意識別子 */
  guid: string;
  /** 公開日時 */
  pubDate: string;
}

/** RSSフィード全体 */
export interface RSSFeed {
  /** フィードのタイトル */
  title: string;
  /** フィードの説明 */
  description: string;
  /** フィードのリンク */
  link: string;
  /** 最終ビルド日時 */
  lastBuildDate: string;
  /** 記事一覧 */
  items: RSSItem[];
}

/** LINE TechBlog プラグインの設定 */
export interface LineTechblogPluginConfig extends Record<string, unknown> {
  /** RSSフィードのURL（省略時はデフォルト） */
  feedUrl?: string;
  /** 取得する記事の最大数 */
  maxItems?: number;
}

