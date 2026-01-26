/**
 * リリース情報を取得して Supabase に同期するスクリプト
 *
 * 全登録プラグインからデータを取得し、Supabaseに保存します。
 *
 * 使用方法:
 * 1. .env.local に必要な環境変数を設定
 *    - GITHUB_TOKEN
 *    - SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY
 * 2. npm run sync:releases を実行
 */

import { config } from 'dotenv';

// .env.local を読み込む
config({ path: '.env.local' });
config({ path: '.env' });

import { pluginRegistry, registerDefaultPlugins } from '../plugins';
import { transformToContents as transformGitHub } from '../plugins/github';
import { transformToContents as transformLineTechblog } from '../plugins/line-techblog';
import { upsertContents } from '../lib/supabase';
import type { ContentInsert } from '../lib/supabase';
import type { RepositoryReleases } from '../plugins/github';
import type { RSSFeed } from '../plugins/line-techblog';

/**
 * プラグイン名とtransformer関数のマッピング
 */
const pluginTransformers: Record<string, (data: unknown[]) => ContentInsert[]> = {
  'github-releases': (data) => transformGitHub(data as RepositoryReleases[], {
    maxReleasesPerRepo: 10,
    includeDrafts: false,
    includePrereleases: true,
  }),
  'line-techblog': (data) => transformLineTechblog(data as RSSFeed[]),
};

async function main() {
  console.log('🔄 Starting release sync...\n');

  // 環境変数チェック（GITHUB_TOKENはオプショナルに）
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach((v) => console.error(`   - ${v}`));
    process.exit(1);
  }

  // GITHUB_TOKENの確認（警告のみ）
  if (!process.env.GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN is not set. GitHub plugin will fail validation.\n');
  }

  // プラグイン初期化
  console.log('🔌 Initializing plugins...');
  registerDefaultPlugins();

  // 登録プラグイン一覧を表示
  const plugins = pluginRegistry.list();
  console.log(`   Found ${plugins.length} plugins:`);
  plugins.forEach((p) => console.log(`   • ${p.name} (v${p.version})`));

  // 全プラグインからデータ取得
  console.log('\n📥 Fetching data from all plugins...');

  const allContents: ContentInsert[] = [];
  const results = await pluginRegistry.fetchFromAll();

  for (const [pluginName, result] of results) {
    console.log(`\n   [${pluginName}]`);

    if (!result.success) {
      console.error(`   ❌ Failed to fetch:`);
      result.errors?.forEach((error) => console.error(`      - ${error}`));
      continue;
    }

    console.log(`   ✓ Fetched ${result.data.length} items`);

    // transformerがあれば変換
    const transformer = pluginTransformers[pluginName];
    if (transformer) {
      const contents = transformer(result.data);
      allContents.push(...contents);
      console.log(`   ✓ Transformed to ${contents.length} contents`);
    } else {
      console.warn(`   ⚠️  No transformer found for plugin "${pluginName}"`);
    }
  }

  if (allContents.length === 0) {
    console.log('\n⚠️  No contents to sync');
    return;
  }

  // Supabase に保存
  console.log('\n💾 Saving to Supabase...');
  console.log(`   Total contents: ${allContents.length}`);

  const upsertResult = await upsertContents(allContents);

  if (!upsertResult.success) {
    console.error('❌ Failed to save to Supabase:');
    console.error(`   - ${upsertResult.error}`);
    process.exit(1);
  }

  console.log(`   ✓ Inserted: ${upsertResult.inserted}`);
  console.log(`   ✓ Updated: ${upsertResult.updated}`);

  // サマリー表示
  console.log('\n' + '─'.repeat(60));
  console.log('✅ Sync completed successfully!');

  // タイプ別のサマリー
  const contentsByType = allContents.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📋 Contents by type:');
  for (const [type, count] of Object.entries(contentsByType)) {
    console.log(`   • ${type}: ${count} items`);
  }
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

