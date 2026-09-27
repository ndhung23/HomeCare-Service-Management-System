import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import BenefitsBanner from '../components/BenefitsBanner';
import BookingModal from '../components/BookingModal';
import { 
  Sparkles, 
  UtensilsCrossed, 
  Baby, 
  UserCheck, 
  Shirt, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import '../styles/Home.css';

const servicesList = [
  {
    id: 'cleaning',
    title: 'Dọn dẹp nhà theo giờ',
    subtitle: 'Nhà cửa luôn tinh tươm, sạch mát',
    desc: 'Lau dọn phòng khách, hút bụi, lau sàn, cọ rửa nhà vệ sinh, sắp xếp đồ đạc gọn gàng.',
    price: '120.000đ - 140.000đ / giờ',
    icon: Sparkles,
    bgCircle: 'bg-blue-50 text-blue-600 border-blue-100',
    tags: ['Hút bụi', 'Lau kính', 'Vệ sinh toilet', 'Gọn gàng'],
  },
  {
    id: 'cooking',
    title: 'Nấu ăn gia đình',
    subtitle: 'Bữa cơm chuẩn vị mẹ nấu, dinh dưỡng',
    desc: 'Đi chợ theo yêu cầu, sơ chế thực phẩm tươi ngon, nấu các món ăn hợp khẩu vị gia đình, dọn rửa bát đĩa.',
    price: '130.000đ - 150.000đ / giờ',
    icon: UtensilsCrossed,
    bgCircle: 'bg-amber-50 text-amber-600 border-amber-100',
    tags: ['Đi chợ', 'Nấu món Bắc - Trung - Nam', 'Dọn bếp'],
  },
  {
    id: 'babysitting',
    title: 'Chăm sóc trẻ nhỏ',
    subtitle: 'Yêu thương, an toàn, tận tâm',
    desc: 'Đưa đón bé đi học, cho bé ăn uống đúng giờ, chơi cùng bé, giám sát an toàn và rèn luyện thói quen tốt.',
    price: '140.000đ - 160.000đ / giờ',
    icon: Baby,
    bgCircle: 'bg-rose-50 text-rose-500 border-rose-100',
    tags: ['Kinh nghiệm trông trẻ', 'Tập ăn dặm', 'Đưa đón'],
  },
  {
    id: 'elderly',
    title: 'Chăm sóc người già & người bệnh',
    subtitle: 'Ân cần, chu đáo, hiểu tâm lý',
    desc: 'Hỗ trợ sinh hoạt hàng ngày, nhắc uống thuốc đúng cữ, trò chuyện bầu bạn, xoa bóp và đi dạo nhẹ nhàng.',
    price: '150.000đ - 180.000đ / giờ',
    icon: UserCheck,
    bgCircle: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    tags: ['Kiểm tra huyết áp', 'Nhắc thuốc', 'Tâm lý người cao tuổi'],
  },
  {
    id: 'laundry',
    title: 'Giặt ủi, phơi & gấp quần áo',
    subtitle: 'Tiện lợi, thơm tho, nhanh chóng',
    desc: 'Phân loại đồ trắng - màu, giặt máy/giặt tay đồ nhạy cảm, phơi nắng thơm mát, là ủi phẳng phiu và xếp tủ.',
    price: '110.000đ - 130.000đ / giờ',
    icon: Shirt,
    bgCircle: 'bg-purple-50 text-purple-600 border-purple-100',
    tags: ['Là ủi áo sơ mi', 'Phân loại vải', 'Xếp tủ ngăn nắp'],
  },
  {
    id: 'hourly',
    title: 'Giúp việc định kỳ & tổng vệ sinh',
    subtitle: 'Tiết kiệm chi phí, cố định người làm',
    desc: 'Gói định kỳ 3 - 5 buổi/tuần hoặc gói tổng vệ sinh nhà mới sửa chữa, dọn dẹp nhà đón lễ Tết.',
    price: 'Ưu đãi tiết kiệm đến 20%',
    icon: ShieldCheck,
    bgCircle: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    tags: ['Người làm cố định', 'Đổi người miễn phí', 'Hợp đồng linh hoạt'],
  },
];

const ServicesPage = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState({});

  const handleBookService = (srv) => {
    setSelectedService({
      service: srv.title,
      hourlyRate: 120000,
    });
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        
        {/* Header Hero Banner */}
        <section className="bg-gradient-to-b from-blue-50/70 to-white py-14 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="bg-blue-100/70 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Danh mục dịch vụ
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Dịch vụ giúp việc nhà chuyên nghiệp
            </h1>
            <p className="text-base text-slate-500 max-w-2xl mx-auto mt-3">
              Đáp ứng mọi nhu cầu sinh hoạt gia đình với đội ngũ giúp việc đã qua xác minh lý lịch và kiểm tra tay nghề.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${srv.bgCircle}`}>
                      <Icon className="w-7 h-7" strokeWidth={2.2} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {srv.title}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 mb-3">
                      {srv.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {srv.desc}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {srv.tags.map((t, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-md font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Đơn giá</div>
                      <div className="text-sm font-extrabold text-slate-900">{srv.price}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBookService(srv)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Đặt dịch vụ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workflow Process */}
        <section className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Quy trình đơn giản</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                3 bước để có người giúp việc ưng ý
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Chọn dịch vụ & thời gian</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lựa chọn công việc bạn cần làm, chọn ngày giờ và địa chỉ tiện lợi nhất cho gia đình.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Kết nối người giúp việc</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hệ thống tìm kiếm người có kinh nghiệm phù hợp gần khu vực của bạn nhất trong 15 phút.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Nghiệm thu & Đánh giá</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Kiểm tra chất lượng sau khi hoàn thành ca làm việc và gửi đánh giá để chúng tôi phục vụ tốt hơn.
                </p>
              </div>
            </div>
          </div>
        </section>

        <BenefitsBanner />
      </main>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialData={selectedService}
      />
    </div>
  );
};

export default ServicesPage;
