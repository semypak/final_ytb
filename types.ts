export interface VideoStats {
  viewCount: string;
  likeCount?: string;
  commentCount?: string;
}

export interface ChannelStats {
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string; // ISO 8601
  viewCount: number;
  subscriberCount: number;
  ratio: number; // Views / Subscribers
  level: number; // 1 to 5
}

export interface FilterState {
  keyword: string;
  country: string;
  duration: 'any' | 'short' | 'long'; // short < 60s, long > 20m
  dateRange: string; // 'all', '1w', etc.
  minSubscribers: string;
  minViews: string;
  performanceLevel: number | 'all';
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}
