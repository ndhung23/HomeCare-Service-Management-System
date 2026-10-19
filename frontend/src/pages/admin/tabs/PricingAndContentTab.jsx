import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  RefreshCw 
} from 'lucide-react';
import adminApi from '../../../api/adminApi';
import reviewApi from '../../../api/reviewApi';

const PricingAndContentTab = () => {
  const [subSection, setSubSection] = useState('PRICING'); // 'PRICING' | 'REVIEWS' | 'FAQ'
  const [config, setConfig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newHoliday, setNewHoliday] = useState('');
  
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

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await adminApi.updateConfig(config);
      alert('Đã cập nhật bảng giá và cấu hình hệ thống thành công!');
      fetchConfig();
    } catch (err) {
      alert('Lỗi khi lưu cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = () => {
    if (!newHoliday) return;
    if ((config.holidays || []).includes(newHoliday)) {
      alert('Ngày này đã có trong danh sách!');
      return;
    }
    setConfig({
      ...config,
      holidays: [...(config.holidays || []), newHoliday].sort(),
    });
    setNewHoliday('');
  };

  const handleRemoveHoliday = (dateStr) => {
    setConfig({
      ...config,
      holidays: (config.holidays || []).filter((h) => h !== dateStr),
    });
  };

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

  const serviceLabels = {
    CLEANING: 'Dọn dẹp nhà tiêu chuẩn',
    DEEP_CLEANING: 'Tổng vệ sinh chuyên sâu',
    COOKING: 'Nấu ăn gia đình',
    LAUNDRY: 'Giặt ủi & Phơi gấp',
    ELDERLY_CARE: 'Chăm sóc người cao tuổi',
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
          <DollarSign className="w-4 h-4" /> Bảng giá & Ngày lễ
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

      {subSection === 'PRICING' && config && (
        <div className="space-y-6 max-w-3xl">
          <div className="border rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-base">Đơn giá cơ bản / giờ của từng dịch vụ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(serviceLabels).map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">{serviceLabels[key]}</label>
                    <label className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.serviceStatus?.[key] !== false}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            serviceStatus: { ...config.serviceStatus, [key]: e.target.checked },
                          })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      Kích hoạt
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      value={config.baseHourlyRates?.[key] || 70000}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          baseHourlyRates: {
                            ...config.baseHourlyRates,
                            [key]: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">VNĐ/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-base">Cấu hình Ngày Lễ / Tết (Phụ thu +20%)</h4>
            <div className="flex gap-2">
              <input
                type="date"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                className="p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleAddHoliday}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Thêm ngày lễ
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {(config.holidays || []).map((dateStr) => (
                <span
                  key={dateStr}
                  className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {dateStr}
                  <button onClick={() => handleRemoveHoliday(dateStr)} className="text-gray-400 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" /> Lưu cấu hình hệ thống
          </button>
        </div>
      )}

      {subSection === 'REVIEWS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Ẩn các đánh giá chứa từ ngữ tiêu cực hoặc vi phạm tiêu chuẩn cộng đồng</p>
            <button onClick={fetchReviews} className="p-2 border rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="divide-y border rounded-xl overflow-hidden">
            {reviews.map((r) => (
              <div key={r._id} className={`p-4 flex items-start justify-between gap-4 ${r.isHidden ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{r.author}</span>
                    <span className="text-amber-500 font-bold text-xs">★ {r.rating}</span>
                    <span className="text-xs text-gray-500">({r.service})</span>
                    {r.isHidden && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-bold">
                        Đang bị ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">Đánh giá cho: {r.helper || 'Người làm'}</p>
                </div>
                <button
                  onClick={() => handleToggleReview(r._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm ${
                    r.isHidden ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {r.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {r.isHidden ? 'Bỏ ẩn' : 'Ẩn review'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subSection === 'FAQ' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateFaq} className="border rounded-xl p-5 space-y-3 bg-gray-50/50">
            <h4 className="font-bold text-gray-900 text-sm">Thêm câu hỏi FAQ mới</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Câu hỏi thường gặp..."
                value={faqTitle}
                onChange={(e) => setFaqTitle(e.target.value)}
                className="sm:col-span-2 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={faqCategory}
                onChange={(e) => setFaqCategory(e.target.value)}
                className="p-2.5 border rounded-xl text-sm bg-white"
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
              className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>
          </form>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f._id} className="border rounded-xl p-4 flex items-start justify-between gap-4">
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

