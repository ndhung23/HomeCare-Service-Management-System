import React from 'react';
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
} from 'lucide-react';
import { mockServices } from '../mock/servicesData';

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

/* 6 dịch vụ tiêu biểu hiển thị ở lưới danh mục trang chủ */
const services = mockServices.slice(0, 6).map((service) => ({
  id: service.id,
  serviceId: service.id,
  serviceCode: service.serviceCode,
  title: service.title,
  subtitle: service.subtitle,
  bgCircle: service.themeClass,
  icon: ICON_MAP[service.iconKey] || Sparkles,
}));

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
                onClick={() => onOpenBooking && onOpenBooking({ serviceId: item.serviceId, service: item.title })}
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
