/**
 * Supabase データベース型定義
 *
 * 将来的には `supabase gen types typescript` で自動生成可能
 */

export interface Database {
  public: {
    Tables: {
      contents: {
        Row: {
          id: string;
          type: string;
          title: string;
          summary: string | null;
          body: string | null;
          metadata: Record<string, unknown>;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          summary?: string | null;
          body?: string | null;
          metadata?: Record<string, unknown>;
          published_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          summary?: string | null;
          body?: string | null;
          metadata?: Record<string, unknown>;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

/** contents テーブルの行型 */
export type ContentRow = Database['public']['Tables']['contents']['Row'];

/** contents テーブルへの挿入型 */
export type ContentInsert = Database['public']['Tables']['contents']['Insert'];

/** contents テーブルの更新型 */
export type ContentUpdate = Database['public']['Tables']['contents']['Update'];

