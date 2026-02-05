
export interface PluginResult<T = unknown> {
  success: boolean;
  data: T[];
  errors?: string[];
  source: {
    plugin: string;
    fetchedAt: string;
  };
}

export interface PluginConfig {
  enabled: boolean;
  options?: Record<string, unknown>;
}

export interface PluginMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
}

export interface DataSourcePlugin<TData = unknown, TConfig = Record<string, unknown>> {
  readonly metadata: PluginMetadata;

  fetch(config?: TConfig): Promise<PluginResult<TData>>;

  initialize?(): Promise<void>;

  validate(): { valid: boolean; errors: string[] };
}

export type PluginFactory<TData = unknown, TConfig = Record<string, unknown>> = () => DataSourcePlugin<TData, TConfig>;

