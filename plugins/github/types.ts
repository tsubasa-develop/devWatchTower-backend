/**
 * GitHub プラグイン固有の型定義
 */

/** リリースアセット情報 */
export interface GitHubReleaseAsset {
  name: string;
  downloadCount: number;
  downloadUrl: string;
  size: number;
  contentType: string;
}

/** 単一リリース情報 */
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

/** リポジトリのリリース情報 */
export interface RepositoryReleases {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  releases: GitHubRelease[];
}

/** リポジトリ指定のための型 */
export interface RepositoryIdentifier {
  owner: string;
  name: string;
}

/** GitHub プラグインの設定 */
export interface GitHubPluginConfig extends Record<string, unknown> {
  /** 取得対象のリポジトリ一覧（省略時はデフォルトリポジトリを使用） */
  repositories?: RepositoryIdentifier[];
  /** 各リポジトリから取得するリリース数 */
  releasesPerRepo?: number;
}

/** GraphQL APIレスポンスの型 */
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/** リリースノード（GraphQL内部用） */
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

/** リポジトリレスポンス（GraphQL内部用） */
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

