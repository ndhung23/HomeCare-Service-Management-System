import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BenefitsBanner from '../components/BenefitsBanner';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import ServiceFilterSidebar from '../components/ServiceFilterSidebar';
import {
  Sparkles,
  SprayCan,
  PartyPopper,
  UtensilsCrossed,
  Baby,
  UserCheck,
  Shirt,
  ShieldCheck,
  AirVent,
  Building2,
  ArrowRight,
  ArrowUpDown,
  ChevronDown,
  SlidersHorizontal,
  Star,
  SearchX,
} from 'lucide-react';
import {
  mockServices,
  PRICING_TYPES,
  SERVICE_CATEGORIES,
} from '../mock/servicesData';
import '../styles/Home.css';

/* Map iconKey trong mock data -> icon component của lucide */
const ICON_MAP = {
  Sparkles,
  SprayCan,
  PartyPopper,
  UtensilsCrossed,
  Shirt,
  Baby,
  UserCheck,
  AirVent,
  Building2,
  ShieldCheck,
};

/*
 * Danh sách dịch vụ lấy từ mock data dùng chung (frontend/src/mock/servicesData.js).
 * Khi backend có endpoint GET /api/services, chỉ cần thay nguồn `mockServices` bằng call API.
 * Các trường dưới đây là "view model" phục vụ bộ lọc & card hiển thị.
 */
const servicesList = mockServices.map((service) => ({
  id: service.id,
  serviceId: service.id,
  serviceCode: service.serviceCode,
  title: service.title,
  subtitle: service.subtitle,
  desc: service.shortDescription,
  description: service.description,
  price: service.pricing.formattedPrice,
  priceFrom: service.pricing.priceFrom,
  priceTo: service.pricing.priceTo,
  sortPrice: service.pricing.sortPrice,
  pricing: service.pricing,
  category: service.category,
  areas: service.areas,
  rating: service.rating,
  reviews: service.reviewCount,
  bookings: service.bookingCount,
  image: service.imageUrl,
  icon: ICON_MAP[service.iconKey] || Sparkles,
  bgCircle: service.themeClass,
  tags: service.tags,
  isPackage: service.isPackage,
  isHourly: service.pricing.type === PRICING_TYPES.HOURLY,
  raw: service,
}));
/* Bộ lọc danh mục (dropdown) - lấy từ danh mục của mock data */
const CATEGORY_OPTIONS = [
  { id: 'all', label: 'Tất cả danh mục' },
  ...SERVICE_CATEGORIES.map((category) => ({ id: category, label: category })),
];

/* Khu vực đang có người giúp việc (dropdown) - suy ra từ dữ liệu dịch vụ */
const AREA_OPTIONS = [...new Set(servicesList.flatMap((srv) => srv.areas))];

/* Bộ lọc mức giá: theo đơn giá/giờ quy đổi của từng dịch vụ */
const PRICE_OPTIONS = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-120', label: 'Dưới 120.000đ', min: 0, max: 119999 },
  { id: '120-150', label: '120.000đ - 150.000đ', min: 120000, max: 150000 },
  { id: '150-200', label: '150.000đ - 200.000đ', min: 150001, max: 200000 },
  { id: 'over-200', label: 'Trên 200.000đ', min: 200001, max: Number.MAX_SAFE_INTEGER },
  { id: 'package', label: 'Gói ưu đãi / theo hợp đồng', packageOnly: true },
];

/* Bộ lọc điểm đánh giá tối thiểu */
const RATING_OPTIONS = [
  { id: 'all', label: 'Tất cả đánh giá', min: 0 },
  { id: '4.5', label: 'Từ 4.5 ★ trở lên', min: 4.5 },
  { id: '4.8', label: 'Từ 4.8 ★ trở lên', min: 4.8 },
  { id: '4.9', label: 'Từ 4.9 ★ trở lên', min: 4.9 },
];

