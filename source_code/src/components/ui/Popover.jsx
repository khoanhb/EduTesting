import React, { useRef, useState } from 'react';
import cn from '../../utils/cn';
import useClickOutside from '../../hooks/useClickOutside';
import useEscapeKey from '../../hooks/useEscapeKey';

/**
 * Bảng nổi neo vào một phần tử kích hoạt - dùng cho:
 *  - Popover chuông thông báo (Sinh viên / Giảng viên / Quản trị)
 *  - Menu cá nhân ở góc phải thanh trên cùng
 *  - Bộ lọc nâng cao, menu ngữ cảnh trên bảng dữ liệu
 *
 * `trigger` là hàm nhận ({ isOpen, toggle, close }) và trả về phần tử bấm được.
 * Đóng khi bấm ra ngoài hoặc nhấn Escape.
 */

const ALIGNMENTS = {
  left: 'left-0',
  right: 'right-0',
  center: 'left-1/2 -translate-x-1/2',
};

const WIDTHS = {
  auto: '',
  sm: 'w-56',
  md: 'w-64',
  lg: 'w-80',
};

export default function Popover({
  trigger,
  children,
  align = 'right',
  width = 'lg',
  panelClassName,
  className,
  closeOnEscape = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen && closeOnEscape);

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((previous) => !previous);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {trigger({ isOpen, toggle, close })}

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 z-popover bg-white rounded-widget border border-borderLine',
            'shadow-popover overflow-hidden animate-fade-in',
            ALIGNMENTS[align] || ALIGNMENTS.right,
            WIDTHS[width] ?? WIDTHS.lg,
            panelClassName
          )}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
