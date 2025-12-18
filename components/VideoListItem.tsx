import React from 'react';
import { VideoItem } from '../types';

interface VideoListItemProps {
  video: VideoItem;
}

const VideoListItem: React.FC<VideoListItemProps> = ({ video }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-purple-100 text-purple-700 border-purple-200';
      case 4: return 'bg-blue-100 text-blue-700 border-blue-200';
      case 3: return 'bg-green-100 text-green-700 border-green-200';
      case 2: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white hover:bg-gray-50 transition-colors grid grid-cols-12 gap-4 items-center p-4">
      {/* Image */}
      <div className="col-span-2 relative aspect-video rounded-lg overflow-hidden border border-gray-200">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded font-mono leading-none">
           {video.duration.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '')}
        </div>
      </div>

      {/* Title */}
      <div className="col-span-4 pr-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2" title={video.title}>
            {video.title}
        </h3>
      </div>

      {/* Channel */}
      <div className="col-span-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold shrink-0">
              {video.channelTitle.charAt(0)}
          </div>
          <span className="text-sm text-gray-600 truncate" title={video.channelTitle}>{video.channelTitle}</span>
      </div>

      {/* Stats */}
      <div className="col-span-2 flex flex-col justify-center">
        <div className="text-sm font-bold text-gray-900">{formatNumber(video.viewCount)} views</div>
        <div className="text-xs text-gray-500">{formatNumber(video.subscriberCount)} subs</div>
      </div>

      {/* Performance */}
      <div className="col-span-1 flex flex-col items-start gap-1">
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelColor(video.level)}`}>
            Level {video.level}
          </div>
          <div className="text-xs font-semibold text-purple-600">
            {Math.round(video.ratio * 100)}% Ratio
          </div>
      </div>

      {/* Date */}
      <div className="col-span-1 text-right text-xs text-gray-500">
        {formatDate(video.publishedAt)}
      </div>
    </div>
  );
};

export default VideoListItem;