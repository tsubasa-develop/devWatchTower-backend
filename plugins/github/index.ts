/**
 * GitHub プラグイン
 *
 * GitHubリポジトリのリリース情報を取得するプラグイン
 */

// プラグインクラスとファクトリ
export { GitHubReleasesPlugin, createGitHubPlugin, DEFAULT_REPOSITORIES } from './plugin';

// 型定義
export type {
  GitHubRelease,
  GitHubReleaseAsset,
  RepositoryReleases,
  RepositoryIdentifier,
  GitHubPluginConfig,
} from './types';

// データ変換
export { transformToContents } from './transformer';

// 低レベルAPI（必要に応じて直接使用）
export { fetchRepositoriesReleases } from './fetcher';
export { fetchGraphQL } from './client';

