
export type {
  DataSourcePlugin,
  PluginMetadata,
  PluginResult,
  PluginConfig,
  PluginFactory,
} from './types';

export { pluginRegistry } from './registry';

export * as github from './github';
export * as lineTechblog from './line-techblog';

import { pluginRegistry } from './registry';
import { createGitHubPlugin } from './github';
import { createLineTechblogPlugin } from './line-techblog';

export function registerDefaultPlugins(): void {
  pluginRegistry.register(createGitHubPlugin());

  pluginRegistry.register(createLineTechblogPlugin());
}

