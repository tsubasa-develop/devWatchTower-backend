/**
 * LINE TechBlog RSSフィード取得プラグイン
 *
 * DataSourcePlugin インターフェースを実装し、
 * LINE TechBlogのRSSフィードから記事情報を取得します。
 */

import type { DataSourcePlugin, PluginMetadata, PluginResult } from '../types';
import type { RSSFeed, LineTechblogPluginConfig } from './types';
import { fetchRSSFeed, DEFAULT_FEED_URL } from './fetcher';

/** デフォルトの設定 */
const DEFAULT_CONFIG: LineTechblogPluginConfig = {
  feedUrl: DEFAULT_FEED_URL,
  maxItems: 50,
};

/**
 * LINE TechBlog RSSフィード取得プラグイン
 */
export class LineTechblogPlugin implements DataSourcePlugin<RSSFeed, LineTechblogPluginConfig> {
  readonly metadata: PluginMetadata = {
    name: 'line-techblog',
    description: 'Fetches articles from LINE TechBlog RSS feed',
    version: '1.0.0',
    author: 'devWatchTower',
  };

  /**
   * 環境変数の検証
   * このプラグインには特別な環境変数は不要
   */
  validate(): { valid: boolean; errors: string[] } {
    // LINE TechBlogのRSSフィードは公開されているため、
    // 特別な認証や環境変数は不要
    return {
      valid: true,
      errors: [],
    };
  }

  /**
   * プラグインの初期化
   */
  async initialize(): Promise<void> {
    // 現時点では特別な初期化処理は不要
  }

  /**
   * 記事情報を取得
   *
   * @param config - 取得設定（省略時はデフォルト設定を使用）
   * @returns 取得結果
   */
  async fetch(config?: LineTechblogPluginConfig): Promise<PluginResult<RSSFeed>> {
    const mergedConfig: LineTechblogPluginConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    const { feedUrl, maxItems } = mergedConfig;

    const result = await fetchRSSFeed(feedUrl, maxItems);

    if (!result.success || !result.data) {
      return {
        success: false,
        data: [],
        errors: result.errors,
        source: {
          plugin: this.metadata.name,
          fetchedAt: new Date().toISOString(),
        },
      };
    }

    return {
      success: true,
      data: [result.data], // 単一フィードを配列でラップ
      source: {
        plugin: this.metadata.name,
        fetchedAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * LINE TechBlogプラグインのファクトリ関数
 */
export function createLineTechblogPlugin(): LineTechblogPlugin {
  return new LineTechblogPlugin();
}

