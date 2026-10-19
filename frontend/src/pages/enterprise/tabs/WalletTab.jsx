import React, { useState } from 'react';
import { formatVND } from '../../../utils/serviceUtils';
import walletApi from '../../../api/walletApi';

const WalletTab = ({ availableBalance = 0, bankInfo = {}, onRefresh }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount < 200000) {
      alert('Số tiền rút tối thiểu là 200.000đ');
      return;
    }
    setIsWithdrawing(true);
    try {
      await walletApi.requestWithdraw({ amount });
      alert('Gửi yêu cầu rút tiền thành công! Admin sẽ duyệt trong 24h làm việc.');
      setWithdrawAmount('');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi yêu cầu rút tiền');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md">
          <div className="text-xs text-emerald-100 uppercase font-bold tracking-wider">Số dư khả dụng</div>
          <div className="text-3xl font-black mt-2">{formatVND(availableBalance)}</div>
          <p className="text-xs text-emerald-100 mt-2">
            Sau khi khấu trừ phí sàn B2B (12%) và tự động nhận thanh toán từ khách
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs md:col-span-2">
          <h3 className="font-bold text-slate-900 text-base mb-1">Yêu cầu rút tiền về tài khoản ngân hàng</h3>
          <p className="text-xs text-slate-500 mb-4">
            Số tiền rút tối thiểu: 200.000đ. Quyết toán trong 24 giờ làm việc.
          </p>

          <form onSubmit={handleWithdraw} className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              min="200000"
              step="50000"
              required
              placeholder="Nhập số tiền muốn rút (ví dụ: 500000)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={isWithdrawing}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {isWithdrawing ? 'Đang gửi...' : 'Gửi yêu cầu rút'}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Tài khoản thụ hưởng:{' '}
              <strong>
                {bankInfo?.accountNumber
                  ? `${bankInfo.bankName} - ${bankInfo.accountNumber} (${bankInfo.accountName})`
                  : 'Chưa cập nhật tài khoản ngân hàng'}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTab;

