import { config } from 'dotenv';
config({ path: '.env.local' });

import { fetchRSSFeed } from '../plugins/line-techblog/fetcher';
import { transformToContents } from '../plugins/line-techblog/transformer';

async function main() {
  console.log('Testing LINE TechBlog transformer...\n');

  const result = await fetchRSSFeed();
  if (!result.success || !result.data) {
    console.log('Fetch failed:', result.errors);
    return;
  }

  console.log('Feed title:', result.data.title);
  console.log('Items count:', result.data.items.length);
  console.log('\nFirst item guid:', result.data.items[0]?.guid);

  const contents = transformToContents([result.data]);
  console.log('\nContents count:', contents.length);

  if (contents.length > 0) {
    console.log('\n=== First content ===');
    console.log('id:', contents[0].id);
    console.log('type:', contents[0].type);
    console.log('title:', contents[0].title);
    console.log('published_at:', contents[0].published_at);
  }
}

main().catch(console.error);