/* Sắp xếp danh sách dịch vụ */
const SORT_OPTIONS = [
  { id: 'popular', label: 'Phổ biến nhất' },
  { id: 'price-asc', label: 'Giá thấp đến cao' },
  { id: 'price-desc', label: 'Giá cao đến thấp' },
  { id: 'rating', label: 'Đánh giá cao nhất' },
  { id: 'reviews', label: 'Nhiều lượt đánh giá' },
];

const INITIAL_FILTERS = {
  keyword: '',
  category: 'all',
  area: 'all',
  price: 'all',
  rating: 'all',
  sort: 'popular',
};

/* Số dịch vụ hiển thị trên mỗi trang */
const PAGE_SIZE = 9;

const ServicesPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const listTopRef = useRef(null);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  /* Số bộ lọc đang áp dụng (không tính sắp xếp) */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count += 1;
    if (filters.category !== 'all') count += 1;
    if (filters.area !== 'all') count += 1;
    if (filters.price !== 'all') count += 1;
    if (filters.rating !== 'all') count += 1;
    return count;
  }, [filters]);

  /* Lọc + sắp xếp danh sách dịch vụ hiện có trong hệ thống */
  const filteredServices = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    const priceFilter = PRICE_OPTIONS.find((opt) => opt.id === filters.price) || PRICE_OPTIONS[0];
    const ratingFilter = RATING_OPTIONS.find((opt) => opt.id === filters.rating) || RATING_OPTIONS[0];

    const result = servicesList.filter((srv) => {
      // 1. Từ khóa: tên, mô tả, kỹ năng
      const haystack = [srv.title, srv.subtitle, srv.desc, ...srv.tags].join(' ').toLowerCase();
      if (keyword && !haystack.includes(keyword)) return false;

      // 2. Danh mục dịch vụ
      if (filters.category !== 'all' && srv.category !== filters.category) return false;

      // 3. Khu vực hoạt động
      if (filters.area !== 'all' && !srv.areas.includes(filters.area)) return false;

      // 4. Mức giá: khoảng giá của dịch vụ giao với khoảng đã chọn
      if (priceFilter.packageOnly) {
        if (!srv.isPackage) return false;
      } else if (priceFilter.min !== undefined) {
        if (srv.isPackage) return false; // gói ưu đãi không có đơn giá theo giờ
        if (srv.priceFrom == null || srv.priceTo == null) return false;
        if (!(srv.priceFrom <= priceFilter.max && srv.priceTo >= priceFilter.min)) return false;
      }

      // 5. Điểm đánh giá tối thiểu
      if (srv.rating < ratingFilter.min) return false;

      return true;
    });

    const sorted = [...result];
    switch (filters.sort) {
      case 'price-asc':
        sorted.sort((a, b) => (a.priceFrom || Infinity) - (b.priceFrom || Infinity));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.priceTo || -1) - (a.priceTo || -1));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => b.bookings - a.bookings);
        break;
    }
    return sorted;
  }, [filters]);

  /* Phân trang: 9 dịch vụ / trang */
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const paginatedServices = useMemo(
    () => filteredServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredServices, page]
  );

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
    if (listTopRef.current) {
      const top = listTopRef.current.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }
  };

  const handleBookService = (srv) => {
    navigate(`/services/${srv.serviceId || srv.id}/book`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header Hero Banner */}
        {/* <section className="bg-gradient-to-b from-blue-50/70 to-white py-14 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="bg-blue-100/70 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Danh mục dịch vụ
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Dịch vụ giúp việc nhà chuyên nghiệp
            </h1>
            <p className="text-base text-slate-500 max-w-2xl mx-auto mt-3">
              Đáp ứng mọi nhu cầu sinh hoạt gia đình với đội ngũ giúp việc đã qua xác minh lý lịch và kiểm tra tay nghề.
            </p>
          </div>
        </section> */}

        {/* Bộ lọc (trái - 2 cột) + Thư viện dịch vụ (phải - 10 cột) */}
        <section className="py-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ============ LEFT: BỘ LỌC ============ */}
            <aside className={`lg:col-span-2 ${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
              <div className="lg:sticky lg:top-24">
                <ServiceFilterSidebar
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleResetFilters}
                  categories={CATEGORY_OPTIONS}
                  areas={AREA_OPTIONS}
                  priceOptions={PRICE_OPTIONS}
                  ratingOptions={RATING_OPTIONS}
                  activeCount={activeFilterCount}
                />
              </div>
            </aside>

            {/* ============ RIGHT: GALLERY DỊCH VỤ ============ */}
            <div className="lg:col-span-10">
              {/* Thanh công cụ: số kết quả + nút bộ lọc (mobile) + sắp xếp */}
              <div
                ref={listTopRef}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 shadow-xs px-4 py-3"
              >
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Dịch vụ hiện có trong hệ thống
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tìm thấy <span className="font-bold text-blue-600">{filteredServices.length}</span> dịch vụ
                    phù hợp trên tổng {servicesList.length} dịch vụ
                    {activeFilterCount > 0 && (
                      <> • Đang áp dụng <span className="font-bold">{activeFilterCount}</span> bộ lọc</>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Bộ lọc</span>
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              {/* Gallery dịch vụ */}
              {filteredServices.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 px-6 py-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                    <SearchX className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Không tìm thấy dịch vụ phù hợp</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                    Chưa có dịch vụ nào khớp với bộ lọc hiện tại. Bạn hãy thử mở rộng mức giá, khu vực hoặc
                    xóa bộ lọc để xem toàn bộ {servicesList.length} dịch vụ đang có.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Xóa tất cả bộ lọc</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginatedServices.map((srv) => {
                    const Icon = srv.icon;
                    return (
                      <article
                        key={srv.id}
                        className="group bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
                      >
                        {/* Ảnh dịch vụ - phủ kín khung theo tỷ lệ 16/10 */}
                        <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                          <img
                            src={srv.image}
                            alt={srv.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/5 to-transparent pointer-events-none" />

                          {/* Điểm đánh giá */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 border border-white/70 rounded-lg px-2 py-1 shadow-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-extrabold text-slate-800">
                              {srv.rating.toFixed(1)}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              ({srv.reviews})
                            </span>
                          </div>

                          {/* Icon danh mục */}
                          <div className="absolute bottom-3 left-3 w-11 h-11 rounded-2xl bg-white/95 border border-white/70 shadow-xs flex items-center justify-center">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${srv.bgCircle}`}>
                              <Icon className="w-5 h-5" strokeWidth={2.2} />
                            </div>
                          </div>
                        </div>

                        {/* Nội dung dịch vụ */}
                        <div className="p-5 flex flex-col flex-1 justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">
                              {srv.title}
                            </h3>
                            <p className="text-xs font-semibold text-blue-600 mb-2">
                              {srv.subtitle}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                              {srv.desc}
                            </p>

                            {/* Kỹ năng */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {srv.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-md font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-end justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[10px] text-slate-400 font-semibold uppercase">Đơn giá</div>
                              <div className="text-sm font-extrabold text-slate-900 leading-tight">
                                {srv.price}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {srv.bookings.toLocaleString('vi-VN')} lượt đặt
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBookService(srv)}
                              className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <span>Đặt dịch vụ</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Phân trang: 9 dịch vụ / trang */}
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={filteredServices.length}
                itemLabel="dịch vụ"
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </section>

        {/* Workflow Process */}
        <section className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Quy trình đơn giản</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                3 bước để có người giúp việc ưng ý
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Chọn dịch vụ & thời gian</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lựa chọn công việc bạn cần làm, chọn ngày giờ và địa chỉ tiện lợi nhất cho gia đình.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Kết nối người giúp việc</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hệ thống tìm kiếm người có kinh nghiệm phù hợp gần khu vực của bạn nhất trong 15 phút.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Nghiệm thu & Đánh giá</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Kiểm tra chất lượng sau khi hoàn thành ca làm việc và gửi đánh giá để chúng tôi phục vụ tốt hơn.
                </p>
              </div>
            </div>
          </div>
        </section>

        <BenefitsBanner />
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;

