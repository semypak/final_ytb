import React from 'react';
import { FilterState } from '../types';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch: () => void;
  isLoading: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, setFilters, onSearch, isLoading }) => {

  const handleChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLevelChange = (level: number | 'all') => {
    setFilters(prev => ({ ...prev, performanceLevel: level }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      {/* Top Row: Keyword, Country, Search Button aligned horizontally */}
      <div className="flex flex-col lg:flex-row gap-3 items-end mb-2">
        <div className="flex-grow w-full">
          <label className="block text-xs font-bold text-gray-500 mb-1">키워드</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="검색어를 입력하세요 (예: 건강정보)"
              className="w-full pl-10 pr-4 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="w-full lg:w-40 shrink-0">
          <label className="block text-xs font-bold text-gray-500 mb-1">국가</label>
          <select
            value={filters.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="한국">한국</option>
            <option value="미국">미국</option>
            <option value="일본">일본</option>
            <option value="인도네시아">인도네시아</option>
            <option value="인도">인도</option>
            <option value="베트남">베트남</option>
            <option value="러시아">러시아</option>
          </select>
        </div>

        <div className="w-full lg:w-auto shrink-0">
          <button
            onClick={onSearch}
            disabled={isLoading}
            className="w-full lg:w-auto h-10 bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? '검색 중...' : '검색 실행'}
          </button>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mb-6">* 국가 선택 시 해당 국가 언어로 자동 검색 (API 지역 설정)</p>

      {/* Middle Row: Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">영상 길이</label>
          <select
            value={filters.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500"
          >
            <option value="any">전체</option>
            <option value="short">숏폼 (60초 이내)</option>
            <option value="long">롱폼 (20분 이상)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">기간 (업로드일)</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500"
          >
            <option value="all">무제한</option>
            <option value="1w">1주</option>
            <option value="2w">2주</option>
            <option value="1m">1달</option>
            <option value="2m">2달</option>
            <option value="3m">3개월</option>
            <option value="6m">6개월</option>
            <option value="9m">9개월</option>
            <option value="12m">12개월</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">최소 구독자 수</label>
          <select
            value={filters.minSubscribers}
            onChange={(e) => handleChange('minSubscribers', e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500"
          >
            <option value="unlimited">미적용</option>
            <option value="5000">5,000</option>
            <option value="10000">10,000</option>
            <option value="30000">30,000</option>
            <option value="50000">50,000</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">최소 조회수</label>
          <select
            value={filters.minViews}
            onChange={(e) => handleChange('minViews', e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500"
          >
            <option value="unlimited">무제한</option>
            <option value="5000">5,000</option>
            <option value="10000">10,000</option>
            <option value="30000">30,000</option>
            <option value="50000">50,000</option>
            <option value="100000">100,000</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Level Buttons */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-2">성과 등급 (구독자 대비 조회수 비율)</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLevelChange('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.performanceLevel === 'all'
              ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
          >
            전체 보기
          </button>
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => handleLevelChange(level)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.performanceLevel === level
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
            >
              Level {level}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">* Level 3 (비율 &tilde;1:1), Level 5 (비율 &gt; 5:1, 매우 높음)</p>
      </div>
    </div>
  );
};

export default SearchFilters;