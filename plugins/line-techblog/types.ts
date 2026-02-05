
export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;
}

export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  lastBuildDate: string;
  items: RSSItem[];
}

export interface LineTechblogPluginConfig extends Record<string, unknown> {
  feedUrl?: string;
  maxItems?: number;
}

