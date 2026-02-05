
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

export type ContentRow = Database['public']['Tables']['contents']['Row'];

export type ContentInsert = Database['public']['Tables']['contents']['Insert'];

export type ContentUpdate = Database['public']['Tables']['contents']['Update'];

