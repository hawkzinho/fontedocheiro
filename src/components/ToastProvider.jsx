import { createContext, useContext, useState } from 'react';

const ToastContext = createContext(null);

const TONE_CLASSES = {
  success: 'border-emerald-200 bg-white text-ink',
  error: 'border-rose-200 bg-white text-ink',
  neutral: 'border-line bg-white text-ink',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = ({ title, description, tone = 'neutral' }) => {
    const id = crypto.randomUUID();

    setToasts((current) => [...current, { id, title, description, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-5 z-[80] flex justify-center px-4 sm:justify-end sm:px-8">
        <div className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-hush ${TONE_CLASSES[toast.tone] || TONE_CLASSES.neutral}`}
            >
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-slate">{toast.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.');
  }

  return context;
}
