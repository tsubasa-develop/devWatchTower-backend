/**
 * リリース情報を取得して Supabase に同期するスクリプト
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
import { transformToContents } from '../plugins/github';
import { upsertContents } from '../lib/supabase';
import type { RepositoryReleases } from '../plugins/github';

async function main() {
  console.log('🔄 Starting release sync...\n');

  // 環境変数チェック
  const requiredEnvVars = ['GITHUB_TOKEN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach((v) => console.error(`   - ${v}`));
    process.exit(1);
  }

  // プラグイン初期化
  console.log('🔌 Initializing plugins...');
  registerDefaultPlugins();

  // GitHub からデータ取得
  console.log('📥 Fetching releases from GitHub...');
  const result = await pluginRegistry.fetchFrom<RepositoryReleases>('github-releases');

  if (!result.success) {
    console.error('❌ Failed to fetch releases:');
    result.errors?.forEach((error) => console.error(`   - ${error}`));
    process.exit(1);
  }

  console.log(`   ✓ Fetched ${result.data.length} repositories`);

  // Content 型に変換
  console.log('🔄 Transforming to Content format...');
  const contents = transformToContents(result.data, {
    maxReleasesPerRepo: 10, // 各リポジトリから最新10件
    includeDrafts: false,
    includePrereleases: true,
  });

  console.log(`   ✓ Transformed ${contents.length} releases`);

  // Supabase に保存
  console.log('💾 Saving to Supabase...');
  const upsertResult = await upsertContents(contents);

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
  console.log(`   Source: ${result.source.plugin}`);
  console.log(`   Fetched at: ${result.source.fetchedAt}`);
  console.log(`   Total contents: ${contents.length}`);

  // 詳細表示
  console.log('\n📋 Synced repositories:');
  for (const repo of result.data) {
    const repoContents = contents.filter(
      (c) => (c.metadata as Record<string, unknown>)?.repository &&
        ((c.metadata as Record<string, Record<string, unknown>>).repository as Record<string, unknown>).fullName === repo.fullName
    );
    console.log(`   • ${repo.fullName}: ${repoContents.length} releases`);
  }
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

