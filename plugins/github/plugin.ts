/**
 * GitHub リリース情報取得プラグイン
 *
 * DataSourcePlugin インターフェースを実装し、
 * GitHubリポジトリのリリース情報を取得します。
 */

import type { DataSourcePlugin, PluginMetadata, PluginResult } from '../types';
import type { RepositoryReleases, GitHubPluginConfig, RepositoryIdentifier } from './types';
import { fetchRepositoriesReleases } from './fetcher';

/** デフォルトの対象リポジトリ */
export const DEFAULT_REPOSITORIES: RepositoryIdentifier[] = [
  { owner: 'tailwindlabs', name: 'tailwindcss' },
  { owner: 'sveltejs', name: 'kit' },
];

/** デフォルトの設定 */
const DEFAULT_CONFIG: GitHubPluginConfig = {
  repositories: DEFAULT_REPOSITORIES,
  releasesPerRepo: 10,
};

/**
 * GitHub リリース情報取得プラグイン
 */
export class GitHubReleasesPlugin implements DataSourcePlugin<RepositoryReleases, GitHubPluginConfig> {
  readonly metadata: PluginMetadata = {
    name: 'github-releases',
    description: 'Fetches release information from GitHub repositories using GraphQL API',
    version: '1.0.0',
    author: 'devWatchTower',
  };

  /**
   * 環境変数の検証
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!process.env.GITHUB_TOKEN) {
      errors.push('GITHUB_TOKEN environment variable is not set');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * プラグインの初期化
   */
  async initialize(): Promise<void> {
    // 現時点では特別な初期化処理は不要
    // 将来的にはトークンの有効性チェックなどを行う可能性あり
  }

  /**
   * リリース情報を取得
   *
   * @param config - 取得設定（省略時はデフォルト設定を使用）
   * @returns 取得結果
   */
  async fetch(config?: GitHubPluginConfig): Promise<PluginResult<RepositoryReleases>> {
    const mergedConfig: GitHubPluginConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    const { repositories, releasesPerRepo } = mergedConfig;

    const result = await fetchRepositoriesReleases(repositories, releasesPerRepo);

    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      source: {
        plugin: this.metadata.name,
        fetchedAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * GitHubプラグインのファクトリ関数
 */
export function createGitHubPlugin(): GitHubReleasesPlugin {
  return new GitHubReleasesPlugin();
}

