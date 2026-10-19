import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BenefitsBanner from '../components/BenefitsBanner';
import Footer from '../components/Footer';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import newsApi from '../api/newsApi';
import '../styles/Home.css';

const NewsPage = () => {
  const [newsArticles, setNewsArticles] = useState([]);

  useEffect(() => {
    newsApi.getNews()
      .then((data) => setNewsArticles(data))
      .catch((err) => console.error('Lỗi khi tải tin tức từ MongoDB:', err));
  }, []);
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
