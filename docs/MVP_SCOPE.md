# Báo cáo Triển khai MVP — GiúpViệc24

## 1. Tổng quan Dự án & Nghiệp vụ đã hoàn tất (MVP)

Hệ thống MVP của nền tảng **GiúpViệc24** đã được triển khai hoàn chỉnh, bám sát bộ đặc tả nghiệp vụ `Role.md` (v2.0) và các chỉ thị quyết định của Người dùng:

1. **Chu trình đơn dịch vụ khép kín (End-to-End Booking Lifecycle):**
   - Khách hàng (Customer) đặt dịch vụ với các thuộc tính động (diện tích, số phòng, thú cưng, lau kính, tạm ứng đi chợ...).
   - **Tính giá chuẩn ở Backend:** Toàn bộ công thức giá, chiết khấu và snapshot được khóa chặt ở `pricingService.js` (không tin cậy dữ liệu giá client). Phí sàn chỉ thu trên tiền công, không thu trên tiền tạm ứng thực phẩm.
   - Lead time tối thiểu 2 giờ được kiểm tra nghiêm ngặt.
   - Đơn bắt đầu ở trạng thái `PENDING` và đẩy lên **Chợ việc làm** với số nhà cụ thể và SĐT khách được che tự động để bảo vệ quyền riêng tư.
   - **Nhận ca nguyên tử (Atomic claiming):** Dùng `findOneAndUpdate` với điều kiện `{ status: 'PENDING' }` để triệt tiêu race condition (hai người cùng tranh nhận 1 đơn).
   - **Chặn trùng lịch (±30 phút buffer):** Hệ thống tự động kiểm tra khoảng thời gian `[startAt - 30p, endAt + 30p]` của Helper/nhân viên trước khi cho phép nhận ca.
   - Chuyển trạng thái sang `UPCOMING` (Sắp diễn ra).
   - Bắt đầu ca: Helper/Enterprise bấm "Bắt đầu ca" → chuyển sang `IN_PROGRESS`.
   - Hoàn thành ca: Bắt buộc upload 1–5 ảnh bằng chứng sau dọn dẹp → chuyển sang `AWAITING_PAYMENT`.
   - Khách hàng quét mã VietQR tự động sinh theo thông tin ngân hàng sàn.
   - **Admin xác nhận thanh toán VietQR:** Admin đối soát tài khoản và bấm "Xác nhận đã nhận tiền" trên Admin Dashboard → Trạng thái đơn chuyển sang `COMPLETED`, hệ thống tự động giải ngân vào ví người làm (80% cho Helper cá nhân, 88% cho Doanh nghiệp B2B với phí sàn 12%), đồng thời ghi nhận lịch sử giao dịch `WalletTransaction`.
   - Khách hàng đánh giá 1–5 sao kèm nhận xét → Hệ thống tự động tính lại điểm đánh giá trung bình của Helper trên trang `/helpers`.

2. **Quy trình Xác minh Danh tính (KYC):**
   - Helper Cấp 1 chỉ xem được Chợ việc làm, bị khóa nút nhận việc.
   - Helper nộp ảnh chân dung và 2 mặt CCCD qua tab KYC.
   - Admin kiểm tra hồ sơ, đối chiếu ảnh và bấm Duyệt Cấp 2 (hoặc Từ chối có lý do).
   - Khi được duyệt Cấp 2, tài khoản Helper tự động được liên kết/tạo hồ sơ `Worker` để hiển thị công khai trên danh sách người giúp việc uy tín (`/helpers`).

3. **Phân hệ Doanh nghiệp Đối tác B2B (Enterprise):**
   - Tỷ lệ chiết khấu sàn ưu đãi: 12% (Doanh nghiệp thực nhận 88% doanh thu ca).
   - Nhận ca từ Chợ việc làm và chọn 1 nhân viên phụ trách trực thuộc công ty.
   - Kiểm tra trùng lịch riêng cho từng nhân viên của doanh nghiệp.
   - Quản lý đội ngũ nhân sự (danh sách nhân viên, thêm nhân sự mới).
   - Quản lý ví doanh nghiệp và gửi yêu cầu rút tiền.

