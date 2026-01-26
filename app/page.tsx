export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🚀 パブリックコンテンツAPI</h1>
      <p>記事やリポジトリなどの公開されたコンテンツを提供するAPIです。</p>

      <h2>📚 APIエンドポイント</h2>
      <ul>
        <li>
          <strong>GET /api/contents</strong> - 公開コンテンツ一覧取得
          <ul>
            <li><code>type</code> - コンテンツタイプでフィルタリング</li>
            <li><code>q</code> - フリーテキスト検索</li>
            <li><code>limit</code> - ページサイズ (1-200, デフォルト: 20)</li>
            <li><code>offset</code> - オフセット (デフォルト: 0)</li>
            <li><code>sort</code> - ソートフィールド (created_at, updated_at, published_at, title)</li>
            <li><code>order</code> - ソート順 (asc, desc)</li>
          </ul>
        </li>
        <li>
          <strong>GET /api/contents/:id</strong> - IDによる公開コンテンツ取得
        </li>
      </ul>
    </main>
  );
}

