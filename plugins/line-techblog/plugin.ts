
import type { DataSourcePlugin, PluginMetadata, PluginResult } from '../types';
import type { RSSFeed, LineTechblogPluginConfig } from './types';
import { fetchRSSFeed, DEFAULT_FEED_URL } from './fetcher';

const DEFAULT_CONFIG: LineTechblogPluginConfig = {
  feedUrl: DEFAULT_FEED_URL,
  maxItems: 50,
};

export class LineTechblogPlugin implements DataSourcePlugin<RSSFeed, LineTechblogPluginConfig> {
  readonly metadata: PluginMetadata = {
    name: 'line-techblog',
    description: 'Fetches articles from LINE TechBlog RSS feed',
    version: '1.0.0',
    author: 'devWatchTower',
  };

  validate(): { valid: boolean; errors: string[] } {
    return {
      valid: true,
      errors: [],
    };
  }

  async initialize(): Promise<void> {
  }

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

export function createLineTechblogPlugin(): LineTechblogPlugin {
  return new LineTechblogPlugin();
}

