import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Building2,
  Clock,
  TrendingUp,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import walletApi from '../../../api/walletApi';
import { formatVND } from '../../../utils/serviceUtils';
import { useToast } from '../../../context/ToastContext';

const WalletTab = ({ user, onWalletChanged }) => {
  const { toast } = useToast();
  const [walletInfo, setWalletInfo] = useState({ available: 0, locked: 0, bank: {}, transactions: [], withdraws: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [txFilter, setTxFilter] = useState('ALL'); // 'ALL' | 'EARNING' | 'WITHDRAW'

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
      if (onWalletChanged) {
        onWalletChanged();
      }
    } catch (err) {
      console.error('Lỗi tải ví:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, onWalletChanged]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const availableBalance = walletInfo.available || 0;
  const lockedBalance = walletInfo.locked || 0;
  const numWithdrawAmount = Number(withdrawAmount) || 0;

  // Tổng thu nhập đã nhận qua các đơn hàng
  const totalEarned = useMemo(() => {
    if (!walletInfo.transactions) return 0;
    return walletInfo.transactions
      .filter((t) => t.type === 'EARNING' || t.amount > 0)
      .reduce((acc, cur) => acc + (cur.amount || 0), 0);
  }, [walletInfo.transactions]);

  // Bộ lọc lịch sử giao dịch
  const filteredTransactions = useMemo(() => {
    if (!walletInfo.transactions) return [];
    if (txFilter === 'EARNING') {
      return walletInfo.transactions.filter((t) => t.amount > 0 || t.type === 'EARNING');
    }
    if (txFilter === 'WITHDRAW') {
      return walletInfo.transactions.filter((t) => t.amount < 0 || t.type === 'WITHDRAW');
    }
    return walletInfo.transactions;
  }, [walletInfo.transactions, txFilter]);

  const withdrawValidationError = useMemo(() => {
    if (!withdrawAmount) return null;
    if (isNaN(numWithdrawAmount) || numWithdrawAmount <= 0) {
      return 'Vui lòng nhập số tiền hợp lệ lớn hơn 0.';
    }
    if (numWithdrawAmount < 200000) {
      return `Hạn mức rút tối thiểu là 200.000đ (bạn đang nhập ${formatVND(numWithdrawAmount)}).`;
    }
    if (numWithdrawAmount > availableBalance) {
      return `Số tiền rút vượt quá số dư khả dụng hiện có (${formatVND(availableBalance)}).`;
    }
    return null;
  }, [withdrawAmount, numWithdrawAmount, availableBalance]);

  const hasBankLinked = Boolean(walletInfo.bank?.accountNumber && walletInfo.bank?.bankName);
  const isWithdrawValid = !withdrawValidationError && numWithdrawAmount >= 200000 && numWithdrawAmount <= availableBalance && hasBankLinked;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount < 200000) {
      toast.warning('Hạn mức rút tối thiểu là 200.000đ theo quy định sàn!');
      return;
    }
    if (amount > availableBalance) {
      toast.error('Số dư khả dụng trong ví không đủ!');
      return;
    }
    if (!hasBankLinked) {
      toast.error('Vui lòng liên kết tài khoản ngân hàng nhận tiền trước khi rút!');
      return;
    }

    setIsSubmitting(true);
    try {
      await walletApi.requestWithdraw({ amount });
      toast.success('Yêu cầu rút tiền thành công! Admin sẽ duyệt lệnh chuyển khoản.');
      setShowWithdraw(false);
      setWithdrawAmount('');
      await fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi khi tạo lệnh rút tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      await walletApi.updateBank({ bankName, accountNumber, accountName });
      toast.success('Cập nhật tài khoản ngân hàng thành công!');
      setShowBankEdit(false);
      await fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi khi cập nhật ngân hàng');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Fintech Virtual Card + Linked Bank Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fintech Virtual Card with solid background & gradient fallback */}
        <div
          style={{ background: 'linear-gradient(135deg, #090d16 0%, #0f172a 45%, #1e1b4b 100%)' }}
          className="lg:col-span-7 relative overflow-hidden rounded-3xl text-white p-7 shadow-2xl border border-slate-700/80 flex flex-col justify-between min-h-[250px] group"
        >
          {/* Card subtle pattern & glow */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top Row: Chip, Contactless, Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* EMV Chip graphic */}
              <div
                style={{ background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 60%, #b45309 100%)' }}
                className="w-11 h-8 rounded-md shadow-md flex flex-col justify-around p-1 border border-amber-300/60"
              >
                <div className="h-0.5 bg-amber-900/50 w-full rounded-full" />
                <div className="h-0.5 bg-amber-900/50 w-3/4 rounded-full" />
                <div className="h-0.5 bg-amber-900/50 w-full rounded-full" />
              </div>
              {/* Contactless waves */}
              <div className="text-white/80">
                <Zap className="w-4 h-4 rotate-45 text-amber-300 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-white/10 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Ví Thu Nhập Pro
              </span>
            </div>
          </div>

          {/* Card Middle: Balance with Eye Toggle */}
          <div className="relative z-10 my-4">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span>Số dư khả dụng</span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer p-0.5"
                title={showBalance ? 'Ẩn số dư' : 'Hiện số dư'}
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono flex items-baseline gap-2 drop-shadow-sm">
              {showBalance ? formatVND(availableBalance) : '•••••••• đ'}
            </div>
            <p className="text-[11px] text-slate-300/90 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Đã trừ 20% phí sàn. Tiền có thể rút về tài khoản ngân hàng bất cứ lúc nào.
            </p>
          </div>

          {/* Card Footer: Partner name & Action */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Chủ sở hữu ví</div>
              <div className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                {user?.name || 'CỘNG TÁC VIÊN'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowWithdraw(true)}
                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                className="px-4 py-2 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-blue-400/30"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Rút tiền ngay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Linked Bank Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Tài khoản thụ hưởng</h4>
                  <p className="text-[10px] text-slate-400">Nhận tiền giải ngân từ Admin</p>
                </div>
              </div>
              <CreditCard className="w-5 h-5 text-slate-300" />
            </div>

            {hasBankLinked ? (
              <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Ngân hàng:</span>
                  <span className="font-extrabold text-blue-700">{walletInfo.bank?.bankName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Số tài khoản:</span>
                  <span className="font-mono font-black text-slate-900 tracking-wider">
                    {walletInfo.bank?.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-800 uppercase">
                    {walletInfo.bank?.accountName || user?.name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Chưa liên kết tài khoản ngân hàng
                </div>
                <p className="text-[11px] text-amber-700">
                  Cần cung cấp thông tin tài khoản ngân hàng chính chủ để nhận tiền khi rút.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBankEdit(true)}
              className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{hasBankLinked ? 'Thay đổi tài khoản nhận' : '+ Thêm tài khoản ngân hàng'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Số dư khả dụng */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Khả dụng rút ngay</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{formatVND(availableBalance)}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Sẵn sàng giao dịch
            </div>
          </div>
        </div>

        {/* Stat 2: Tạm khóa chờ duyệt */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Đang chờ Admin duyệt</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{formatVND(lockedBalance)}</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
              {lockedBalance > 0 ? 'Lệnh rút đang được xử lý' : 'Không có lệnh treo'}
            </div>
          </div>
        </div>

        {/* Stat 3: Tổng thu nhập tích lũy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng thu nhập ca làm</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{formatVND(totalEarned)}</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
              Tổng tiền công thực nhận
            </div>
          </div>
        </div>
      </div>

      {/* Lịch sử yêu cầu rút tiền (Withdraws) nếu có */}
      {walletInfo.withdraws && walletInfo.withdraws.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Lệnh rút tiền gần đây ({walletInfo.withdraws.length})
            </h3>
            <span className="text-[11px] text-slate-400">Tự động đối soát với ngân hàng</span>
          </div>

          <div className="divide-y divide-slate-100">
            {walletInfo.withdraws.map((w) => {
              const statusBadge =
                w.status === 'APPROVED' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã chuyển khoản
                  </span>
                ) : w.status === 'REJECTED' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                    Bị từ chối
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    Chờ Admin duyệt
                  </span>
                );

              return (
                <div key={w._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        Rút về {w.bank?.bankName || 'Ngân hàng'} ({w.bank?.accountNumber || '***'})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(w.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900">-{formatVND(w.amount)}</div>
                    </div>
                    {statusBadge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Lịch sử biến động số dư</h3>
            <p className="text-[11px] text-slate-400">Minh bạch dòng tiền ca làm việc và lệnh rút</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setTxFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  txFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setTxFilter('EARNING')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  txFilter === 'EARNING' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-emerald-700'
                }`}
              >
                Thu nhập (+)
              </button>
              <button
                type="button"
                onClick={() => setTxFilter('WITHDRAW')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  txFilter === 'WITHDRAW' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-blue-700'
                }`}
              >
                Rút tiền (-)
              </button>
            </div>

            <button
              onClick={fetchWallet}
              title="Làm mới lịch sử"
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {(!filteredTransactions || filteredTransactions.length === 0) ? (
          <div className="text-center py-12 text-xs text-slate-400 space-y-1">
            <Filter className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
            <p className="font-medium">Chưa có giao dịch nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isPositive = (tx.amount || 0) > 0;
              return (
                <div key={tx._id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isPositive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{tx.note || tx.type}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono text-sm font-black ${
                        isPositive ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatVND(tx.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Số dư sau: {formatVND(tx.balanceAfter)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form onSubmit={handleWithdraw} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 scale-in-center">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Rút tiền về tài khoản ngân hàng</h3>
              <button
                type="button"
                onClick={() => setShowWithdraw(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-blue-50/80 rounded-2xl text-xs text-blue-900 space-y-1.5 border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Số dư khả dụng:</span>
                <span className="text-sm font-black text-blue-900">{formatVND(availableBalance)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-blue-600">
                <span>Hạn mức rút tối thiểu:</span>
                <span className="font-bold">200.000đ</span>
              </div>
            </div>

            {/* Input số tiền & Validation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Số tiền muốn rút (VNĐ)</label>
                {availableBalance >= 200000 && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(availableBalance))}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Rút tối đa ({formatVND(availableBalance)})
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={200000}
                  max={availableBalance}
                  step={10000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Nhập số tiền (tối thiểu 200.000đ)"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-bold text-slate-900 outline-none transition-all ${
                    withdrawValidationError
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : isWithdrawValid
                      ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-200 focus:border-blue-600'
                  }`}
                  autoFocus
                />
                {withdrawAmount && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Nút chọn nhanh số tiền */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[200000, 500000, 1000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={val > availableBalance}
                    onClick={() => setWithdrawAmount(String(val))}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                      numWithdrawAmount === val
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : val > availableBalance
                        ? 'opacity-40 bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    {formatVND(val)}
                  </button>
                ))}
                {availableBalance >= 200000 && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(availableBalance))}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                      numWithdrawAmount === availableBalance
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Toàn bộ số dư
                  </button>
                )}
              </div>

              {/* Live validation feedback */}
              {withdrawValidationError ? (
                <div className="p-2.5 mt-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{withdrawValidationError}</span>
                </div>
              ) : isWithdrawValid ? (
                <div className="mt-2 space-y-1 animate-in fade-in">
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Số tiền rút hợp lệ: <strong>{formatVND(numWithdrawAmount)}</strong></span>
                  </div>
                  {numWithdrawAmount > 5000000 && (
                    <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 pl-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Lệnh rút trên 5.000.000đ sẽ được Admin thẩm định kỹ theo quy định sàn.</span>
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Thông tin ngân hàng */}
            {!hasBankLinked ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Chưa có thông tin tài khoản ngân hàng nhận tiền
                </div>
                <p className="text-amber-700 text-[11px]">Vui lòng cập nhật số tài khoản nhận tiền trước khi tạo lệnh rút.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdraw(false);
                    setShowBankEdit(true);
                  }}
                  className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 text-xs cursor-pointer"
                >
                  Cập nhật ngân hàng ngay
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
                <div className="text-[11px] text-slate-400 font-semibold">Tài khoản nhận tiền:</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {walletInfo.bank?.bankName} • {walletInfo.bank?.accountNumber} ({walletInfo.bank?.accountName})
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWithdraw(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isWithdrawValid}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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
              <button
                type="button"
                onClick={() => setShowBankEdit(false)}
                className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
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
              <button
                type="button"
                onClick={() => setShowBankEdit(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
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
