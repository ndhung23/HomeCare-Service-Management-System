import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import workerApi from '../api/workerApi';
import { formatVND } from '../utils/serviceUtils';

const FeaturedHelpersSection = ({ onOpenBooking }) => {
  const [helpers, setHelpers] = useState([]);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    workerApi.getWorkers()
      .then((data) => setHelpers(data.slice(0, 4)))
      .catch((err) => console.warn('Lỗi tải người giúp việc nổi bật:', err));
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
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
            const helperId = helper._id || helper.id || helper.code;
            const isFav = favorites[helperId];
            const formattedHourly = formatVND(helper.hourlyRate || 120000);

            return (
              <div key={helperId} className="helper-card flex flex-col justify-between">
                {/* Image Header */}
                <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
                  <img
                    src={helper.avatar}
                    alt={helper.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                  />

                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(helperId)}
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
                      {helper.experience || `Kinh nghiệm: ${helper.experienceYears || 3} năm`}
                    </div>

                    {/* Rating stars & review counts */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-800">
                        {helper.rating}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({helper.reviewsCount || 0} đánh giá)
                      </span>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(helper.skills || []).map((skill, index) => (
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
                        {formattedHourly}
                      </span>
                      <span className="text-xs text-slate-500"> / giờ</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenBooking &&
                        onOpenBooking({
                          helperName: helper.name,
                          hourlyRate: helper.hourlyRate,
                          service: helper.skills?.[0] || 'Dọn dẹp nhà theo giờ',
                        })
                      }
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
