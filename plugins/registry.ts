
import type { DataSourcePlugin, PluginResult } from './types';

class PluginRegistry {
  private plugins: Map<string, DataSourcePlugin> = new Map();

  register(plugin: DataSourcePlugin): void {
    const name = plugin.metadata.name;

    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already registered. Overwriting...`);
    }

    this.plugins.set(name, plugin);
    console.log(`Plugin "${name}" registered successfully.`);
  }

  get(name: string): DataSourcePlugin | undefined {
    return this.plugins.get(name);
  }

  getAll(): DataSourcePlugin[] {
    return Array.from(this.plugins.values());
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  unregister(name: string): boolean {
    return this.plugins.delete(name);
  }

  validateAll(): { name: string; valid: boolean; errors: string[] }[] {
    return this.getAll().map((plugin) => {
      const result = plugin.validate();
      return {
        name: plugin.metadata.name,
        ...result,
      };
    });
  }

  async fetchFrom<T = unknown>(
    name: string,
    config?: Record<string, unknown>
  ): Promise<PluginResult<T>> {
    const plugin = this.get(name);

    if (!plugin) {
      return {
        success: false,
        data: [],
        errors: [`Plugin "${name}" not found`],
        source: {
          plugin: name,
          fetchedAt: new Date().toISOString(),
        },
      };
    }

    const validation = plugin.validate();
    if (!validation.valid) {
      return {
        success: false,
        data: [],
        errors: validation.errors,
        source: {
          plugin: name,
          fetchedAt: new Date().toISOString(),
        },
      };
    }

    if (plugin.initialize) {
      await plugin.initialize();
    }

    return plugin.fetch(config) as Promise<PluginResult<T>>;
  }

  async fetchFromAll(): Promise<Map<string, PluginResult>> {
    const results = new Map<string, PluginResult>();

    for (const plugin of this.getAll()) {
      const result = await this.fetchFrom(plugin.metadata.name);
      results.set(plugin.metadata.name, result);
    }

    return results;
  }

  list(): { name: string; description: string; version: string }[] {
    return this.getAll().map((plugin) => ({
      name: plugin.metadata.name,
      description: plugin.metadata.description,
      version: plugin.metadata.version,
    }));
  }
}

export const pluginRegistry = new PluginRegistry();

