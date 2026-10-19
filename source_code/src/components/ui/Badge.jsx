import React from 'react';
import cn from '../../utils/cn';
import { getTone } from './tone';

/**
 * Nhãn phân loại / trạng thái - dùng cho:
 *  - Trạng thái ca thi: SẮP DIỄN RA / ĐANG MỞ / ĐÃ ĐÓNG
 *  - Nhãn loại phòng thi (ONLINE / LAB), độ khó, kết quả ĐÚNG/SAI
 *  - Badge 'SYSTEM ADMIN', 'Đình chỉ thi', số lượng vi phạm
 *
 * variant:
 *  - soft    : nền nhạt, chữ đậm cùng tông (mặc định - dùng nhiều nhất)
 *  - solid   : nền đặc, chữ trắng (nhãn nhấn mạnh)
 *  - outline : viền mảnh, nền trắng
 *
 * Có thể truyền `dot` để hiện chấm tròn trạng thái, hoặc `icon` để thay chấm tròn.
 */

const SIZES = {
  sm: 'h-5 px-2 text-[10px] gap-1',
  md: 'h-6 px-2.5 text-[11px] gap-1.5',
  lg: 'h-7 px-3 text-xs gap-1.5',
};

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-3.5 h-3.5',
};

const VARIANTS = {
  soft: (tone) => tone.soft,
  solid: (tone) => tone.solid,
  outline: (tone) => `border bg-white ${tone.border} ${tone.text}`,
};

export default function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  icon: Icon,
  dot = false,
  className,
}) {
  const toneTokens = getTone(tone);
  const variantClass = (VARIANTS[variant] || VARIANTS.soft)(toneTokens);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-badge font-semibold whitespace-nowrap',
        SIZES[size] || SIZES.md,
        variantClass,
        className
      )}
    >
      {Icon && <Icon className={cn(ICON_SIZES[size], 'shrink-0')} aria-hidden="true" />}
      {!Icon && dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', toneTokens.dot)} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}