import { VideoItem, FilterState } from '../types';

const YOUTUBE_API_KEY = 'AIzaSyA5BtxcEiU-Air5C0C9SyszCPC1SUC6fz4'; // Provided by user
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to parse ISO 8601 duration to seconds
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = (parseInt(match[1] || '0') || 0);
  const minutes = (parseInt(match[2] || '0') || 0);
  const seconds = (parseInt(match[3] || '0') || 0);

  return hours * 3600 + minutes * 60 + seconds;
};

// Calculate Performance Level based on Ratio
const calculateLevel = (ratio: number): number => {
  if (ratio > 5) return 5;
  if (ratio > 2) return 4;
  if (ratio >= 1) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
};

// Helper to get publishedAfter date string
const getPublishedAfterDate = (range: string): string | undefined => {
  if (range === 'all') return undefined;

  const now = new Date();
  let past = new Date();

  switch (range) {
    case '1w': past.setDate(now.getDate() - 7); break;
    case '2w': past.setDate(now.getDate() - 14); break;
    case '1m': past.setMonth(now.getMonth() - 1); break;
    case '2m': past.setMonth(now.getMonth() - 2); break;
    case '3m': past.setMonth(now.getMonth() - 3); break;
    case '6m': past.setMonth(now.getMonth() - 6); break;
    case '9m': past.setMonth(now.getMonth() - 9); break;
    case '12m': past.setFullYear(now.getFullYear() - 1); break;
    default: return undefined;
  }
  return past.toISOString();
};

export const searchVideos = async (
  filters: FilterState,
  translatedKeyword: string,
  pageToken: string = ''
): Promise<{ items: VideoItem[]; nextPageToken?: string; totalResults: number }> => {
  try {
    // 1. Search for video IDs
    const publishedAfter = getPublishedAfterDate(filters.dateRange);
    
    // API duration filter mapping
    let videoDurationParams = 'any';
    if (filters.duration === 'short') videoDurationParams = 'short'; // API 'short' is < 4 mins, we refine later
    if (filters.duration === 'long') videoDurationParams = 'long';

    // Region mapping
    const regionMap: Record<string, string> = {
      '한국': 'KR',
      '미국': 'US',
      '일본': 'JP',
      '인도네시아': 'ID',
      '베트남': 'VN',
      '인도': 'IN',
      '러시아': 'RU',
    };
    const regionCode = regionMap[filters.country] || 'KR';

    const searchParams = new URLSearchParams({
      part: 'snippet',
      maxResults: '50',
      q: translatedKeyword,
      type: 'video',
      key: YOUTUBE_API_KEY,
      regionCode: regionCode,
      videoDuration: videoDurationParams,
    });

    if (pageToken) searchParams.append('pageToken', pageToken);
    if (publishedAfter) searchParams.append('publishedAfter', publishedAfter);

    const searchRes = await fetch(`${BASE_URL}/search?${searchParams.toString()}`);
    if (!searchRes.ok) throw new Error('YouTube Search API failed');
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return { items: [], totalResults: 0 };
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const nextPageToken = searchData.nextPageToken;
    const totalResults = searchData.pageInfo?.totalResults || 0;

    // 2. Get Video Details (Stats + Duration)
    const videosRes = await fetch(
      `${BASE_URL}/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    if (!videosRes.ok) throw new Error('YouTube Videos API failed');
    const videosData = await videosRes.json();

    // 3. Get Channel Details (Subscribers)
    const channelIds = [...new Set(videosData.items.map((item: any) => item.snippet.channelId))].join(',');
    const channelsRes = await fetch(
      `${BASE_URL}/channels?part=statistics&id=${channelIds}&key=${YOUTUBE_API_KEY}`
    );
    if (!channelsRes.ok) throw new Error('YouTube Channels API failed');
    const channelsData = await channelsRes.json();

    // Create a map for channel stats
    const channelMap: Record<string, number> = {};
    channelsData.items.forEach((item: any) => {
      channelMap[item.id] = parseInt(item.statistics.subscriberCount || '0');
    });

    // 4. Merge and Filter locally
    const items: VideoItem[] = videosData.items.map((item: any) => {
      const viewCount = parseInt(item.statistics.viewCount || '0');
      const channelId = item.snippet.channelId;
      const subscriberCount = channelMap[channelId] || 0;
      
      // Avoid division by zero
      const ratio = subscriberCount > 0 ? viewCount / subscriberCount : 0;
      
      return {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        channelId: channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        duration: item.contentDetails.duration,
        viewCount,
        subscriberCount,
        ratio,
        level: calculateLevel(ratio),
      };
    }).filter((video: VideoItem) => {
      // Client-side filtering
      
      // Duration Filter (Strict)
      if (filters.duration === 'short') {
        const seconds = parseDuration(video.duration);
        if (seconds > 60) return false;
      }

      // Min Views Filter
      if (filters.minViews !== 'unlimited') {
        const minV = parseInt(filters.minViews);
        if (video.viewCount < minV) return false;
      }

      // Min Subscribers Filter
      if (filters.minSubscribers !== 'unlimited') {
        const minS = parseInt(filters.minSubscribers);
        if (video.subscriberCount < minS) return false;
      }

      // Performance Level Filter
      if (filters.performanceLevel !== 'all') {
        if (video.level !== filters.performanceLevel) return false;
      }

      return true;
    });

    return { items, nextPageToken, totalResults };

  } catch (error) {
    console.error("Error fetching data", error);
    throw error;
  }
};