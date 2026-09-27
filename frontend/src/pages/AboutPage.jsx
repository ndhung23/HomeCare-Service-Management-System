import React from 'react';
import Navbar from '../components/Navbar';
import BenefitsBanner from '../components/BenefitsBanner';
import Footer from '../components/Footer';
import { 
  ShieldCheck, 
  Heart, 
  Users, 
  Award, 
  CheckCircle2
} from 'lucide-react';
import '../styles/Home.css';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50/70 to-white py-16 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="bg-blue-100/70 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Về chúng tôi
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mt-3 tracking-tight">
              GiúpViệc24 – Nhà sạch, cuộc sống tốt hơn
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-4 leading-relaxed">
              Chúng tôi tiên phong ứng dụng công nghệ để kết nối hàng ngàn gia đình bận rộn với đội ngũ người giúp việc tận tâm, có đạo đức và chuyên môn cao.
            </p>
          </div>
        </section>

        {/* Story & Mission */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                Câu chuyện của chúng tôi
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                Giải phóng thời gian để bạn tận hưởng những điều ý nghĩa nhất
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mt-4">
                Trong nhịp sống hiện đại hối hả, công việc nhà, nấu nướng và chăm sóc người thân vô tình lấy đi những giây phút nghỉ ngơi quý giá của mỗi người. GiúpViệc24 ra đời với mục tiêu mang đến giải pháp giúp việc minh bạch, linh hoạt theo giờ, đảm bảo sự an tâm tuyệt đối cho tổ ấm của bạn.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                    100% người giúp việc được xác minh căn cước công dân và sơ yếu lý lịch rõ ràng.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                    Đào tạo kỹ năng dọn dẹp, nấu ăn và giao tiếp lịch sự trước khi nhận việc.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                    Bảo hiểm trách nhiệm dịch vụ và chính sách đổi người giúp việc miễn phí.
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" 
                alt="Đội ngũ GiúpViệc24" 
                className="w-full h-[380px] rounded-3xl object-cover shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-lg hidden sm:block">
                <div className="text-2xl font-black text-blue-600">10,000+</div>
                <div className="text-xs text-slate-500 font-semibold">Gia đình tin tưởng sử dụng</div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-14 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Giá trị cốt lõi</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Nguyên tắc hoạt động của GiúpViệc24
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">An toàn tuyệt đối</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lý lịch trong sạch, kiểm tra nhân thân kỹ càng, cam kết đền bù nếu xảy ra hư hại tài sản.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Chất lượng chuẩn mực</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Đội ngũ được đào tạo bài bản quy trình dọn dẹp khoa học và tác phong trung thực.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Tận tâm phục vụ</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Luôn lắng nghe phản hồi của gia đình, chăm sóc chu đáo từ những góc nhỏ nhất trong căn nhà.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">Minh bạch chi phí</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bảng giá công khai rõ ràng trên ứng dụng, tuyệt đối không phát sinh bất kỳ phụ phí nào.
                </p>
              </div>
            </div>
          </div>
        </section>

        <BenefitsBanner />
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
