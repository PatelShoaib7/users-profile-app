import { useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeToast } from '../../store/slices/uiSlice';

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const variants = {
    success: {
      wrapper: 'bg-white border-emerald-200 text-slate-800',
      icon: <FiCheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />,
    },
    error: {
      wrapper: 'bg-white border-rose-200 text-slate-800',
      icon: <FiAlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
    },
    info: {
      wrapper: 'bg-white border-brand-200 text-slate-800',
      icon: <FiInfo className="h-5 w-5 text-brand-600 shrink-0" />,
    },
  };

  const style = variants[toast.type] || variants.info;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full pointer-events-auto ${style.wrapper}`}
    >
      {style.icon}
      <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={(id) => dispatch(removeToast(id))}
        />
      ))}
    </div>
  );
};
