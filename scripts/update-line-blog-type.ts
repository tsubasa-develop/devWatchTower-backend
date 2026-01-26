/**
 * 既存の LINE TechBlog データの type を 'techblog' から 'article' に更新するスクリプト
 */

import { getSupabaseClient } from '../lib/supabase/client';
import * as dotenv from 'dotenv';
import path from 'path';

// .env.local をロード
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  const supabase = getSupabaseClient();

  console.log('Migrating LINE TechBlog content types...');

  // 1. 対象のレコードを確認
  const { count, error: countError } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'techblog')
    .filter('metadata->>source', 'eq', 'line-techblog');

  if (countError) {
    console.error('Error counting records:', countError.message);
    process.exit(1);
  }

  console.log(`Found ${count} records to update.`);

  if (count === 0) {
    console.log('No records found. Migration skipped.');
    return;
  }

  // 2. 更新実行
  const { data, error: updateError } = await supabase
    .from('contents')
    .update({ type: 'article' })
    .eq('type', 'techblog')
    .filter('metadata->>source', 'eq', 'line-techblog')
    .select();

  if (updateError) {
    console.error('Error updating records:', updateError.message);
    process.exit(1);
  }

  console.log(`Successfully updated ${data.length} records.`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
