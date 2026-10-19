import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import cn from '../../utils/cn';

/**
 * Ô nhập liệu chuẩn - quy chuẩn design-system.md §2.1, §2.2, §1.2:
 *  - Bo góc 8px, viền #E2E8F0, focus đổi sang màu thương hiệu
 *  - Ô vô hiệu hóa / chỉ đọc: nền #F1F5F9, chữ #94A3B8, cursor-not-allowed
 *  - Trạng thái lỗi: viền đỏ #EF4444 + nền hồng nhạt + dòng thông báo lỗi
 *
 * Hỗ trợ sẵn: icon bên trái, nút hiện/ẩn mật khẩu, hậu tố đơn vị, gợi ý dưới ô.
 */

const SIZES = {
  sm: { field: 'h-9 text-xs', padLeft: 'pl-8', padRight: 'pr-8', iconLeft: 'pl-2.5', iconRight: 'pr-2.5' },
  md: { field: 'h-10 text-sm', padLeft: 'pl-10', padRight: 'pr-10', iconLeft: 'pl-3.5', iconRight: 'pr-3.5' },
  lg: { field: 'h-11 text-sm', padLeft: 'pl-11', padRight: 'pr-11', iconLeft: 'pl-4', iconRight: 'pr-4' },
};

const ICON_SIZES = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-4 h-4' };
const ICON_OFFSETS = { sm: 'left-2.5', md: 'left-3.5', lg: 'left-4' };
const AFFIX_OFFSETS = { sm: 'right-2.5', md: 'right-3.5', lg: 'right-4' };

const Input = React.forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    icon: Icon,
    suffix,
    error,
    hint,
    required = false,
    disabled = false,
    size = 'md',
    className,
    containerClassName,
    value,
    onChange,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && isPasswordVisible ? 'text' : type;

  const sizeTokens = SIZES[size] || SIZES.md;
  const hasError = Boolean(error);

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-textMain mb-1.5">
          {label}
          {required && (
            <span className="text-danger ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <span
            className={cn(
              'absolute inset-y-0 flex items-center pointer-events-none',
              ICON_OFFSETS[size] || ICON_OFFSETS.md,
              disabled ? 'text-textMuted' : 'text-textMuted'
            )}
          >
            <Icon className={cn(ICON_SIZES[size], 'shrink-0')} aria-hidden="true" />
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={cn(hasError && errorId, hint && !hasError && hintId) || undefined}
          className={cn(
            'w-full rounded-input border transition-colors focus:outline-none',
            sizeTokens.field,
            Icon ? sizeTokens.padLeft : sizeTokens.iconLeft,
            isPassword || suffix ? sizeTokens.padRight : sizeTokens.iconRight,
            disabled
              ? 'bg-disabled text-textMuted border-borderLine cursor-not-allowed'
              : hasError
                ? 'bg-danger-light/40 border-danger text-textMain focus:border-danger'
                : 'bg-white border-borderLine text-textMain focus:border-primary',
            className
          )}
          {...rest}
        />

        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((previous) => !previous)}
            aria-label={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className={cn(
              'absolute inset-y-0 flex items-center text-textMuted hover:text-textMain transition-colors',
              AFFIX_OFFSETS[size] || AFFIX_OFFSETS.md
            )}
          >
            {isPasswordVisible ? (
              <EyeOff className={cn(ICON_SIZES[size], 'shrink-0')} aria-hidden="true" />
            ) : (
              <Eye className={cn(ICON_SIZES[size], 'shrink-0')} aria-hidden="true" />
            )}
          </button>
        )}

        {suffix && !isPassword && (
          <span
            className={cn(
              'absolute inset-y-0 flex items-center text-xs font-medium text-textMuted pointer-events-none',
              AFFIX_OFFSETS[size] || AFFIX_OFFSETS.md
            )}
          >
            {suffix}
          </span>
        )}
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}

      {hint && !hasError && (
        <p id={hintId} className="mt-1.5 text-[11px] text-textMuted leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
