import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  RefreshCw, 
  Film, 
  X, 
  ShieldAlert
} from 'lucide-react';
import { formatVND } from '../../../utils/serviceUtils';
import disputeApi from '../../../api/disputeApi';

const DisputesTab = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('DISMISSED'); // 'DISMISSED' | 'PARTIAL_REFUND' | 'FULL_REFUND' | 'PENALTY'
  const [refundAmount, setRefundAmount] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const data = await disputeApi.getDisputes();
      setDisputes(data.disputes || []);
    } catch (err) {
      console.error('Lỗi tải khiếu nại:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async () => {
    if (!adminNote) {
      alert('Vui lòng ghi chú lý do / phán quyết của Admin');
      return;
    }
    if (resolution === 'PARTIAL_REFUND' && (!refundAmount || Number(refundAmount) <= 0)) {
      alert('Vui lòng nhập số tiền hoàn lại cho khách hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      await disputeApi.resolveDispute(selectedDispute._id, {
        resolution,
        refundAmount: Number(refundAmount) || 0,
        adminNote,
      });
      alert('Đã phân xử và giải quyết khiếu nại thành công!');
      setSelectedDispute(null);
      setAdminNote('');
      setRefundAmount('');
      fetchDisputes();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi phân xử khiếu nại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Xử lý Khiếu nại & Tranh chấp (Disputes)</h3>
          <p className="text-sm text-gray-500">Xem xét bằng chứng hai bên, phân xử hoàn tiền và đóng băng/giải phóng ví</p>
        </div>
        <button
          onClick={fetchDisputes}
          disabled={loading}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <AlertOctagon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Hiện không có tranh chấp hoặc khiếu nại nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div
              key={d._id}
              className={`border rounded-xl p-5 hover:shadow-md transition-shadow ${
                d.status === 'RESOLVED' ? 'border-gray-200 bg-gray-50/40' : 'border-purple-200 bg-purple-50/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-base">#{d.disputeCode}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Đơn #{d.bookingCode}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      d.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800 animate-pulse'
                    }`}>
                      {d.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đang chờ xử lý'}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleString('vi-VN')}</span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-800">Lý do: <span className="text-purple-700">{d.reason}</span></p>
                    <p className="text-xs text-gray-600 mt-0.5">{d.description}</p>
                  </div>

                  <div className="text-xs text-gray-500 flex flex-wrap gap-4 pt-1">
                    <p>Người khiếu nại: <span className="font-semibold text-gray-800">{d.creatorName}</span> ({d.creatorRole})</p>
                    <p>Thu nhập đang đóng băng: <span className="font-semibold text-rose-600">{formatVND(d.frozenAmount || 0)}</span></p>
                    {d.resolution && d.resolution !== 'NONE' && (
                      <p>Kết quả: <span className="font-bold text-emerald-700">{d.resolution}</span></p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                  {d.evidenceUrls?.length > 0 && (
                    <button
                      onClick={() => setPreviewMedia(d.evidenceUrls)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Film className="w-3.5 h-3.5 text-indigo-600" />
                      Xem bằng chứng ({d.evidenceUrls.length})
                    </button>
                  )}
                  {d.status !== 'RESOLVED' && (
                    <button
                      onClick={() => {
                        setSelectedDispute(d);
                        setRefundAmount(d.frozenAmount || '');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <ShieldAlert className="w-4 h-4" /> Phân xử ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Phán Quyết Khiếu Nại */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Phán quyết khiếu nại #{selectedDispute.disputeCode}</h3>
                <p className="text-xs text-gray-500">Đơn #{selectedDispute.bookingCode} • Tiền đang giữ: {formatVND(selectedDispute.frozenAmount)}</p>
              </div>
              <button onClick={() => setSelectedDispute(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quyết định giải quyết:</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="DISMISSED">Bác khiếu nại (Người làm đúng → Giải phóng tiền về ví người làm)</option>
                  <option value="FULL_REFUND">Hoàn tiền 100% cho khách (Khấu trừ toàn bộ tiền công người làm)</option>
                  <option value="PARTIAL_REFUND">Hoàn tiền một phần cho khách (Khấu trừ một phần, trả phần dư cho người làm)</option>
                  <option value="PENALTY">Phạt vi phạm quy định (Khấu trừ tiền phạt vào ví người làm)</option>
                </select>
              </div>

              {resolution === 'PARTIAL_REFUND' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Số tiền hoàn lại cho khách (VNĐ):</label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 100000"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ghi chú & Căn cứ phân xử của Admin:</label>
                <textarea
                  placeholder="Ghi rõ lý do đưa ra quyết định..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleResolve}
                disabled={isSubmitting}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm shadow-sm"
              >
                Xác nhận phán quyết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewMedia(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-gray-900 text-sm">Bằng chứng khiếu nại</h4>
              <button onClick={() => setPreviewMedia(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {previewMedia.map((url, i) => {
                const isVideo = url.match(/\.(mp4|mov|webm)$/i) || url.includes('/video/upload/');
                return (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    {isVideo ? (
                      <video src={url} controls className="w-full h-40 object-cover" />
                    ) : (
                      <img src={url} alt={`Evidence ${i}`} className="w-full h-40 object-cover cursor-pointer" onClick={() => window.open(url, '_blank')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputesTab;

