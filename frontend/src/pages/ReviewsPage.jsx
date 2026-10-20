import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BenefitsBanner from '../components/BenefitsBanner';
import Footer from '../components/Footer';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import reviewApi from '../api/reviewApi';
import '../styles/Home.css';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    reviewApi.getReviews()
      .then((data) => setReviews(data))
      .catch((err) => console.error('Lỗi khi tải đánh giá từ MongoDB:', err));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRating]);

  const filtered = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating >= parseFloat(filterRating);
  });

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50/70 to-white py-14 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="bg-blue-100/70 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Khách hàng nói về chúng tôi
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Đánh giá thực tế từ khách hàng
            </h1>
            <p className="text-base text-slate-500 max-w-2xl mx-auto mt-3">
              Hơn 98% khách hàng hài lòng và sẵn sàng giới thiệu GiúpViệc24 cho bạn bè, người thân.
            </p>
          </div>
        </section>

        {/* Rating Overview Card */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-black text-slate-900">4.9</div>
                <div className="flex items-center gap-1 justify-center text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-1">5,820 đánh giá</div>
              </div>

              <div className="h-16 w-px bg-slate-200 hidden sm:block" />

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% đánh giá từ khách hàng đã sử dụng dịch vụ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Chính sách đổi người miễn phí nếu khách chưa ưng ý</span>
                </div>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilterRating('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterRating === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả đánh giá
              </button>
              <button
                onClick={() => setFilterRating('5')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterRating === '5'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                5 sao tuyệt đối
              </button>
            </div>
          </div>
        </section>

        {/* Reviews List Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {paginatedReviews.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-500">
              Không có đánh giá nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedReviews.map((rev) => (
                <div
                  key={rev.id || rev._id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {rev.author}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {rev.date} • Dịch vụ: <span className="text-blue-600 font-semibold">{rev.service}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Người làm: <strong className="text-slate-700">{rev.helper}</strong></span>
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Hữu ích ({rev.likes})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filtered.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-xs text-slate-500">
                Hiển thị {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} trên {filtered.length} đánh giá
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        <BenefitsBanner />
      </main>

      <Footer />
    </div>
  );
};

export default ReviewsPage;
