import { useCallback, useMemo, useRef, useState } from 'react';

import ToastContext from './toast-context';

const EXIT_ANIMATION_MS = 260;
const MAX_TOASTS = 3;

const buildToast = ({ message, type = 'info', duration = 3500 }) => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  message,
  type,
  duration,
  isLeaving: false,
});

const toastSignature = (toast) => `${toast.type}::${toast.message}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const dismissTimersRef = useRef(new Map());

  const clearDismissTimer = useCallback((toastId) => {
    const timerId = dismissTimersRef.current.get(toastId);
    if (timerId) {
      window.clearTimeout(timerId);
      dismissTimersRef.current.delete(toastId);
    }
  }, []);

  const removeToast = useCallback(
    (toastId) => {
      clearDismissTimer(toastId);
      setToasts((prev) => {
        const exists = prev.some((toast) => toast.id === toastId);
        if (!exists) return prev;

        const next = prev.map((toast) =>
          toast.id === toastId ? { ...toast, isLeaving: true } : toast,
        );

        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== toastId));
        }, EXIT_ANIMATION_MS);

        return next;
      });
    },
    [clearDismissTimer],
  );

  const showToast = useCallback(
    ({ message, type = 'info', duration = 3500 }) => {
      if (!message) return;

      const nextToast = buildToast({ message, type, duration });
      const nextSignature = toastSignature(nextToast);
      let inserted = false;
      const timersToClear = [];

      setToasts((prev) => {
        const duplicateVisible = prev.some(
          (toast) => !toast.isLeaving && toastSignature(toast) === nextSignature,
        );

        if (duplicateVisible) {
          return prev;
        }

        inserted = true;
        const visible = prev.filter((toast) => !toast.isLeaving);

        if (visible.length >= MAX_TOASTS) {
          const overflowCount = visible.length - MAX_TOASTS + 1;
          const toDrop = visible.slice(0, overflowCount);
          toDrop.forEach((toast) => timersToClear.push(toast.id));

          const toDropIds = new Set(toDrop.map((toast) => toast.id));
          const kept = prev.filter((toast) => !toDropIds.has(toast.id));
          return [...kept, nextToast];
        }

        return [...prev, nextToast];
      });

      timersToClear.forEach((toastId) => clearDismissTimer(toastId));

      if (!inserted) return;

      const timerId = window.setTimeout(() => {
        removeToast(nextToast.id);
      }, duration);

      dismissTimersRef.current.set(nextToast.id, timerId);
    },
    [clearDismissTimer, removeToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      removeToast,
    }),
    [toasts, showToast, removeToast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
