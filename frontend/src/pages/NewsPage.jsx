import React from 'react';
import Navbar from '../components/Navbar';
import BenefitsBanner from '../components/BenefitsBanner';
import Footer from '../components/Footer';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import '../styles/Home.css';

const newsArticles = [
  {
    id: 1,
    title: 'Top 7 mẹo khử mùi ẩm mốc phòng khách và nhà bếp nhanh chóng',
    summary: 'Chỉ với những nguyên liệu tự nhiên quen thuộc như giấm trắng, chanh tươi và bã cà phê, bạn có thể đánh bay mùi hôi khó chịu.',
    category: 'Mẹo vặt gia đình',
    date: '26/09/2026',
    readTime: '3 phút đọc',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Kinh nghiệm chọn người giúp việc trông trẻ an toàn, tận tâm',
    summary: 'Những tiêu chí quan trọng cha mẹ cần lưu ý khi phỏng vấn và kiểm tra kỹ năng của người giúp việc chăm sóc bé.',
    category: 'Cẩm nang cho mẹ',
    date: '24/09/2026',
    readTime: '5 phút đọc',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'GiúpViệc24 mở rộng tuyển dụng 200 cộng tác viên tại Hà Nội & TP.HCM',
    summary: 'Thu nhập hấp dẫn từ 10 - 15 triệu/tháng, thời gian làm việc linh hoạt theo giờ, được đào tạo tay nghề miễn phí.',
    category: 'Tuyển dụng',
    date: '20/09/2026',
    readTime: '4 phút đọc',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Ưu đãi tháng 10: Tặng mã giảm 50.000đ cho khách hàng mới',
    summary: 'Chương trình tri ân đặc biệt chào đón mùa thu, nhập mã GV24NEW để nhận ngay ưu đãi khi đặt ca giúp việc đầu tiên.',
    category: 'Khuyến mãi',
    date: '18/09/2026',
    readTime: '2 phút đọc',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
];

const NewsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50/70 to-white py-14 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="bg-blue-100/70 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Bản tin & Cẩm nang
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Tin tức & Mẹo hay chăm sóc nhà cửa
            </h1>
            <p className="text-base text-slate-500 max-w-2xl mx-auto mt-3">
              Cập nhật kiến thức hữu ích về dọn dẹp không gian sống, dinh dưỡng gia đình và tin tức hoạt động từ GiúpViệc24.
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {newsArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col sm:flex-row group"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden relative">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-blue-600 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {art.category}
                  </span>
                </div>

                <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {art.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {art.readTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                    <span className="font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                      Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <BenefitsBanner />
      </main>

      <Footer />
    </div>
  );
};

export default NewsPage;
