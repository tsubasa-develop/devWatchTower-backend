
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

import { pluginRegistry, registerDefaultPlugins } from '../plugins';
import type { RepositoryReleases } from '../plugins/github';

async function main() {
  console.log('🔌 Initializing plugin system...\n');

  registerDefaultPlugins();

  console.log('📋 Registered plugins:');
  for (const plugin of pluginRegistry.list()) {
    console.log(`   • ${plugin.name} (v${plugin.version})`);
    console.log(`     ${plugin.description}`);
  }
  console.log('');

  console.log('✅ Validating plugins...');
  const validations = pluginRegistry.validateAll();
  for (const v of validations) {
    if (v.valid) {
      console.log(`   ✓ ${v.name}: OK`);
    } else {
      console.log(`   ✗ ${v.name}: FAILED`);
      v.errors.forEach((e) => console.log(`     - ${e}`));
    }
  }
  console.log('');

  console.log('🚀 Fetching releases from GitHub plugin...\n');

  const result = await pluginRegistry.fetchFrom<RepositoryReleases>('github-releases');

  if (!result.success) {
    console.error('❌ Failed to fetch releases:');
    result.errors?.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log('✅ Successfully fetched releases!');
  console.log(`   Source: ${result.source.plugin}`);
  console.log(`   Fetched at: ${result.source.fetchedAt}\n`);

  for (const repo of result.data) {
    console.log('─'.repeat(60));
    console.log(`📦 ${repo.fullName}`);
    console.log(`   ⭐ ${repo.stargazerCount.toLocaleString()} stars`);
    console.log(`   🔗 ${repo.url}`);
    if (repo.description) {
      console.log(`   📝 ${repo.description}`);
    }
    console.log('');

    console.log('   📋 Releases:');
    for (const release of repo.releases.slice(0, 5)) {
      const date = release.publishedAt
        ? new Date(release.publishedAt).toLocaleDateString('ja-JP')
        : 'N/A';
      const prerelease = release.isPrerelease ? ' [prerelease]' : '';
      const draft = release.isDraft ? ' [draft]' : '';

      console.log(`      • ${release.tagName}${prerelease}${draft}`);
      console.log(`        名前: ${release.name || '(なし)'}`);
      console.log(`        公開日: ${date}`);

      if (release.assets.length > 0) {
        const totalDownloads = release.assets.reduce((sum, a) => sum + a.downloadCount, 0);
        console.log(`        ダウンロード数: ${totalDownloads.toLocaleString()}`);
      }

      console.log('');
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('📄 Raw JSON data (first repository only):');
  if (result.data.length > 0) {
    console.log(JSON.stringify(result.data[0], null, 2));
  }
}

main().catch(console.error);
