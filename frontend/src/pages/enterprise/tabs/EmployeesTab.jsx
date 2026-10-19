import React, { useState } from 'react';
import { Plus, Phone, X } from 'lucide-react';
import authApi from '../../../api/authApi';

const EmployeesTab = ({ employees = [], onRefresh }) => {
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({ name: '', phone: '', birthYear: 1992, gender: 'Nữ' });
  const [isAddingEmp, setIsAddingEmp] = useState(false);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpForm.name || !newEmpForm.phone) {
      alert('Vui lòng điền họ tên và số điện thoại nhân sự');
      return;
    }
    setIsAddingEmp(true);
    try {
      const res = await authApi.addEmployee(newEmpForm);
      alert(res.message || 'Thêm nhân viên thành công!');
      setShowAddEmpModal(false);
      setNewEmpForm({ name: '', phone: '', birthYear: 1992, gender: 'Nữ' });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thêm nhân sự');
    } finally {
      setIsAddingEmp(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Đội ngũ nhân sự trực thuộc Doanh nghiệp</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách nhân sự để chỉ định vào các ca dịch vụ trên sàn
          </p>
        </div>
        <button
          onClick={() => setShowAddEmpModal(true)}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Chưa có nhân viên nào. Hãy bấm "Thêm nhân viên" để bắt đầu nhận việc.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm shrink-0">
                {emp.name?.slice(0, 2).toUpperCase() || 'NV'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">{emp.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{emp.phone || '090...'}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>Năm sinh: {emp.birthYear || '1990'}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-emerald-600 font-semibold">{emp.status || 'AVAILABLE'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal thêm nhân viên */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Thêm nhân sự mới</h3>
              <button
                onClick={() => setShowAddEmpModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Thị Mai"
                  value={newEmpForm.name}
                  onChange={(e) => setNewEmpForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
                  value={newEmpForm.phone}
                  onChange={(e) => setNewEmpForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Năm sinh</label>
                  <input
                    type="number"
                    min="1960"
                    max="2008"
                    value={newEmpForm.birthYear}
                    onChange={(e) => setNewEmpForm((prev) => ({ ...prev, birthYear: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={newEmpForm.gender}
                    onChange={(e) => setNewEmpForm((prev) => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isAddingEmp}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isAddingEmp ? 'Đang lưu...' : 'Lưu nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesTab;

