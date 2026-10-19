import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, TrendingUp, PieChart, Calendar, RefreshCw } from 'lucide-react';
import bookingApi from '../../../api/bookingApi';
import { formatVND } from '../../../utils/serviceUtils';

const CustomerSpendingTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSpending = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMySpending();
      setData(res);
    } catch (err) {
      console.error('Lỗi tải thống kê chi tiêu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpending();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Thống kê chi tiêu & Lịch sử sử dụng dịch vụ</h3>
          <p className="text-sm text-gray-500">Tổng hợp chi phí dịch vụ gia đình theo tháng và theo danh mục</p>
        </div>
        <button
          onClick={fetchSpending}
          disabled={loading}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền đã chi</p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">{formatVND(data?.totalSpent || 0)}</h4>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Cho các dịch vụ đã hoàn tất và thanh toán</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Số ca hoàn thành</p>
              <h4 className="text-2xl font-black text-gray-900 mt-1">{data?.completedCount || 0} ca</h4>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Trải nghiệm dịch vụ thành công</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dịch vụ sử dụng nhiều nhất</p>
              <h4 className="text-base font-bold text-gray-900 mt-1 truncate max-w-[180px]">
                {data?.byService && Object.keys(data.byService).length > 0
                  ? Object.entries(data.byService).sort((a, b) => b[1].count - a[1].count)[0][0]
                  : 'Chưa có dữ liệu'}
              </h4>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <PieChart className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Dựa trên số ca đã đặt</p>
        </div>
      </div>

      {/* Phân bổ theo loại dịch vụ */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Phân bổ chi tiêu theo loại dịch vụ
        </h4>
        {(!data?.byService || Object.keys(data.byService).length === 0) ? (
          <p className="text-sm text-gray-500 py-4 text-center">Bạn chưa có đơn dịch vụ nào hoàn thành.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(data.byService).map(([sName, sData]) => (
              <div key={sName} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{sName}</p>
                  <p className="text-xs text-gray-500">{sData.count} ca làm việc</p>
                </div>
                <p className="text-sm font-extrabold text-emerald-700">{formatVND(sData.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chi tiêu theo tháng */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Lịch sử chi tiêu theo tháng
        </h4>
        {(!data?.monthlySpending || Object.keys(data.monthlySpending).length === 0) ? (
          <p className="text-sm text-gray-500 py-4 text-center">Chưa có chi tiêu phát sinh.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Tháng</th>
                  <th className="py-2.5 px-4 text-right">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(data.monthlySpending).sort().reverse().map(([month, total]) => (
                  <tr key={month} className="hover:bg-gray-50">
                    <td className="py-2.5 px-4 font-semibold text-gray-900">Tháng {month}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-600">{formatVND(total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSpendingTab;

