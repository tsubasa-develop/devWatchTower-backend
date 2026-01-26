/**
 * プラグインシステム
 *
 * データソースプラグインの管理と実行を行います
 */

// 共通型定義
export type {
  DataSourcePlugin,
  PluginMetadata,
  PluginResult,
  PluginConfig,
  PluginFactory,
} from './types';

// プラグインレジストリ
export { pluginRegistry } from './registry';

// 各プラグイン
export * as github from './github';
export * as lineTechblog from './line-techblog';

// プラグインの自動登録
import { pluginRegistry } from './registry';
import { createGitHubPlugin } from './github';
import { createLineTechblogPlugin } from './line-techblog';

/**
 * デフォルトプラグインを登録する
 * アプリケーション起動時に呼び出してください
 */
export function registerDefaultPlugins(): void {
  // GitHub プラグイン
  pluginRegistry.register(createGitHubPlugin());

  // LINE TechBlog プラグイン
  pluginRegistry.register(createLineTechblogPlugin());
}

