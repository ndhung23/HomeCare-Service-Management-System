import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, CreditCard, ArrowDownRight, ArrowUpRight, RefreshCw, X } from 'lucide-react';
import walletApi from '../../../api/walletApi';
import { formatVND } from '../../../utils/serviceUtils';

const WalletTab = ({ user }) => {
  const [walletInfo, setWalletInfo] = useState({ available: 0, locked: 0, bank: {}, transactions: [], withdraws: [] });
  const [isLoading, setIsLoading] = useState(false);

  // Withdraw Modal
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank edit
  const [showBankEdit, setShowBankEdit] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await walletApi.getMyWallet();
      setWalletInfo(data);
      if (data.bank) {
        setBankName(data.bank.bankName || 'Vietcombank');
        setAccountNumber(data.bank.accountNumber || '');
        setAccountName(data.bank.accountName || user?.name || '');
      }
    } catch (err) {
      console.error('Lỗi tải ví:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount < 200000) {
      alert('Hạn mức rút tối thiểu là 200.000đ!');
      return;
    }
    if (amount > (walletInfo.available || 0)) {
      alert('Số dư khả dụng trong ví không đủ!');
      return;
    }

    setIsSubmitting(true);
    try {
      await walletApi.requestWithdraw({ amount });
      alert('Yêu cầu rút tiền thành công! Admin sẽ xử lý chuyển khoản trong 1-2 ngày làm việc.');
      setShowWithdraw(false);
      setWithdrawAmount('');
      await fetchWallet();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi tạo lệnh rút tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      await walletApi.updateBank({ bankName, accountNumber, accountName });
      alert('Cập nhật tài khoản ngân hàng thành công!');
      setShowBankEdit(false);
      await fetchWallet();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi cập nhật ngân hàng');
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between opacity-80 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Số dư khả dụng</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black">{formatVND(walletInfo.available || 0)}</div>
            <p className="text-xs opacity-75 mt-2">
              Tiền ca làm việc được giải ngân ngay khi khách hàng thanh toán thành công (đã khấu trừ 20% phí sàn).
            </p>
          </div>

          <div className="pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="text-xs">
              <span className="opacity-75">Ngân hàng nhận: </span>
              <strong>{walletInfo.bank?.bankName || 'Chưa liên kết'}</strong> • {walletInfo.bank?.accountNumber || ''}
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              className="bg-white hover:bg-slate-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs"
            >
              Rút tiền về ngân hàng
            </button>
          </div>
        </div>

        {/* Bank Card info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Tài khoản liên kết</span>
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            {walletInfo.bank?.accountNumber ? (
              <div className="space-y-1">
                <div className="text-base font-black text-slate-900">{walletInfo.bank.bankName}</div>
                <div className="text-sm font-bold text-slate-700 tracking-wider">{walletInfo.bank.accountNumber}</div>
                <div className="text-xs text-slate-400 uppercase font-semibold">{walletInfo.bank.accountName}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-3">Chưa có thông tin tài khoản ngân hàng</div>
            )}
          </div>
          <button
            onClick={() => setShowBankEdit(true)}
            className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            {walletInfo.bank?.accountNumber ? 'Thay đổi ngân hàng' : 'Liên kết tài khoản'}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h3 className="text-sm font-extrabold text-slate-900">Lịch sử giao dịch ví</h3>
          <button onClick={fetchWallet} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {(!walletInfo.transactions || walletInfo.transactions.length === 0) ? (
          <div className="text-center py-8 text-xs text-slate-400">Chưa có biến động số dư nào</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {walletInfo.transactions.map((tx) => (
              <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.amount > 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{tx.note || tx.type}</div>
                    <div className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatVND(tx.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400">Số dư: {formatVND(tx.balanceAfter)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleWithdraw} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Rút tiền về tài khoản ngân hàng</h3>
              <button type="button" onClick={() => setShowWithdraw(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-900 space-y-1">
              <div>Số dư khả dụng: <strong>{formatVND(walletInfo.available || 0)}</strong></div>
              <div>Hạn mức rút tối thiểu: <strong>200.000đ</strong></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền muốn rút (VNĐ)</label>
              <input
                type="number"
                min={200000}
                max={walletInfo.available || 0}
                step={10000}
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="200000"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div className="text-xs text-slate-500">
              Tiền sẽ được chuyển về: <strong>{walletInfo.bank?.bankName}</strong> ({walletInfo.bank?.accountNumber} - {walletInfo.bank?.accountName})
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowWithdraw(false)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || Number(withdrawAmount) < 200000 || Number(withdrawAmount) > (walletInfo.available || 0)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl"
              >
                {isSubmitting ? 'Đang tạo lệnh...' : 'Xác nhận rút tiền'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bank Edit Modal */}
      {showBankEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleSaveBank} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Thông tin ngân hàng nhận tiền</h3>
              <button type="button" onClick={() => setShowBankEdit(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên ngân hàng</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Vietcombank, MB, Techcombank, BIDV..."
                className="w-full px-3.5 py-2 border rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số tài khoản</label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="1028392819"
                className="w-full px-3.5 py-2 border rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên chủ tài khoản (viết hoa không dấu)</label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="NGUYEN THI LAN"
                className="w-full px-3.5 py-2 border rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowBankEdit(false)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">
                Đóng
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl">
                Lưu thông tin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WalletTab;
