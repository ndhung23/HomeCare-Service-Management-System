import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, CheckCircle2, ChevronRight } from 'lucide-react';

const helpers = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan',
    experience: 'Kinh nghiệm: 3 năm',
    rating: 4.9,
    reviewsCount: 56,
    skills: ['Dọn dẹp', 'Nấu ăn'],
    hourlyRate: '120.000đ',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    verified: true,
  },
  {
    id: 2,
    name: 'Trần Thị Hương',
    experience: 'Kinh nghiệm: 5 năm',
    rating: 4.8,
    reviewsCount: 42,
    skills: ['Dọn dẹp', 'Giặt ủi'],
    hourlyRate: '150.000đ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    verified: true,
  },
  {
    id: 3,
    name: 'Lê Thị Mai',
    experience: 'Kinh nghiệm: 4 năm',
    rating: 4.9,
    reviewsCount: 38,
    skills: ['Nấu ăn', 'Chăm sóc trẻ'],
    hourlyRate: '140.000đ',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    verified: true,
  },
  {
    id: 4,
    name: 'Phạm Thị Dung',
    experience: 'Kinh nghiệm: 6 năm',
    rating: 4.7,
    reviewsCount: 31,
    skills: ['Chăm sóc người già', 'Dọn dẹp'],
    hourlyRate: '160.000đ',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
    verified: true,
  },
];

const FeaturedHelpersSection = ({ onOpenBooking }) => {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-blue-600 font-semibold text-sm tracking-wide mb-2 flex items-center gap-2">
              <span className="w-5 h-[2px] bg-blue-600 inline-block rounded-full"></span>
              Người giúp việc nổi bật
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Đội ngũ được tuyển chọn kỹ lưỡng
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
              Tất cả người giúp việc đều được xác minh lý lịch, đào tạo kỹ năng và có kinh nghiệm thực tế.
            </p>
          </div>

          <div>
            <Link
              to="/helpers"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-slate-300 text-sm font-medium text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all bg-white hover:bg-blue-50/50"
            >
              <span>Xem thêm người giúp việc</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Helpers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpers.map((helper) => {
            const isFav = favorites[helper.id];
            return (
              <div key={helper.id} className="helper-card flex flex-col justify-between">
                
                {/* Image Header with Heart button - full khung dọc 4:5 */}
                <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
                  <img
                    src={helper.avatar}
                    alt={helper.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(helper.id)}
                    aria-label="Yêu thích"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-rose-500 transition-colors shadow-sm"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-transform ${isFav ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} 
                    />
                  </button>

                  {/* Verified Badge */}
                  {helper.verified && (
                    <div className="absolute bottom-3 left-3">
                      <span className="helper-verified-pill shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã xác minh</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {helper.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {helper.experience}
                    </div>

                    {/* Rating stars & review counts */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-800">
                        {helper.rating}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({helper.reviewsCount} đánh giá)
                      </span>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {helper.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hourly Rate & Book Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-slate-900">
                        {helper.hourlyRate}
                      </span>
                      <span className="text-xs text-slate-500"> / giờ</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => onOpenBooking && onOpenBooking({
                        helperName: helper.name,
                        hourlyRate: parseInt(helper.hourlyRate.replace(/\D/g, '')) || 120000,
                        service: helper.skills[0] || 'Dọn dẹp nhà theo giờ',
                      })}
                      className="btn-book cursor-pointer"
                    >
                      Đặt lịch
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturedHelpersSection;