4. **Bảo mật & Quản trị Hệ thống (Admin & Auth):**
   - Bảo mật JWT Token toàn diện trên Axios interceptor và Express middleware.
   - Đăng nhập/Đăng ký chuẩn RESTful API với xác nhận mật khẩu.
   - Bảo vệ phân quyền Route (`RequireRole`) tại Frontend cho 4 nhóm vai trò: `admin`, `enterprise`, `helper`, `customer`.
   - Quản trị viên quản lý danh sách người dùng, lọc vai trò, khóa/mở khóa tài khoản có lý do.
   - Quản lý và duyệt lệnh rút tiền (tối thiểu 200.000đ).

---

## 2. Danh mục API Endpoints

### Booking & Lifecycle
- `POST /api/bookings`: Đặt lịch dịch vụ mới (Server tính giá, snapshot, lead time >= 2h).
- `GET /api/bookings`: Lấy danh sách ca (theo quyền người dùng).
- `GET /api/bookings/market`: Chợ việc làm (danh sách ca PENDING, che số nhà/SĐT).
- `GET /api/bookings/:id`: Chi tiết ca làm việc.
- `PUT /api/bookings/:id/accept`: Nhận ca (chặn trùng lịch, nguyên tử, kiểm tra KYC 2).
- `PUT /api/bookings/:id/start`: Bắt đầu thực hiện ca (`IN_PROGRESS`).
- `PUT /api/bookings/:id/complete`: Hoàn tất ca kèm upload ảnh bằng chứng (`AWAITING_PAYMENT`).
- `PUT /api/bookings/:id/cancel`: Yêu cầu / xác nhận hủy ca.

### Thanh toán & Ví
- `GET /api/payments/:id/vietqr`: Lấy link ảnh mã QR VietQR thanh toán.
- `PUT /api/payments/:id/confirm-admin`: Admin xác nhận đã nhận tiền VietQR → giải ngân tự động vào ví.
- `GET /api/wallet`: Xem số dư ví khả dụng, tiền đang khóa, lịch sử giao dịch và rút tiền.
- `POST /api/wallet/withdraw`: Tạo yêu cầu rút tiền về tài khoản ngân hàng (>= 200k).
- `PUT /api/wallet/bank`: Cập nhật thông tin tài khoản ngân hàng thụ hưởng.

### KYC & Quản trị (Admin)
- `GET /api/kyc/status`: Kiểm tra trạng thái hồ sơ CCCD của người giúp việc.
- `POST /api/kyc/submit`: Nộp ảnh chân dung và 2 mặt CCCD (hỗ trợ Cloudinary / fallback local).
- `GET /api/admin/stats`: Báo cáo thống kê tổng quan doanh thu, số đơn, tài khoản.
- `GET /api/admin/kyc/pending`: Danh sách hồ sơ KYC chờ duyệt.
- `PUT /api/admin/kyc/:userId/approve`: Phê duyệt KYC Cấp 2.
- `PUT /api/admin/kyc/:userId/reject`: Từ chối KYC kèm lý do.
- `GET /api/admin/withdraws`: Danh sách yêu cầu rút tiền chờ duyệt.
- `PUT /api/admin/withdraws/:id/approve`: Duyệt lệnh rút tiền.
- `PUT /api/admin/users/:userId/lock`: Khóa / Mở khóa tài khoản.

---

## 3. Kết quả Kiểm thử & Tiêu chuẩn Tuân thủ

- **Bộ kiểm thử tự động Backend (`npm test`):** 6/6 tests PASS (100%), bao gồm cả kịch bản tích hợp End-to-End toàn diện `tests/e2eMvpFlow.test.js` mô phỏng đầy đủ 10 bước nghiệp vụ.
- **Biên dịch Frontend (`npm run build`):** Biên dịch thành công với `EXIT CODE 0`, 0 lỗi, 0 cảnh báo.
- **Kiểm soát độ dài tệp tin (< 1000 LOC):** 100% các tệp mã nguồn trong toàn bộ project đều dưới 900 dòng code (các trang lớn như `HelperProfile`, `EnterpriseDashboard` đều được module hóa thành các tab nhỏ gọn 100-200 dòng).

