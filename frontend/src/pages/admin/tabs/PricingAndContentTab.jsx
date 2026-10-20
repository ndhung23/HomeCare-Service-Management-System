import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  MessageSquare, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import adminApi from '../../../api/adminApi';
import reviewApi from '../../../api/reviewApi';
import ServicesConfigSection from './ServicesConfigSection';

const REVIEWS_PER_PAGE = 3;

const PricingAndContentTab = () => {
  const [subSection, setSubSection] = useState('PRICING'); // 'PRICING' | 'REVIEWS' | 'FAQ'
  const [config, setConfig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  
  // FAQ Form state
  const [faqTitle, setFaqTitle] = useState('');
  const [faqContent, setFaqContent] = useState('');
  const [faqCategory, setFaqCategory] = useState('Chung');

  const fetchConfig = async () => {
    try {
      const data = await adminApi.getConfig();
      setConfig(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewApi.getReviews({ includeHidden: true, limit: 100 });
      setReviews(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFaqs = async () => {
    try {
      const data = await adminApi.getContent({ type: 'FAQ' });
      setFaqs(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchReviews();
    fetchFaqs();
  }, []);

  const totalReviewPages = Math.max(1, Math.ceil((reviews?.length || 0) / REVIEWS_PER_PAGE));

  useEffect(() => {
    if (reviewPage > totalReviewPages) {
      setReviewPage(totalReviewPages);
    }
  }, [totalReviewPages, reviewPage]);

  const startReviewIndex = (reviewPage - 1) * REVIEWS_PER_PAGE;
  const paginatedReviews = (reviews || []).slice(startReviewIndex, startReviewIndex + REVIEWS_PER_PAGE);

  const handleToggleReview = async (reviewId) => {
    try {
      await adminApi.toggleReviewVisibility(reviewId, 'Admin kiểm duyệt');
      fetchReviews();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đánh giá');
    }
  };

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    if (!faqTitle || !faqContent) {
      alert('Vui lòng nhập câu hỏi và câu trả lời');
      return;
    }
    try {
      await adminApi.saveContent({
        type: 'FAQ',
        title: faqTitle,
        content: faqContent,
        category: faqCategory,
      });
      alert('Đã thêm câu hỏi FAQ mới!');
      setFaqTitle('');
      setFaqContent('');
      fetchFaqs();
    } catch (err) {
      alert('Lỗi khi tạo FAQ');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;
    try {
      await adminApi.deleteContent(id);
      fetchFaqs();
    } catch (err) {
      alert('Lỗi khi xóa FAQ');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
      {/* Sub tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setSubSection('PRICING')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            subSection === 'PRICING' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Bảng giá & Dịch vụ
        </button>
        <button
          onClick={() => setSubSection('REVIEWS')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            subSection === 'REVIEWS' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Kiểm duyệt đánh giá ({reviews.length})
        </button>
        <button
          onClick={() => setSubSection('FAQ')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            subSection === 'FAQ' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Quản lý FAQ & Trợ giúp ({faqs.length})
        </button>
      </div>

      {/* 1. Bảng giá & Quản lý Dịch vụ chi tiết */}
      {subSection === 'PRICING' && (
        <ServicesConfigSection 
          config={config} 
          fetchConfig={fetchConfig} 
          setConfig={setConfig} 
        />
      )}

      {/* 2. Kiểm duyệt đánh giá có Phân trang 3 cái / trang */}
      {subSection === 'REVIEWS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-900 text-base">Kiểm duyệt & Quản lý Đánh giá người dùng</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Ẩn hoặc hiển thị các đánh giá phản hồi từ khách hàng và thợ giúp việc trên toàn hệ thống
              </p>
            </div>
            <button 
              onClick={fetchReviews} 
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
            {paginatedReviews.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Không có đánh giá nào.
              </div>
            ) : (
              paginatedReviews.map((r) => (
                <div key={r._id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${r.isHidden ? 'bg-gray-50/80 opacity-60' : 'bg-white hover:bg-gray-50/50'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{r.author}</span>
                      <span className="text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded">
                        ★ {r.rating}
                      </span>
                      <span className="text-xs text-gray-500">
                        Dịch vụ: <strong className="text-gray-700">{r.service}</strong>
                      </span>
                      {r.isHidden && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-bold">
                          Đang bị ẩn
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{r.comment}</p>
                    <p className="text-xs text-gray-400">
                      Người thực hiện: <span className="text-gray-600 font-medium">{r.helper || 'Người làm'}</span> • Ngày: {r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleReview(r._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 ${
                      r.isHidden 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    {r.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {r.isHidden ? 'Bỏ ẩn' : 'Ẩn review'}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Thanh phân trang 3 cái / trang */}
          {reviews.length > 0 && (
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Hiển thị <span className="font-semibold text-gray-800">{startReviewIndex + 1}</span> - <span className="font-semibold text-gray-800">{Math.min(startReviewIndex + REVIEWS_PER_PAGE, reviews.length)}</span> trên tổng số <span className="font-semibold text-gray-800">{reviews.length}</span> đánh giá
              </p>

              {totalReviewPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setReviewPage((p) => Math.max(p - 1, 1))}
                    disabled={reviewPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setReviewPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                        reviewPage === page
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setReviewPage((p) => Math.min(p + 1, totalReviewPages))}
                    disabled={reviewPage === totalReviewPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Quản lý FAQ & Trợ giúp */}
      {subSection === 'FAQ' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateFaq} className="border border-gray-200 rounded-2xl p-5 space-y-3 bg-gray-50/50">
            <h4 className="font-bold text-gray-900 text-sm">Thêm câu hỏi FAQ mới</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Câu hỏi thường gặp..."
                value={faqTitle}
                onChange={(e) => setFaqTitle(e.target.value)}
                className="sm:col-span-2 p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={faqCategory}
                onChange={(e) => setFaqCategory(e.target.value)}
                className="p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Chung">Chung</option>
                <option value="Thanh toán">Thanh toán</option>
                <option value="Dịch vụ">Dịch vụ</option>
                <option value="Chính sách">Chính sách</option>
              </select>
            </div>
            <textarea
              placeholder="Nội dung câu trả lời chi tiết..."
              value={faqContent}
              onChange={(e) => setFaqContent(e.target.value)}
              rows={2}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors">
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>
          </form>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f._id} className="border border-gray-200 rounded-2xl p-4 flex items-start justify-between gap-4 bg-white shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                      {f.category}
                    </span>
                    <h5 className="font-bold text-gray-900 text-sm">{f.title}</h5>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{f.content}</p>
                </div>
                <button onClick={() => handleDeleteFaq(f._id)} className="text-gray-400 hover:text-rose-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingAndContentTab;
