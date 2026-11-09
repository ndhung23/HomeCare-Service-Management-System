import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, HelpCircle } from 'lucide-react';

const ToastContext = createContext(null);

// Global reference so non-React files or legacy callers can trigger toasts
let globalToastRef = null;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState(null); // { type: 'confirm'|'prompt', title, message, ... resolve }

  const promptInputRef = useRef(null);
  const [promptValue, setPromptValue] = useState('');

  // Remove toast by id
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add toast
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = useMemo(() => ({
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  }), [addToast]);

  // Safe window.alert override so any legacy alert() in components turns into a sleek toast
  useEffect(() => {
    globalToastRef = toast;
    const originalAlert = window.alert;

    window.alert = (message) => {
      const msgStr = typeof message === 'object' ? JSON.stringify(message) : String(message);
      // Auto-detect type based on keywords
      const lower = msgStr.toLowerCase();
      if (lower.includes('lỗi') || lower.includes('thất bại') || lower.includes('error') || lower.includes('fail')) {
        toast.error(msgStr);
      } else if (lower.includes('cảnh báo') || lower.includes('chú ý') || lower.includes('warning') || lower.includes('vui lòng')) {
        toast.warning(msgStr);
      } else if (lower.includes('thành công') || lower.includes('hoàn tất') || lower.includes('success')) {
        toast.success(msgStr);
      } else {
        toast.info(msgStr);
      }
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [toast]);

  // Modern Confirm Dialog
  const confirm = useCallback(({
    title = 'Xác nhận thao tác',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    variant = 'primary', // 'primary' | 'danger' | 'warning'
  }) => {
    return new Promise((resolve) => {
      setModalConfig({
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        variant,
        resolve: (result) => {
          setModalConfig(null);
          resolve(result);
        },
      });
    });
  }, []);

  // Modern Prompt Dialog
  const prompt = useCallback(({
    title = 'Nhập thông tin',
    message = 'Vui lòng nhập nội dung bên dưới:',
    placeholder = 'Nhập tại đây...',
    defaultValue = '',
    confirmText = 'Gửi xác nhận',
    cancelText = 'Hủy bỏ',
    required = true,
  }) => {
    setPromptValue(defaultValue);
    return new Promise((resolve) => {
      setModalConfig({
        type: 'prompt',
        title,
        message,
        placeholder,
        confirmText,
        cancelText,
        required,
        resolve: (result) => {
          setModalConfig(null);
          resolve(result);
        },
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast, confirm, prompt }}>
      {children}

      {/* 1. Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((t) => {
          let bgClass = 'bg-white border-slate-200 text-slate-800';
          let IconComp = Info;
          let iconClass = 'text-blue-500';

          if (t.type === 'success') {
            bgClass = 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10';
            IconComp = CheckCircle2;
            iconClass = 'text-emerald-500';
          } else if (t.type === 'error') {
            bgClass = 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10';
            IconComp = AlertCircle;
            iconClass = 'text-rose-500';
          } else if (t.type === 'warning') {
            bgClass = 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10';
            IconComp = AlertTriangle;
            iconClass = 'text-amber-500';
          } else if (t.type === 'info') {
            bgClass = 'bg-white border-blue-200 text-slate-800 shadow-blue-500/10';
            IconComp = Info;
            iconClass = 'text-blue-500';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${bgClass}`}
            >
              <div className="shrink-0 mt-0.5">
                <IconComp className={`w-5 h-5 ${iconClass}`} />
              </div>
              <div className="flex-1 text-xs leading-relaxed font-semibold text-slate-700">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 2. Sleek Modal Dialog for Confirm and Prompt */}
      {modalConfig && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 scale-in-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon + Title */}
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  modalConfig.variant === 'danger'
                    ? 'bg-rose-50 text-rose-600'
                    : modalConfig.variant === 'warning'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                {modalConfig.variant === 'danger' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : modalConfig.variant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : modalConfig.type === 'prompt' ? (
                  <HelpCircle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {modalConfig.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {modalConfig.message}
                </p>
              </div>
            </div>

            {/* If Prompt: input field */}
            {modalConfig.type === 'prompt' && (
              <div className="pt-1">
                <textarea
                  ref={promptInputRef}
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  placeholder={modalConfig.placeholder}
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  autoFocus
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => modalConfig.resolve(modalConfig.type === 'prompt' ? null : false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors"
              >
                {modalConfig.cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (modalConfig.type === 'prompt') {
                    if (modalConfig.required && !promptValue.trim()) {
                      toast.warning('Vui lòng nhập nội dung!');
                      return;
                    }
                    modalConfig.resolve(promptValue.trim());
                  } else {
                    modalConfig.resolve(true);
                  }
                }}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-colors ${
                  modalConfig.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : modalConfig.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Standalone global toast for utility functions
export const globalToast = {
  success: (msg) => globalToastRef?.success(msg),
  error: (msg) => globalToastRef?.error(msg),
  warning: (msg) => globalToastRef?.warning(msg),
  info: (msg) => globalToastRef?.info(msg),
};
