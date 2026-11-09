import pkg from '@payos/node';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: './backend/.env' });

const PayOS = pkg.PayOS || pkg.default?.PayOS || pkg;

const clientId = process.env.PAYOS_CLIENT_ID || '';
const apiKey = process.env.PAYOS_API_KEY || '';
const checksumKey = process.env.PAYOS_CHECKSUM_KEY || '';

let payosInstance = null;

if (clientId && apiKey && checksumKey) {
  try {
    payosInstance = new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });
    console.log('✓ PayOS v2 Payment Gateway initialized successfully (BIDV - VietQR)');
  } catch (err) {
    console.error('Lỗi khởi tạo PayOS:', err);
  }
} else {
  console.warn('Thiếu cấu hình PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY trong .env');
}

export const getPayOS = () => payosInstance;

/**
 * Tạo link thanh toán PayOS VietQR
 */
export const createPayOSPaymentLink = async ({ orderCode, amount, description, cancelUrl, returnUrl }) => {
  if (!payosInstance) {
    throw new Error('PayOS chưa được cấu hình đầy đủ API keys trong file .env');
  }

  // PayOS yêu cầu description tối đa 25 ký tự không dấu hoặc ký tự đặc biệt
  const cleanDesc = (description || `Don ${orderCode}`)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .slice(0, 25);

  const body = {
    orderCode: Number(orderCode),
    amount: Number(amount),
    description: cleanDesc,
    cancelUrl: cancelUrl || 'http://localhost:3000/customer',
    returnUrl: returnUrl || 'http://localhost:3000/customer',
  };

  // PayOS v2: paymentRequests.create
  if (payosInstance.paymentRequests?.create) {
    return await payosInstance.paymentRequests.create(body);
  }
  if (typeof payosInstance.createPaymentLink === 'function') {
    return await payosInstance.createPaymentLink(body);
  }
  throw new Error('Không tìm thấy hàm tạo link thanh toán PayOS');
};

/**
 * Xác thực dữ liệu webhook từ PayOS
 */
export const verifyPayOSWebhook = (webhookBody) => {
  if (!payosInstance) return null;
  if (payosInstance.webhooks?.verify) {
    return payosInstance.webhooks.verify(webhookBody);
  }
  if (typeof payosInstance.verifyPaymentWebhookData === 'function') {
    return payosInstance.verifyPaymentWebhookData(webhookBody);
  }
  return null;
};

export default {
  getPayOS,
  createPayOSPaymentLink,
  verifyPayOSWebhook,
};
