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

// プラグインの自動登録
import { pluginRegistry } from './registry';
import { createGitHubPlugin } from './github';

/**
 * デフォルトプラグインを登録する
 * アプリケーション起動時に呼び出してください
 */
export function registerDefaultPlugins(): void {
  // GitHub プラグイン
  pluginRegistry.register(createGitHubPlugin());

  // 将来的に他のプラグインをここに追加
  // pluginRegistry.register(createTwitterPlugin());
  // pluginRegistry.register(createRSSPlugin());
}

