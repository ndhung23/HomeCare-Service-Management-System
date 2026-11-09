export default async function handler(req, res) {
  // 1. Phản hồi PayOS Webhook nhanh (bảo đảm luôn HTTP 200 cho PayOS)
  if (req.url && req.url.includes('/payos-webhook')) {
    try {
      const mod = await import('../server.js');
      const app = mod.default || mod;
      return app(req, res);
    } catch (err) {
      console.error('PayOS Webhook fallback acknowledged with 200:', err.message);
      return res.status(200).json({
        success: true,
        message: 'PayOS webhook acknowledged successfully via fallback',
        note: err.message,
      });
    }
  }

  // 2. Các request API khác
  try {
    const mod = await import('../server.js');
    const app = mod.default || mod;
    return app(req, res);
  } catch (error) {
    console.error('Serverless function handler error:', error);
    return res.status(500).json({
      error: 'SERVERLESS_HANDLER_ERROR_BACKEND',
      message: error.message,
      stack: error.stack,
      cwd: process.cwd(),
    });
  }
}
