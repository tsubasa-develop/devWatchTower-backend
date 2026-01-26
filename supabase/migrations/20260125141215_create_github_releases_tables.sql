-- コンテンツテーブル（API の Content 型に対応）
-- type フィールドで repository, article, sns などを区別
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(2000),
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_updated_at ON contents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_title ON contents(title);

-- 全文検索用インデックス（タイトルと要約）
CREATE INDEX IF NOT EXISTS idx_contents_search ON contents
  USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, '')));

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを設定
CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) を有効化
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー（認証なしでも読み取り可能）
CREATE POLICY "Allow public read access on contents"
  ON contents FOR SELECT
  USING (true);

-- サービスロール用の書き込みポリシー
CREATE POLICY "Allow service role full access on contents"
  ON contents FOR ALL
  USING (auth.role() = 'service_role');
