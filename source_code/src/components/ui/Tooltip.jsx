import React, { useRef, useState } from 'react';
import cn from '../../utils/cn';

/**
 * Chú thích khi hover dùng cho:
 *  - Tooltip giải thích các chỉ số biểu đồ (2.0 Dashboard, 2.6 Thống kê)
 *  - Tooltip nhãn menu khi thanh bên thu gọn (w-20)
 *  - Giải thích các con số KPI, công thức tính điểm
 *
 * Hoạt động cả khi hover chuột và khi focus bằng bàn phím (a11y).
 */

const PLACEMENTS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const ARROWS = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-[#0F172A] border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#0F172A] border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-[#0F172A] border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-[#0F172A] border-y-transparent border-l-transparent',
};

export default function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 120,
  className,
  contentClassName,
  disabled = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  if (!content || disabled) return children;

  function show() {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), delay);
  }

  function hide() {
    window.clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {isVisible && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-tooltip pointer-events-none animate-fade-in',
            PLACEMENTS[placement] || PLACEMENTS.top
          )}
        >
          <span
            className={cn(
              'block max-w-[280px] w-max px-3 py-2 rounded-btn bg-textMain text-white',
              'text-[11px] font-medium leading-relaxed shadow-popover text-center',
              contentClassName
            )}
          >
            {content}
          </span>
          <span
            className={cn(
              'absolute w-0 h-0 border-[5px]',
              ARROWS[placement] || ARROWS.top
            )}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
