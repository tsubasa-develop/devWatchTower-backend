/**
 * GitHub リポジトリのリリース情報取得ロジック
 */

import { fetchGraphQL } from './client';
import type {
  RepositoryIdentifier,
  RepositoryReleases,
  RepositoryResponse,
  ReleaseNode,
  GitHubRelease,
} from './types';

/**
 * 複数リポジトリのリリース情報を一度のGraphQLリクエストで取得するためのクエリを生成
 */
export function buildReleasesQuery(repos: RepositoryIdentifier[], releasesPerRepo: number = 10): string {
  const repoQueries = repos
    .map((repo, index) => {
      const alias = `repo${index}`;
      return `
    ${alias}: repository(owner: "${repo.owner}", name: "${repo.name}") {
      owner {
        login
      }
      name
      url
      description
      stargazerCount
      releases(first: ${releasesPerRepo}, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          tagName
          name
          publishedAt
          description
          url
          isPrerelease
          isDraft
          releaseAssets(first: 10) {
            nodes {
              name
              downloadCount
              downloadUrl
              size
              contentType
            }
          }
        }
      }
    }`;
    })
    .join('\n');

  return `query GetRepositoriesReleases {
  ${repoQueries}
}`;
}

/**
 * GraphQLレスポンスからリリース情報を変換
 */
function transformReleaseNode(node: ReleaseNode): GitHubRelease {
  return {
    tagName: node.tagName,
    name: node.name,
    publishedAt: node.publishedAt,
    description: node.description,
    url: node.url,
    isPrerelease: node.isPrerelease,
    isDraft: node.isDraft,
    assets: node.releaseAssets.nodes.map((asset) => ({
      name: asset.name,
      downloadCount: asset.downloadCount,
      downloadUrl: asset.downloadUrl,
      size: asset.size,
      contentType: asset.contentType,
    })),
  };
}

/**
 * GraphQLレスポンスからリポジトリリリース情報を変換
 */
function transformRepositoryResponse(response: RepositoryResponse): RepositoryReleases {
  return {
    owner: response.owner.login,
    name: response.name,
    fullName: `${response.owner.login}/${response.name}`,
    url: response.url,
    description: response.description,
    stargazerCount: response.stargazerCount,
    releases: response.releases.nodes.map(transformReleaseNode),
  };
}

/**
 * 複数リポジトリのリリース情報を取得
 */
export async function fetchRepositoriesReleases(
  repos: RepositoryIdentifier[],
  releasesPerRepo: number = 10
): Promise<{ success: boolean; data: RepositoryReleases[]; errors?: string[] }> {
  if (repos.length === 0) {
    return { success: true, data: [] };
  }

  try {
    const query = buildReleasesQuery(repos, releasesPerRepo);
    const response = await fetchGraphQL<Record<string, RepositoryResponse>>(query);

    if (response.errors && response.errors.length > 0) {
      return {
        success: false,
        data: [],
        errors: response.errors.map((e) => e.message),
      };
    }

    if (!response.data) {
      return {
        success: false,
        data: [],
        errors: ['No data received from GitHub API'],
      };
    }

    const data: RepositoryReleases[] = [];
    const errors: string[] = [];

    repos.forEach((repo, index) => {
      const alias = `repo${index}`;
      const repoData = response.data![alias];

      if (repoData) {
        data.push(transformRepositoryResponse(repoData));
      } else {
        errors.push(`Failed to fetch data for ${repo.owner}/${repo.name}`);
      }
    });

    return {
      success: errors.length === 0,
      data,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
}

