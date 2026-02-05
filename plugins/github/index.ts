
export { GitHubReleasesPlugin, createGitHubPlugin, DEFAULT_REPOSITORIES } from './plugin';

export type {
  GitHubRelease,
  GitHubReleaseAsset,
  RepositoryReleases,
  RepositoryIdentifier,
  GitHubPluginConfig,
} from './types';

export { transformToContents } from './transformer';

export { fetchRepositoriesReleases } from './fetcher';
export { fetchGraphQL } from './client';

