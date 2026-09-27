import React from 'react';
import { 
  Sparkles, 
  UtensilsCrossed, 
  Baby, 
  UserCheck, 
  Shirt, 
  ShieldCheck 
} from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'Dọn dẹp nhà',
    subtitle: 'Nhà cửa luôn sạch sẽ',
    bgCircle: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Nấu ăn',
    subtitle: 'Bữa ăn ngon, dinh dưỡng',
    bgCircle: 'bg-amber-50 text-amber-600 border border-amber-100',
    icon: UtensilsCrossed,
  },
  {
    id: 3,
    title: 'Chăm sóc trẻ',
    subtitle: 'An toàn, tận tâm',
    bgCircle: 'bg-rose-50 text-rose-500 border border-rose-100',
    icon: Baby,
  },
  {
    id: 4,
    title: 'Chăm sóc người già',
    subtitle: 'Chu đáo, chuyên nghiệp',
    bgCircle: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    icon: UserCheck,
  },
  {
    id: 5,
    title: 'Giặt ủi, phơi đồ',
    subtitle: 'Tiện lợi, nhanh chóng',
    bgCircle: 'bg-purple-50 text-purple-600 border border-purple-100',
    icon: Shirt,
  },
  {
    id: 6,
    title: 'Giúp việc theo giờ',
    subtitle: 'Linh hoạt thời gian',
    bgCircle: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
    icon: ShieldCheck,
  },
];

const ServicesSection = ({ onOpenBooking }) => {
  return (
    <section className="py-12 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onOpenBooking && onOpenBooking({ service: item.title })}
                className="service-item-card p-6 rounded-2xl text-center cursor-pointer group"
              >
                <div className={`service-icon-wrapper ${item.bgCircle}`}>
                  <Icon className="w-7 h-7" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
