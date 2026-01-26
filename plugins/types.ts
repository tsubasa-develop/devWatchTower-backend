/**
 * プラグイン共通インターフェース
 *
 * 各データソースプラグインはこのインターフェースを実装することで、
 * 統一的な方法でデータを取得・変換できます。
 */

/** プラグインの実行結果 */
export interface PluginResult<T = unknown> {
  success: boolean;
  data: T[];
  errors?: string[];
  /** データ取得元の情報 */
  source: {
    plugin: string;
    fetchedAt: string;
  };
}

/** プラグインの設定 */
export interface PluginConfig {
  /** プラグインが有効かどうか */
  enabled: boolean;
  /** プラグイン固有の設定 */
  options?: Record<string, unknown>;
}

/** プラグインのメタデータ */
export interface PluginMetadata {
  /** プラグイン名（一意の識別子） */
  name: string;
  /** プラグインの説明 */
  description: string;
  /** プラグインのバージョン */
  version: string;
  /** プラグインの作者 */
  author?: string;
}

/**
 * データソースプラグインのインターフェース
 *
 * @template TData - 取得するデータの型
 * @template TConfig - プラグイン固有の設定型
 */
export interface DataSourcePlugin<TData = unknown, TConfig = Record<string, unknown>> {
  /** プラグインのメタデータ */
  readonly metadata: PluginMetadata;

  /**
   * データを取得する
   * @param config - プラグイン固有の設定
   * @returns 取得結果
   */
  fetch(config?: TConfig): Promise<PluginResult<TData>>;

  /**
   * プラグインの初期化処理（オプション）
   * 環境変数のチェックなど、プラグイン起動前に必要な処理を行う
   */
  initialize?(): Promise<void>;

  /**
   * プラグインの検証
   * 必要な環境変数や設定が正しいかチェック
   * @returns 検証結果とエラーメッセージ
   */
  validate(): { valid: boolean; errors: string[] };
}

/**
 * プラグインファクトリ関数の型
 * プラグインを生成する関数
 */
export type PluginFactory<TData = unknown, TConfig = Record<string, unknown>> = () => DataSourcePlugin<TData, TConfig>;

