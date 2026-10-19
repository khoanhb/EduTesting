import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cn from '../../utils/cn';
import Toast from './Toast';
import ToastContext from '../../contexts/ToastContext';

/**
 * Nhà cung cấp thông báo toàn cục, bọc toàn bộ ứng dụng trong main.jsx.
 *
 * Thay thế cho các `alert()` rải rác và cho ToastNotification cũ (chỉ hiện một
 * thông báo, không tự ẩn, không xếp chồng). Toàn bộ trang dùng qua hook `useToast`:
 *
 *   const toast = useToast();
 *   toast.success('Cập nhật thành công!');
 *   toast.error('Mã số định danh hoặc mật khẩu không chính xác.');
 *
 * Đặc điểm:
 *  - Tự ẩn sau `duration` (mặc định 4000ms), đặt duration = 0 để giữ cố định.
 *  - Xếp chồng tối đa `maxVisible` thẻ, thẻ cũ nhất tự bị đẩy ra.
 *  - Hiển thị qua portal nên không bị ảnh hưởng bởi overflow/transform của trang.
 */

const DEFAULT_DURATION = 4000;

const POSITIONS = {
  'top-right': 'top-5 right-5 items-end',
  'top-left': 'top-5 left-5 items-start',
  'top-center': 'top-5 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-5 right-5 items-end',
  'bottom-left': 'bottom-5 left-5 items-start',
};

export default function ToastProvider({
  children,
  maxVisible = 4,
  position = 'top-right',
  defaultDuration = DEFAULT_DURATION,
}) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const counterRef = useRef(0);

  // Dọn toàn bộ hẹn giờ khi provider bị gỡ khỏi cây React.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const clear = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const push = useCallback(
    (options = {}) => {
      const id = (counterRef.current += 1);
      const duration = options.duration ?? defaultDuration;

      const entry = {
        type: 'info',
        title: undefined,
        message: undefined,
        action: undefined,
        ...options,
        id,
      };

      setToasts((previous) => {
        const next = [...previous, entry];
        // Giữ tối đa `maxVisible` thẻ, loại bỏ thẻ cũ nhất khi vượt ngưỡng.
        const overflow = next.slice(0, Math.max(0, next.length - maxVisible));
        overflow.forEach((toast) => {
          const timer = timersRef.current.get(toast.id);
          if (timer) {
            window.clearTimeout(timer);
            timersRef.current.delete(toast.id);
          }
        });
        return next.slice(-maxVisible);
      });

      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, dismiss, maxVisible]
  );

  const toastApi = useMemo(
    () => ({
      push,
      dismiss,
      clear,
      success: (message, options) => push({ ...options, type: 'success', message }),
      error: (message, options) => push({ ...options, type: 'error', message }),
      warning: (message, options) => push({ ...options, type: 'warning', message }),
      info: (message, options) => push({ ...options, type: 'info', message }),
    }),
    [push, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={toastApi}>
      {children}

      {toasts.length > 0 &&
        createPortal(
          <div
            role="region"
            aria-label="Thông báo hệ thống"
            className={cn(
              'fixed z-toast flex flex-col gap-3 pointer-events-none',
              POSITIONS[position] || POSITIONS['top-right']
            )}
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <Toast
                  type={toast.type}
                  title={toast.title}
                  message={toast.message}
                  action={toast.action}
                  onDismiss={() => dismiss(toast.id)}
                />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
