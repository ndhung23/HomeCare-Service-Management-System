import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import FeaturedHelpersSection from '../components/FeaturedHelpersSection';
import BenefitsBanner from '../components/BenefitsBanner';
import FaqSection from '../components/FaqSection';
import Footer from '../components/Footer';
import serviceApi from '../api/serviceApi';
import { resolveService } from '../utils/serviceUtils';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    serviceApi.getServices()
      .then((data) => setServices(data))
      .catch((err) => console.warn('Không thể tải dịch vụ:', err));
  }, []);

  const handleOpenBooking = (data = {}) => {
    const srv = resolveService(data, services);
    const serviceId = srv?.serviceCode || srv?.id || 'CLEANING_HOURLY';
    
    const params = new URLSearchParams();
    if (data.helperName) params.set('helper', data.helperName);
    if (data.address) params.set('address', data.address);

    const queryString = params.toString();
    navigate(`/services/${serviceId}/book${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection onOpenBooking={handleOpenBooking} />
        <ServicesSection onOpenBooking={handleOpenBooking} />
        <FeaturedHelpersSection onOpenBooking={handleOpenBooking} />
        <FaqSection />
        <BenefitsBanner />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
