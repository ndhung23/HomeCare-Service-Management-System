import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* Dãy số trang hiển thị, rút gọn bằng dấu … khi có nhiều trang */
const buildPageItems = (page, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push('…l');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < totalPages - 1) items.push('…r');
  items.push(totalPages);

  return items;
};

const BTN_BASE =
  'flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed';

/**
 * Phân trang dùng chung cho danh sách dịch vụ / người giúp việc.
 */
const Pagination = ({
  page = 1,
  pageSize = 9,
  totalItems = 0,
  itemLabel = 'mục',
  onPageChange,
  className = '',
}) => {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const items = buildPageItems(page, totalPages);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 bg-white rounded-2xl border border-slate-100 shadow-xs px-4 py-3 ${className}`}
    >
      <p className="text-[11px] text-slate-500">
        Hiển thị <span className="font-bold text-slate-700">{start}</span>–
        <span className="font-bold text-slate-700">{end}</span> trên tổng{' '}
        <span className="font-bold text-slate-700">{totalItems}</span> {itemLabel} • Trang{' '}
        <span className="font-bold text-slate-700">{page}</span>/{totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Trang trước"
          className={`${BTN_BASE} border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {items.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`${BTN_BASE} ${
                item === page
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="px-1 text-xs text-slate-400">
              …
            </span>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Trang sau"
          className={`${BTN_BASE} border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600`}
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
