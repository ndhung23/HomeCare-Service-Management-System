import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('[emailService] SMTP_USER hoặc SMTP_PASS chưa được cấu hình đầy đủ trong .env');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

export const sendResetPasswordEmail = async ({ to, name, resetUrl, minutes = 15 }) => {
  try {
    const transporter = createTransporter();

    const senderEmail = process.env.SMTP_USER || 'no-reply@giupviec24.vn';
    const mailOptions = {
      from: `"GiúpViệc24" <${senderEmail}>`,
      to,
      subject: '[GiúpViệc24] Hướng dẫn đặt lại mật khẩu tài khoản của bạn',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 900; font-size: 20px; padding: 10px 20px; border-radius: 12px; letter-spacing: -0.5px;">
              GiúpViệc<span style="color: #93c5fd;">24</span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin-top: 8px;">Nền tảng kết nối dịch vụ giúp việc gia đình chuyên nghiệp</p>
          </div>

          <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">
              Yêu cầu đặt lại mật khẩu
            </h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
              Xin chào <strong>${name || 'Quý khách'}</strong>,
            </p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              Hệ thống GiúpViệc24 nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email <strong>${to}</strong>.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                Đặt lại mật khẩu ngay
              </a>
            </div>

            <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
              Hoặc bạn có thể sao chép và mở liên kết sau trên trình duyệt:
            </p>
            <p style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; word-break: break-all; color: #2563eb; margin-bottom: 24px;">
              <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
              <p style="color: #ef4444; font-size: 12px; font-weight: 600; margin-bottom: 6px;">
                ⚠️ Lưu ý quan trọng:
              </p>
              <ul style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Liên kết này chỉ có hiệu lực trong vòng <strong>${minutes} phút</strong>.</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng bỏ qua thư này; tài khoản của bạn vẫn an toàn tuyệt đối.</li>
                <li>Tuyệt đối không chia sẻ liên kết này cho bất kỳ ai để bảo vệ tài khoản.</li>
              </ul>
            </div>
          </div>

          <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 11px;">
            <p>© 2026 GiúpViệc24. Mọi quyền được bảo lưu.</p>
            <p>Hỗ trợ khách hàng: hotro@giupviec24.vn | Hotline: 1900 6868</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] Đã gửi email reset password tới ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[emailService] Gửi email thất bại tới ${to}:`, err);
    throw err;
  }
};

export default {
  sendResetPasswordEmail,
};

