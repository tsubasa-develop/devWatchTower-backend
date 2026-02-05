
import type { DataSourcePlugin, PluginMetadata, PluginResult } from '../types';
import type { RepositoryReleases, GitHubPluginConfig, RepositoryIdentifier } from './types';
import { fetchRepositoriesReleases } from './fetcher';

export const DEFAULT_REPOSITORIES: RepositoryIdentifier[] = [
  { owner: 'tailwindlabs', name: 'tailwindcss' },
  { owner: 'sveltejs', name: 'kit' },
];

const DEFAULT_CONFIG: GitHubPluginConfig = {
  repositories: DEFAULT_REPOSITORIES,
  releasesPerRepo: 10,
};

export class GitHubReleasesPlugin implements DataSourcePlugin<RepositoryReleases, GitHubPluginConfig> {
  readonly metadata: PluginMetadata = {
    name: 'github-releases',
    description: 'Fetches release information from GitHub repositories using GraphQL API',
    version: '1.0.0',
    author: 'devWatchTower',
  };

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

  async initialize(): Promise<void> {
  }

  async fetch(config?: GitHubPluginConfig): Promise<PluginResult<RepositoryReleases>> {
    const mergedConfig: GitHubPluginConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    const { repositories = [], releasesPerRepo } = mergedConfig;

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

export function createGitHubPlugin(): GitHubReleasesPlugin {
  return new GitHubReleasesPlugin();
}

