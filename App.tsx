import React, { useState, useEffect } from 'react';
import LoginModal from './components/LoginModal';
import SearchFilters from './components/SearchFilters';
import VideoCard from './components/VideoCard';
import VideoListItem from './components/VideoListItem';
import { FilterState, VideoItem } from './types';
import { searchVideos } from './services/youtubeService';
import { translateKeyword } from './services/geminiService';
import { LayoutGrid, FileText, Bot, List, Play } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    country: '한국',
    duration: 'any',
    dateRange: 'all',
    minSubscribers: 'unlimited',
    minViews: 'unlimited',
    performanceLevel: 'all',
  });

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination State
  const [pageTokens, setPageTokens] = useState<string[]>(['']); // Index 0 is page 1 (empty token)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (resetPage: boolean = true) => {
    if (!filters.keyword.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const pageIndex = resetPage ? 0 : currentPage - 1;
      const currentToken = pageTokens[pageIndex] || '';

      // 1. Translate Keyword using Gemini
      let searchTerm = filters.keyword;
      if (resetPage) {
         // Only translate on initial search, not paging (though usually fine to re-translate)
         searchTerm = await translateKeyword(filters.keyword, filters.country);
         console.log(`Translated "${filters.keyword}" to "${searchTerm}"`);
      } else {
        // Recalculate translation if needed, or store it. 
        // For simplicity, we re-translate or use the keyword if we trust it's consistent.
         searchTerm = await translateKeyword(filters.keyword, filters.country);
      }

      // 2. Fetch YouTube Data
      const result = await searchVideos(filters, searchTerm, currentToken);
      
      setVideos(result.items);
      setTotalResults(result.totalResults); // Note: YouTube API totalResults is an estimate

      // Handle Pagination Tokens
      if (resetPage) {
        setPageTokens(['', result.nextPageToken || '']);
        setCurrentPage(1);
      } else {
        // If we are moving forward and have a next page token
        if (result.nextPageToken) {
           // Ensure we don't duplicate logic if user clicks '2' then '1' then '2'
           const newTokens = [...pageTokens];
           if (!newTokens[currentPage]) {
             newTokens[currentPage] = result.nextPageToken;
           }
           setPageTokens(newTokens);
        }
      }

    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > 5) return;
    // We can only go to a page if we have the token for it (which is at index page-1)
    if (page > pageTokens.length) return; 

    setCurrentPage(page);
    // Use useEffect or call search directly? 
    // Calling search directly inside handler is safer for current closure values
    // But we need to update state first. 
    // Let's use a specialized useEffect for page changes or just pass the token.
    // Simpler: Just update state and use useEffect dependency.
  };

  // Trigger search when currentPage changes, ONLY if not the initial load/reset
  useEffect(() => {
    if (isLoggedIn && filters.keyword && !loading) {
       // Check if it's a page navigation, not a new search
       // Logic is a bit circular if handleSearch sets currentPage.
       // Let's keep it simple: handleSearch manages the API call.
       // We will call handleSearch(false) when page buttons are clicked *inside* the button handler.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); 

  const onPageClick = (page: number) => {
    setCurrentPage(page);
    // We need to call search with the token for this page.
    // The token for Page X is at index X-1.
    // Wait, Page 1 token is '', at index 0.
    // Page 2 token is returned from Page 1, stored at index 1.
    // So to load Page X, we use token at index X-1.
    
    // However, state updates are async. 
    // We will call an internal helper.
    performSearchForPage(page);
  };

  const performSearchForPage = async (page: number) => {
    setLoading(true);
    try {
        const searchTerm = await translateKeyword(filters.keyword, filters.country);
        const token = pageTokens[page - 1] || '';
        const result = await searchVideos(filters, searchTerm, token);
        setVideos(result.items);
        
        // Update next token if exists
        if (result.nextPageToken) {
            const newTokens = [...pageTokens];
            newTokens[page] = result.nextPageToken; // Store token for next page at index `page`
            setPageTokens(newTokens);
        }
    } catch (err) {
        setError('페이지 로드 중 오류 발생');
    } finally {
        setLoading(false);
    }
  }

  const handleExportExcel = () => {
    if (videos.length === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // Define CSV headers
    const headers = [
      "제목",
      "채널명",
      "조회수",
      "구독자수",
      "조회수/구독자 비율",
      "성과 등급",
      "게시일",
      "영상 길이",
      "링크"
    ];

    // Helper to escape CSV fields
    const escapeCsv = (field: any) => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // Map video data to rows
    const csvRows = videos.map(video => {
        const ratioPercent = (video.ratio * 100).toFixed(2) + '%';
        const formattedDate = new Date(video.publishedAt).toLocaleDateString('ko-KR');
        const duration = video.duration.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '');
        const link = `https://www.youtube.com/watch?v=${video.id}`;

        return [
            escapeCsv(video.title),
            escapeCsv(video.channelTitle),
            escapeCsv(video.viewCount),
            escapeCsv(video.subscriberCount),
            escapeCsv(ratioPercent),
            escapeCsv(`Level ${video.level}`),
            escapeCsv(formattedDate),
            escapeCsv(duration),
            escapeCsv(link)
        ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create Blob with BOM (\uFEFF) for Korean character support in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `youtube_trend_${filters.keyword}_${new Date().toISOString().slice(0,10)}.csv`;
    
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isLoggedIn) {
    return <LoginModal onLogin={setIsLoggedIn} />;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">YouTube Trend Analyzer</h1>
          </div>
          <div className="flex gap-3">
             {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                  title="썸네일 보기"
                >
                    <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                  title="리스트 보기"
                >
                    <List className="w-5 h-5" />
                </button>
            </div>

            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
               <FileText className="w-4 h-4" />
               엑셀 저장
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters 
          filters={filters} 
          setFilters={setFilters} 
          onSearch={() => handleSearch(true)}
          isLoading={loading}
        />

        {/* Results Area */}
        <div className="mt-8">
          {videos.length > 0 && (
             <h2 className="text-lg font-bold text-gray-700 mb-4">
               {videos.length}개의 영상이 검색되었습니다.
             </h2>
          )}

          {loading ? (
             <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse" : "flex flex-col gap-4 animate-pulse"}>
               {[...Array(8)].map((_, i) => (
                 <div key={i} className={viewMode === 'grid' ? "bg-gray-200 h-64 rounded-xl" : "bg-gray-200 h-32 rounded-lg"}></div>
               ))}
             </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
               <p className="text-gray-500">검색 키워드와 국가를 선택하여 분석을 시작하세요.</p>
            </div>
          ) : (
            <>
              {/* Pagination (Top) */}
              <div className="flex justify-center mb-6 gap-2">
                {[1, 2, 3, 4, 5].map((page) => (
                   <button
                     key={page}
                     onClick={() => onPageClick(page)}
                     disabled={page > pageTokens.length || (page === currentPage)}
                     className={`w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                       currentPage === page 
                         ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                         : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed'
                     }`}
                   >
                     {page}
                   </button>
                ))}
              </div>

              {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
              ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* List View Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-2">썸네일</div>
                        <div className="col-span-4">제목</div>
                        <div className="col-span-2">채널</div>
                        <div className="col-span-2">지표 (조회수/구독자)</div>
                        <div className="col-span-1">성과 등급</div>
                        <div className="col-span-1 text-right">업로드일</div>
                    </div>
                    {/* List View Body */}
                    <div className="divide-y divide-gray-100">
                        {videos.map((video) => (
                          <VideoListItem key={video.id} video={video} />
                        ))}
                    </div>
                  </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Floating Chat/Help Button (Mock) */}
      <div className="fixed bottom-6 right-6">
         <button className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all group">
            <Bot className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
         </button>
      </div>
    </div>
  );
};

export default App;