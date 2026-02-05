
export interface GitHubReleaseAsset {
  name: string;
  downloadCount: number;
  downloadUrl: string;
  size: number;
  contentType: string;
}

export interface GitHubRelease {
  tagName: string;
  name: string | null;
  publishedAt: string | null;
  description: string | null;
  url: string;
  isPrerelease: boolean;
  isDraft: boolean;
  assets: GitHubReleaseAsset[];
}

export interface RepositoryReleases {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  releases: GitHubRelease[];
}

export interface RepositoryIdentifier {
  owner: string;
  name: string;
}

export interface GitHubPluginConfig extends Record<string, unknown> {
  repositories?: RepositoryIdentifier[];
  releasesPerRepo?: number;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface ReleaseNode {
  tagName: string;
  name: string | null;
  publishedAt: string | null;
  description: string | null;
  url: string;
  isPrerelease: boolean;
  isDraft: boolean;
  releaseAssets: {
    nodes: Array<{
      name: string;
      downloadCount: number;
      downloadUrl: string;
      size: number;
      contentType: string;
    }>;
  };
}

export interface RepositoryResponse {
  owner: {
    login: string;
  };
  name: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  releases: {
    nodes: ReleaseNode[];
  };
}

