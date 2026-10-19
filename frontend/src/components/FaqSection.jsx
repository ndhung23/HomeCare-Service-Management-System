import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import adminApi from '../api/adminApi';

const DEFAULT_FAQS = [
  {
    title: 'Hệ thống điều phối nhận việc tại GiúpViệc24 hoạt động như thế nào?',
    content: 'Khách hàng có thể lựa chọn 3 hình thức: Đăng lên Chợ việc làm công khai (nhận việc tức thì), Tự động ghép nhanh (ưu tiên 5 phút cho CTV Cấp 2 uy tín cao nhất), hoặc Chọn trực tiếp nhân viên ưng ý từ danh sách hồ sơ.',
  },
  {
    title: 'Người giúp việc và đối tác doanh nghiệp có được kiểm định không?',
    content: '100% người giúp việc và doanh nghiệp hoạt động trên GiúpViệc24 đều phải trải qua quy trình xác minh danh tính (KYC Cấp 2) bao gồm CCCD 2 mặt, số điện thoại chính chủ hoặc Giấy phép kinh doanh hợp lệ được quản trị viên phê duyệt.',
  },
  {
    title: 'Chính sách hủy lịch và hoàn tiền quy định ra sao?',
    content: 'Khách hàng hủy trước 4 giờ được hoàn 100% phí; hủy từ 2 - 4 giờ hoàn 70%; hủy dưới 2 giờ hoàn 50%. Khách hàng và người giúp việc cũng có thể gửi "Yêu cầu thỏa thuận hủy đơn" nếu cả hai bên cùng đồng thuận hủy mà không mất phí.',
  },
  {
    title: 'Nếu không hài lòng về chất lượng dịch vụ thì giải quyết thế nào?',
    content: 'Trong vòng 24 giờ sau khi ca làm việc kết thúc, khách hàng có quyền mở "Khiếu nại ca làm" kèm ảnh/video bằng chứng. Hệ thống sẽ tạm giữ tiền ví của người thực hiện và Quản trị viên sẽ phân xử công bằng (hoàn tiền hoặc phạt vi phạm).',
  },
  {
    title: 'Chi phí mua sắm đi chợ hộ được thanh toán như thế nào?',
    content: 'Khách hàng có thể ứng trước tiền đi chợ dự kiến. Khi hoàn thành, người giúp việc phải nhập số tiền thực tế và chụp ảnh hóa đơn mua sắm rõ ràng gửi lên hệ thống để quyết toán minh bạch.',
  },
];

const FaqSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    adminApi
      .getContent({ type: 'FAQ' })
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setFaqs(items);
        } else {
          setFaqs(DEFAULT_FAQS);
        }
      })
      .catch((err) => {
        console.warn('Không thể tải FAQ từ API, sử dụng dữ liệu mặc định:', err);
        setFaqs(DEFAULT_FAQS);
      });
  }, []);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Giải đáp thắc mắc</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Câu hỏi thường gặp
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Mọi thông tin cần thiết về quy trình đặt lịch, kiểm định người giúp việc và chính sách bảo vệ quyền lợi khách hàng.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq._id || idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-blue-200 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-slate-800 text-sm sm:text-base gap-4"
                >
                  <span className="flex-1">{faq.title}</span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-200 shrink-0 ${
                      isOpen
                        ? 'rotate-180 bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-blue-100/50 pt-3 animate-in fade-in duration-150">
                    {faq.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;

