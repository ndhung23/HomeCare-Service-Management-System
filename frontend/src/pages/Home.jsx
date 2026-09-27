import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import FeaturedHelpersSection from '../components/FeaturedHelpersSection';
import BenefitsBanner from '../components/BenefitsBanner';
import BookingModal from '../components/BookingModal';
import Footer from '../components/Footer';
import '../styles/Home.css';

const Home = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState({});

  const handleOpenBooking = (data = {}) => {
    setBookingInitialData(data);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection onOpenBooking={handleOpenBooking} />
        <ServicesSection onOpenBooking={handleOpenBooking} />
        <FeaturedHelpersSection onOpenBooking={handleOpenBooking} />
        <BenefitsBanner />
      </main>

      <Footer />

      {/* Booking flow modal for customers */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialData={bookingInitialData}
      />
    </div>
  );
};

export default Home;
