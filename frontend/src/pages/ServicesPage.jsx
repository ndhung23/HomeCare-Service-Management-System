import React, { useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import BenefitsBanner from '../components/BenefitsBanner';
import BookingModal from '../components/BookingModal';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import ServiceFilterSidebar from '../components/ServiceFilterSidebar';
import {
  Sparkles,
  UtensilsCrossed,
  Baby,
  UserCheck,
  Shirt,
  ShieldCheck,
  ArrowRight,
  ArrowUpDown,
  ChevronDown,
  SlidersHorizontal,
  Star,
  SearchX,
} from 'lucide-react';
import '../styles/Home.css';

/*
 * Danh sách dịch vụ hiện có trong hệ thống (mock data).
 * Khi backend có endpoint GET /api/services, thay bằng call API + loading state.
 * priceFrom / priceTo là đơn giá theo giờ (VND) dùng cho bộ lọc "Mức giá".
 * isPackage: dịch vụ bán theo gói/hợp đồng nên không áp bộ lọc giá theo giờ.
 */
const servicesList = [
  {
    id: 'cleaning',
    title: 'Dọn dẹp nhà theo giờ',
    subtitle: 'Nhà cửa luôn tinh tươm, sạch mát',
    desc: 'Lau dọn phòng khách, hút bụi, lau sàn, cọ rửa nhà vệ sinh, sắp xếp đồ đạc gọn gàng.',
    price: '120.000đ - 140.000đ / giờ',
    priceFrom: 120000,
    priceTo: 140000,
    category: 'cleaning',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    rating: 4.9,
    reviews: 1284,
    bookings: 3210,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70',
    icon: Sparkles,
    bgCircle: 'bg-blue-50 text-blue-600 border-blue-100',
    tags: ['Hút bụi', 'Lau kính', 'Vệ sinh toilet', 'Gọn gàng'],
  },
  {
    id: 'cooking',
    title: 'Nấu ăn gia đình',
    subtitle: 'Bữa cơm chuẩn vị mẹ nấu, dinh dưỡng',
    desc: 'Đi chợ theo yêu cầu, sơ chế thực phẩm tươi ngon, nấu các món ăn hợp khẩu vị gia đình, dọn rửa bát đĩa.',
    price: '130.000đ - 150.000đ / giờ',
    priceFrom: 130000,
    priceTo: 150000,
    category: 'cooking',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    rating: 4.8,
    reviews: 986,
    bookings: 2480,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=70',
    icon: UtensilsCrossed,
    bgCircle: 'bg-amber-50 text-amber-600 border-amber-100',
    tags: ['Đi chợ', 'Nấu món Bắc - Trung - Nam', 'Dọn bếp'],
  },
  {
    id: 'babysitting',
    title: 'Chăm sóc trẻ nhỏ',
    subtitle: 'Yêu thương, an toàn, tận tâm',
    desc: 'Đưa đón bé đi học, cho bé ăn uống đúng giờ, chơi cùng bé, giám sát an toàn và rèn luyện thói quen tốt.',
    price: '140.000đ - 160.000đ / giờ',
    priceFrom: 140000,
    priceTo: 160000,
    category: 'babysitting',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh'],
    rating: 4.9,
    reviews: 742,
    bookings: 1690,
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=70',
    icon: Baby,
    bgCircle: 'bg-rose-50 text-rose-500 border-rose-100',
    tags: ['Kinh nghiệm trông trẻ', 'Tập ăn dặm', 'Đưa đón'],
  },
  {
    id: 'elderly',
    title: 'Chăm sóc người già & người bệnh',
    subtitle: 'Ân cần, chu đáo, hiểu tâm lý',
    desc: 'Hỗ trợ sinh hoạt hàng ngày, nhắc uống thuốc đúng cữ, trò chuyện bầu bạn, xoa bóp và đi dạo nhẹ nhàng.',
    price: '150.000đ - 180.000đ / giờ',
    priceFrom: 150000,
    priceTo: 180000,
    category: 'elderly',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    rating: 4.8,
    reviews: 615,
    bookings: 1320,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=70',
    icon: UserCheck,
    bgCircle: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    tags: ['Kiểm tra huyết áp', 'Nhắc thuốc', 'Tâm lý người cao tuổi'],
  },
  {
    id: 'laundry',
    title: 'Giặt ủi, phơi & gấp quần áo',
    subtitle: 'Tiện lợi, thơm tho, nhanh chóng',
    desc: 'Phân loại đồ trắng - màu, giặt máy/giặt tay đồ nhạy cảm, phơi nắng thơm mát, là ủi phẳng phiu và xếp tủ.',
    price: '110.000đ - 130.000đ / giờ',
    priceFrom: 110000,
    priceTo: 130000,
    category: 'laundry',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    rating: 4.7,
    reviews: 438,
    bookings: 1150,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=70',
    icon: Shirt,
    bgCircle: 'bg-purple-50 text-purple-600 border-purple-100',
    tags: ['Là ủi áo sơ mi', 'Phân loại vải', 'Xếp tủ ngăn nắp'],
  },
  {
    id: 'hourly',
    title: 'Giúp việc định kỳ & tổng vệ sinh',
    subtitle: 'Tiết kiệm chi phí, cố định người làm',
    desc: 'Gói định kỳ 3 - 5 buổi/tuần hoặc gói tổng vệ sinh nhà mới sửa chữa, dọn dẹp nhà đón lễ Tết.',
    price: 'Ưu đãi tiết kiệm đến 20%',
    isPackage: true,
    category: 'package',
    areas: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    rating: 4.9,
    reviews: 512,
    bookings: 870,
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=70',
    icon: ShieldCheck,
    bgCircle: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    tags: ['Người làm cố định', 'Đổi người miễn phí', 'Hợp đồng linh hoạt'],
  },
];
/* Bộ lọc danh mục (dropdown) */
const CATEGORY_OPTIONS = [
  { id: 'all', label: 'Tất cả danh mục' },
  { id: 'cleaning', label: 'Dọn dẹp nhà cửa' },
  { id: 'cooking', label: 'Nấu ăn gia đình' },
  { id: 'babysitting', label: 'Chăm sóc trẻ nhỏ' },
  { id: 'elderly', label: 'Chăm sóc người già' },
  { id: 'laundry', label: 'Giặt ủi - Là quần áo' },
  { id: 'package', label: 'Gói định kỳ - Tổng vệ sinh' },
];

/* Khu vực đang có người giúp việc (dropdown) */
const AREA_OPTIONS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'];

/* Bộ lọc mức giá theo đơn giá/giờ */
const PRICE_OPTIONS = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-120', label: 'Dưới 120.000đ', min: 0, max: 119999 },
  { id: '120-150', label: '120.000đ - 150.000đ', min: 120000, max: 150000 },
  { id: 'over-150', label: 'Trên 150.000đ', min: 150001, max: Number.MAX_SAFE_INTEGER },
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
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState({});
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
    setSelectedService({
      service: srv.title,
      hourlyRate: srv.priceFrom || 120000,
    });
    setIsBookingOpen(true);
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

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialData={selectedService}
      />
    </div>
  );
};

export default ServicesPage;

