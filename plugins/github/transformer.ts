
import type { ContentInsert } from '@/lib/supabase';
import type { RepositoryReleases, GitHubRelease } from './types';
import { createHash } from 'crypto';

function generateReleaseId(fullName: string, tagName: string): string {
  const hash = createHash('sha256')
    .update(`github:${fullName}:${tagName}`)
    .digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16), // version 4
    '8' + hash.slice(17, 20), // variant
    hash.slice(20, 32),
  ].join('-');
}

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

function transformRelease(
  repo: RepositoryReleases,
  release: GitHubRelease
): ContentInsert {
  const id = generateReleaseId(repo.fullName, release.tagName);

  const title = `${repo.fullName} ${release.tagName}`;

  const summary = release.name || repo.description || `Release ${release.tagName}`;

  const body = release.description || null;

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

export function transformToContents(
  repositories: RepositoryReleases[],
  options: {
    maxReleasesPerRepo?: number;
    includeDrafts?: boolean;
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

    if (!includeDrafts) {
      releases = releases.filter((r) => !r.isDraft);
    }
    if (!includePrereleases) {
      releases = releases.filter((r) => !r.isPrerelease);
    }

    if (maxReleasesPerRepo !== undefined) {
      releases = releases.slice(0, maxReleasesPerRepo);
    }

    for (const release of releases) {
      contents.push(transformRelease(repo, release));
    }
  }

  return contents;
}

