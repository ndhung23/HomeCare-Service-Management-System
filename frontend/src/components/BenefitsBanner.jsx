import React from 'react';
import { ShieldCheck, Heart, Headphones, Sprout } from 'lucide-react';

const benefits = [
  {
    id: 1,
    title: 'Tuyển chọn kỹ lưỡng',
    description: 'Xác minh lý lịch, kinh nghiệm',
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: 'Đổi người miễn phí',
    description: 'Nếu không phù hợp',
    icon: Heart,
  },
  {
    id: 3,
    title: 'Hỗ trợ 24/7',
    description: 'Luôn sẵn sàng giải đáp',
    icon: Headphones,
  },
  {
    id: 4,
    title: 'Chi phí minh bạch',
    description: 'Không phát sinh phụ phí',
    icon: Sprout,
  },
];

const BenefitsBanner = () => {
  return (
    <section className="py-8 bg-white mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="guarantee-banner p-6 sm:p-8 flex flex-col xl:flex-row items-center justify-between gap-6">
          
          {/* 4 Benefits Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full xl:w-4/5">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-3.5">
                  <div className="guarantee-item-icon shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Handwriting Quote */}
          <div className="xl:w-1/5 text-center xl:text-right shrink-0">
            <span className="handwriting-quote-footer">
              Vì một ngôi nhà hạnh phúc hơn ♡
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BenefitsBanner;
