import React, { useState, useEffect } from 'react';
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
import serviceApi from '../api/serviceApi';

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

const ServicesSection = ({ onOpenBooking }) => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    serviceApi.getServices()
      .then((data) => {
        setServices(data.slice(0, 6));
      })
      .catch((err) => {
        console.warn('Lỗi khi tải dịch vụ trang chủ:', err);
      });
  }, []);

  return (
    <section className="py-12 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {services.map((item) => {
            const Icon = ICON_MAP[item.iconKey] || Sparkles;
            return (
              <div
                key={item._id || item.id || item.serviceCode}
                onClick={() =>
                  onOpenBooking &&
                  onOpenBooking({
                    serviceId: item.serviceCode || item.id || item._id,
                    service: item.title,
                  })
                }
                className="service-item-card p-6 rounded-2xl text-center cursor-pointer group"
              >
                <div className={`service-icon-wrapper ${item.themeClass || 'bg-blue-50 text-blue-600'}`}>
                  <Icon className="w-7 h-7" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2">
                  {item.subtitle || item.shortDescription}
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
