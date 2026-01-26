/**
 * GitHub プラグインのデータを Content 型に変換
 *
 * リポジトリのリリース情報を API の Content 型に変換します
 */

import type { ContentInsert } from '@/lib/supabase';
import type { RepositoryReleases, GitHubRelease } from './types';
import { createHash } from 'crypto';

/**
 * リポジトリ + リリースから一意の ID を生成
 * 同じリポジトリ・タグ名なら同じ ID になる（冪等性のため）
 */
function generateReleaseId(fullName: string, tagName: string): string {
  const hash = createHash('sha256')
    .update(`github:${fullName}:${tagName}`)
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
 * リリースのメタデータを構築
 */
function buildReleaseMetadata(
  repo: RepositoryReleases,
  release: GitHubRelease
): Record<string, unknown> {
  const totalDownloads = release.assets.reduce((sum, a) => sum + a.downloadCount, 0);

  return {
    source: 'github',
    repository: {
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      url: repo.url,
      stars: repo.stargazerCount,
    },
    release: {
      tagName: release.tagName,
      url: release.url,
      isPrerelease: release.isPrerelease,
      isDraft: release.isDraft,
      totalDownloads,
      assetCount: release.assets.length,
    },
  };
}

/**
 * 単一リリースを Content 型に変換
 */
function transformRelease(
  repo: RepositoryReleases,
  release: GitHubRelease
): ContentInsert {
  const id = generateReleaseId(repo.fullName, release.tagName);

  // タイトル: リポジトリ名とタグ名を組み合わせ
  const title = `${repo.fullName} ${release.tagName}`;

  // 要約: リリース名があればそれ、なければリポジトリの説明
  const summary = release.name || repo.description || `Release ${release.tagName}`;

  // 本文: リリースノート
  const body = release.description || null;

  // 公開日時: リリースの公開日、なければ現在時刻
  const publishedAt = release.publishedAt || new Date().toISOString();

  return {
    id,
    type: 'repository',
    title,
    summary,
    body,
    metadata: buildReleaseMetadata(repo, release),
    published_at: publishedAt,
  };
}

/**
 * 複数リポジトリのリリース情報を Content 配列に変換
 *
 * @param repositories - リポジトリリリース情報の配列
 * @param options - 変換オプション
 * @returns Content 型の配列
 */
export function transformToContents(
  repositories: RepositoryReleases[],
  options: {
    /** 各リポジトリから変換するリリース数（デフォルト: 全て） */
    maxReleasesPerRepo?: number;
    /** ドラフトリリースを含めるか */
    includeDrafts?: boolean;
    /** プレリリースを含めるか */
    includePrereleases?: boolean;
  } = {}
): ContentInsert[] {
  const {
    maxReleasesPerRepo,
    includeDrafts = false,
    includePrereleases = true,
  } = options;

  const contents: ContentInsert[] = [];

  for (const repo of repositories) {
    let releases = repo.releases;

    // フィルタリング
    if (!includeDrafts) {
      releases = releases.filter((r) => !r.isDraft);
    }
    if (!includePrereleases) {
      releases = releases.filter((r) => !r.isPrerelease);
    }

    // 数の制限
    if (maxReleasesPerRepo !== undefined) {
      releases = releases.slice(0, maxReleasesPerRepo);
    }

    // 変換
    for (const release of releases) {
      contents.push(transformRelease(repo, release));
    }
  }

  return contents;
}

