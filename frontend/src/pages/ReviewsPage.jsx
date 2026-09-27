import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import BenefitsBanner from '../components/BenefitsBanner';
import Footer from '../components/Footer';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  ShieldCheck
} from 'lucide-react';
import '../styles/Home.css';

const mockReviews = [
  {
    id: 1,
    author: 'Chị Mai Phương',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    date: 'Hôm qua',
    service: 'Dọn dẹp nhà theo giờ',
    helper: 'Cô Nguyễn Thị Lan',
    rating: 5,
    comment: 'Cô Lan làm việc cực kỳ cẩn thận và sạch sẽ. Đồ đạc trong phòng khách và bếp được xếp lại ngăn nắp, thơm mát. Chắc chắn sẽ tiếp tục đặt cô vào tuần tới!',
    likes: 12,
  },
  {
    id: 2,
    author: 'Anh Tuấn Hưng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    date: '3 ngày trước',
    service: 'Nấu ăn gia đình',
    helper: 'Chị Lê Thị Mai',
    rating: 5,
    comment: 'Gia đình mình có con nhỏ và ông bà lớn tuổi, chị Mai nấu ăn rất vừa miệng, các món canh thanh đạm, ít dầu mỡ, cả nhà ai cũng khen ngon.',
    likes: 8,
  },
  {
    id: 3,
    author: 'Chị Ngọc Hà',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    date: '1 tuần trước',
    service: 'Chăm sóc trẻ em',
    helper: 'Cô Trần Thị Hương',
    rating: 5,
    comment: 'Bé nhà mình khá nhát người lạ nhưng cô Hương rất khéo dỗ dành và kiên nhẫn. Mình đi làm cả ngày hoàn toàn yên tâm khi có cô chăm sóc bé.',
    likes: 15,
  },
  {
    id: 4,
    author: 'Anh Quốc Bảo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    date: '2 tuần trước',
    service: 'Giặt ủi & Là quần áo',
    helper: 'Cô Phạm Thị Dung',
    rating: 4.8,
    comment: 'Áo sơ mi của mình được là phẳng phiu cẩn thận, quần áo gấp gọn gàng chia theo từng ngăn tủ. Tác phong làm việc đúng giờ và lễ phép.',
    likes: 6,
  },
];

const ReviewsPage = () => {
  const [filterRating, setFilterRating] = useState('all');

  const filtered = mockReviews.filter(r => {
    if (filterRating === 'all') return true;
    return r.rating >= parseFloat(filterRating);
  });

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((rev) => (
              <div
                key={rev.id}
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
        </section>

        <BenefitsBanner />
      </main>

      <Footer />
    </div>
  );
};

export default ReviewsPage;
