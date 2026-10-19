import React from 'react';
import cn from '../../utils/cn';
import { getTone } from './tone';

/**
 * Nút chỉ có biểu tượng (icon-only) - dùng cho nút đóng modal, nút thao tác
 * trong bảng, nút toggle sidebar, nút làm mới dữ liệu.
 *
 * Bắt buộc truyền `label` để tạo aria-label cho trình đọc màn hình và title khi hover.
 */

const SIZES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
};

const ICON_SIZES = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const VARIANTS = {
  ghost: (tone) => `bg-transparent ${tone.text} hover:bg-canvas`,
  soft: (tone) => tone.soft,
  solid: (tone) => tone.solid,
  outline: (tone) => tone.outline,
};

const IconButton = React.forwardRef(function IconButton(
  {
    icon: Icon,
    label,
    variant = 'ghost',
    tone = 'neutral',
    size = 'md',
    className,
    type = 'button',
    disabled = false,
    ...rest
  },
  ref
) {
  const toneTokens = getTone(tone);
  const variantClass = (VARIANTS[variant] || VARIANTS.ghost)(toneTokens);

  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-btn shrink-0',
        'transition-colors duration-150 focus:outline-none focus-visible:shadow-focus',
        SIZES[size] || SIZES.md,
        variantClass,
        disabled && 'bg-disabled text-textMuted hover:bg-disabled',
        className
      )}
      {...rest}
    >
      <Icon className={cn(ICON_SIZES[size], 'shrink-0')} aria-hidden="true" />
    </button>
  );
});

export default IconButton;
