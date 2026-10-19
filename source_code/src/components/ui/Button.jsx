import React from 'react';
import { Loader2 } from 'lucide-react';
import cn from '../../utils/cn';
import { getTone } from './tone';

/**
 * Nút bấm chuẩn của EduTesting - quy chuẩn design-system.md §2.2:
 *  - solid   : hành động chính (nền đặc, chữ trắng, bo góc 8px)
 *  - soft    : nhãn/nút phụ cùng tông (nền nhạt, chữ đậm) - dùng cho nút "Đánh dấu"
 *  - outline : viền mảnh trên nền trắng - nút thứ cấp / quay lại
 *  - ghost   : không nền, chỉ đổi màu khi hover - nút trong bảng, thanh công cụ
 *
 * Trạng thái vô hiệu hóa dùng token `disabled` (#F1F5F9) + chữ `textMuted` (#94A3B8),
 * bỏ hoàn toàn hiệu ứng hover.
 */

const SIZES = {
  xs: 'h-8 px-2.5 text-[11px] gap-1.5',
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

const ICON_SIZES = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4 h-4',
};

const VARIANTS = {
  solid: (tone) => tone.solid,
  soft: (tone) => tone.soft,
  outline: (tone) => tone.outline,
  ghost: (tone) => `bg-transparent ${tone.text} hover:bg-canvas`,
};

const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'solid',
    tone = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    fullWidth = false,
    className,
    disabled = false,
    type = 'button',
    ...rest
  },
  ref
) {
  const toneTokens = getTone(tone);
  const variantClass = (VARIANTS[variant] || VARIANTS.solid)(toneTokens);
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-btn font-semibold select-none',
        'transition-colors duration-150 whitespace-nowrap',
        'focus:outline-none focus-visible:shadow-focus',
        SIZES[size] || SIZES.md,
        variantClass,
        fullWidth && 'w-full',
        isDisabled &&
          'bg-disabled text-textMuted border border-borderLine shadow-none hover:bg-disabled active:bg-disabled',
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className={cn(ICON_SIZES[size], 'animate-spin shrink-0')} aria-hidden="true" />
      ) : (
        Icon && <Icon className={cn(ICON_SIZES[size], 'shrink-0')} aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight className={cn(ICON_SIZES[size], 'shrink-0')} aria-hidden="true" />
      )}
    </button>
  );
});

export default Button;
