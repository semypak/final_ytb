import React from 'react';
import { VideoItem } from '../types';
import { Eye, Users, BarChart2, ExternalLink } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative aspect-video group">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="w-full h-full object-cover"
        />
        <a 
          href={`https://www.youtube.com/watch?v=${video.id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <ExternalLink className="text-white w-8 h-8 drop-shadow-lg" />
        </a>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
           {video.duration.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '')}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 mb-2 h-10">
          {video.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
           <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 truncate max-w-[150px]">
             {video.channelTitle}
           </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(video.viewCount)} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{formatNumber(video.subscriberCount)}</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className={`px-2 py-1 rounded text-xs font-bold border ${getLevelColor(video.level)}`}>
            LEVEL {video.level}
          </div>
          <div className="text-xs font-semibold text-purple-600">
            {Math.round(video.ratio * 100)}% Ratio
          </div>
        </div>
        
        <div className="text-[10px] text-gray-400 text-right mt-1">
          {formatDate(video.publishedAt)}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
