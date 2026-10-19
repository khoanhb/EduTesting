import React, { useId } from 'react';
import cn from '../../utils/cn';

/**
 * Vùng nhập văn bản dài - dùng cho soạn câu hỏi, nội dung tự luận,
 * ghi chú biên bản vi phạm, nhận xét của giảng viên.
 *
 * Cùng quy chuẩn với Input: bo góc 8px, viền #E2E8F0, focus màu thương hiệu,
 * ô vô hiệu hóa dùng nền #F1F5F9 + chữ #94A3B8.
 */

export default function Textarea({
  label,
  id,
  error,
  hint,
  required = false,
  disabled = false,
  rows = 4,
  showCounter = false,
  maxLength,
  value = '',
  className,
  containerClassName,
  ...rest
}) {
  const generatedId = useId();
  const textareaId = id || `textarea-${generatedId}`;
  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;
  const hasError = Boolean(error);

  return (
    <div className={cn('w-full', containerClassName)}>
      {(label || (showCounter && maxLength)) && (
        <div className="flex items-end justify-between mb-1.5 gap-3">
          {label && (
            <label htmlFor={textareaId} className="block text-xs font-semibold text-textMain">
              {label}
              {required && (
                <span className="text-danger ml-0.5" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {showCounter && maxLength && (
            <span className="text-[11px] text-textMuted tabular-nums shrink-0">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        value={value}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={hasError || undefined}
        aria-describedby={cn(hasError && errorId, hint && !hasError && hintId) || undefined}
        className={cn(
          'w-full rounded-input border px-3.5 py-2.5 text-sm leading-relaxed transition-colors',
          'focus:outline-none resize-y',
          disabled
            ? 'bg-disabled text-textMuted border-borderLine cursor-not-allowed resize-none'
            : hasError
              ? 'bg-danger-light/40 border-danger text-textMain focus:border-danger'
              : 'bg-white border-borderLine text-textMain focus:border-primary',
          className
        )}
        {...rest}
      />

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
}
