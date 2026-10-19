import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import cn from '../../utils/cn';
import { getTone } from './tone';
import IconButton from './IconButton';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import useEscapeKey from '../../hooks/useEscapeKey';

/**
 * Khung Modal nền tảng của EduTesting - quy chuẩn design-system.md §2.5:
 *  - Nền che phủ: đen mờ 50% + làm mờ nhẹ (bg-black/50 backdrop-blur-sm)
 *  - Hiệu ứng xuất hiện: fade-in mượt mà
 *  - Có icon dấu X ở góc trên bên phải thì KHÔNG dùng nút "Đóng" ở chân modal
 *  - Chân modal chỉ chứa nút thao tác chính
 *
 * Mọi modal nghiệp vụ (M.01 đến M.19) đều dựng trên khung này để thống nhất
 * hành vi: khóa cuộn nền, đóng bằng Escape, đóng khi bấm nền, trả focus về nơi cũ.
 */

const SIZES = {
  sm: 'max-w-[400px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[680px]',
  xl: 'max-w-[880px]',
  '2xl': 'max-w-[1080px]',
  full: 'max-w-[min(1280px,95vw)]',
};

const ICON_WRAPPER_SIZES = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  tone = 'primary',
  size = 'md',
  children,
  footer,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useBodyScrollLock(isOpen);
  useEscapeKey(() => onClose?.(), isOpen && closeOnEscape);

  // Ghi nhớ phần tử đang focus để trả lại khi đóng modal.
  useEffect(() => {
    if (!isOpen) return undefined;
    previouslyFocusedRef.current = document.activeElement;
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  // Đưa focus vào hộp thoại để thao tác bàn phím không rơi ra ngoài modal.
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const toneTokens = getTone(tone);

  function handleBackdropMouseDown(event) {
    if (!closeOnBackdrop) return;
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      onClose?.();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-white rounded-modal shadow-overlay border border-borderLine',
          'flex flex-col max-h-[92vh] animate-scale-in focus:outline-none',
          SIZES[size] || SIZES.md,
          className
        )}
      >
        {showCloseButton && (
          <IconButton
            icon={X}
            label="Đóng hộp thoại"
            onClick={onClose}
            variant="ghost"
            tone="neutral"
            size="sm"
            className="absolute top-4 right-4 z-10"
          />
        )}

        {(title || description || Icon) && (
          <div className={cn('px-6 pt-6 pb-4 md:px-8', showCloseButton && 'pr-14', headerClassName)}>
            {Icon && (
              <div className="flex justify-center mb-4">
                <div
                  className={cn(
                    'rounded-full flex items-center justify-center',
                    ICON_WRAPPER_SIZES[size] || ICON_WRAPPER_SIZES.md,
                    toneTokens.surface,
                    toneTokens.text
                  )}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
              </div>
            )}

            {title && (
              <h2
                className={cn(
                  'text-base font-bold text-textMain leading-snug',
                  Icon && 'text-center',
                  description && 'mb-1.5'
                )}
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                className={cn(
                  'text-xs text-textSub leading-relaxed',
                  Icon && 'text-center'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {children && (
          <div
            className={cn(
              'px-6 md:px-8 pb-6 overflow-y-auto flex-1',
              !title && !description && !Icon && 'pt-6',
              bodyClassName
            )}
          >
            {children}
          </div>
        )}

        {footer && (
          <div
            className={cn(
              'px-6 md:px-8 pb-6 pt-4 border-t border-borderLine flex gap-3 shrink-0',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
