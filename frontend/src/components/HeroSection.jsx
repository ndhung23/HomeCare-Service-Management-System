import React, { useState } from 'react';
import { ShieldCheck, MapPin, Grid, Calendar, Search, ChevronDown } from 'lucide-react';
import landingpageSvg from '../assets/landingpage.svg';

const HeroSection = ({ onOpenBooking }) => {
  const [address, setAddress] = useState('');
  const [service, setService] = useState('');
  const [time, setTime] = useState('');

  const handleSearchClick = () => {
    if (onOpenBooking) {
      onOpenBooking({
        address: address || 'Cầu Giấy, Hà Nội',
        service: service === 'cleaning' ? 'Dọn dẹp nhà theo giờ' :
                 service === 'cooking' ? 'Nấu ăn gia đình' :
                 service === 'babysitting' ? 'Chăm sóc trẻ nhỏ' :
                 service === 'elderly' ? 'Chăm sóc người già' :
                 service === 'laundry' ? 'Giặt ủi, phơi đồ' : 'Giúp việc theo giờ',
      });
    }
  };

  return (
    <section className="relative pt-8 pb-16 lg:pb-24 overflow-hidden min-h-[520px] lg:min-h-[580px] flex items-center bg-[#f9fbff]">
      
      {/* Background SVG behind Hero */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <img
          src={landingpageSvg}
          alt="Hero Background"
          className="w-full h-full object-cover object-right lg:object-right-top"
        />
        {/* Soft gradient overlay on the left to ensure headline and search box readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent md:w-3/5 lg:w-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading & Search Box */}
          <div className="lg:col-span-8 z-10">
            
            {/* Trust Badge */}
            <div className="hero-trust-badge mb-5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Dịch vụ uy tín • An toàn • Chuyên nghiệp</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 leading-[1.18] tracking-tight mb-5">
              Thuê người giúp việc nhà <br />
              <span className="text-blue-600 font-extrabold">dễ dàng, nhanh chóng</span>
            </h1>

            {/* Description Subtext */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8">
              Chúng tôi kết nối bạn với những người giúp việc uy tín, có kinh nghiệm, 
              đáp ứng mọi nhu cầu: dọn dẹp, nấu ăn, chăm sóc người già, trẻ nhỏ...
            </p>

            {/* Floating Search Bar Widget */}
            <div className="search-widget max-w-3xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                
                {/* 1. Address input */}
                <div className="w-full md:w-1/3 flex items-center gap-3 px-2 py-1.5">
                  <div className="text-slate-400 shrink-0">
                    <MapPin className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <label className="block text-xs font-semibold text-slate-700">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ của bạn"
                      className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 font-normal"
                    />
                  </div>
                </div>

                <div className="hidden md:block search-field-divider" />

                {/* 2. Service type select */}
                <div className="w-full md:w-1/3 flex items-center gap-3 px-2 py-1.5 relative">
                  <div className="text-slate-400 shrink-0">
                    <Grid className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 text-left cursor-pointer">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Loại dịch vụ
                      </label>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full text-sm text-slate-800 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 cursor-pointer appearance-none"
                    >
                      <option value="">Chọn dịch vụ</option>
                      <option value="cleaning">Dọn dẹp nhà</option>
                      <option value="cooking">Nấu ăn gia đình</option>
                      <option value="babysitting">Chăm sóc trẻ nhỏ</option>
                      <option value="elderly">Chăm sóc người già</option>
                      <option value="laundry">Giặt ủi, phơi đồ</option>
                      <option value="hourly">Giúp việc theo giờ</option>
                    </select>
                  </div>
                </div>

                <div className="hidden md:block search-field-divider" />

                {/* 3. Time input */}
                <div className="w-full md:w-1/3 flex items-center gap-3 px-2 py-1.5">
                  <div className="text-slate-400 shrink-0">
                    <Calendar className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <label className="block text-xs font-semibold text-slate-700">
                      Thời gian
                    </label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="Chọn thời gian"
                      className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 font-normal"
                    />
                  </div>
                </div>

                {/* Submit Search Button */}
                <button 
                  type="button"
                  onClick={handleSearchClick}
                  className="w-full md:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all whitespace-nowrap cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Tìm người giúp việc</span>
                </button>

              </div>
            </div>

          </div>

          {/* Right Column: Handwriting Quote */}
          <div className="lg:col-span-4 relative flex justify-end items-start h-full min-h-[160px] lg:min-h-[360px]">
            {/* Handwriting Quote Bubble */}
            <div className="text-right pointer-events-none pt-4 pr-2 sm:pr-4">
              <p className="handwriting-quote">
                Giúp bạn có thêm thời gian cho những điều quan trọng ♡
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
