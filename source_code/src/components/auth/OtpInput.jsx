import React, { useEffect, useMemo, useRef } from 'react';
import cn from '../../utils/cn';

/**
 * Ô nhập mã OTP nhiều chữ số - dùng cho M.04 (Khôi phục mật khẩu).
 *
 * Hành vi:
 *  - Gõ một số tự nhảy sang ô kế tiếp
 *  - Backspace ở ô trống lùi về ô trước
 *  - Dán (Ctrl+V) cả dãy mã sẽ tự trải ra các ô
 *  - Mũi tên trái/phải di chuyển giữa các ô
 *
 * Giá trị trao đổi ra ngoài là một chuỗi (ví dụ "482913"), không phải mảng.
 */

export default function OtpInput({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  autoFocus = false,
  hasError = false,
}) {
  const inputRefs = useRef([]);

  // Chuỗi bên ngoài được trải thành mảng cố định `length` phần tử.
  const digits = useMemo(() => {
    const chars = (value || '').split('');
    return Array.from({ length }, (_, index) => chars[index] || '');
  }, [value, length]);

  useEffect(() => {
    if (autoFocus) {
      const timer = window.setTimeout(() => inputRefs.current[0]?.focus(), 60);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus]);

  function emitChange(nextDigits) {
    onChange?.(nextDigits.join('').slice(0, length));
  }

  function focusAt(index) {
    const target = Math.max(0, Math.min(index, length - 1));
    inputRefs.current[target]?.focus();
    inputRefs.current[target]?.select?.();
  }

  function handleChange(index, rawValue) {
    const typed = rawValue.replace(/\D/g, '');
    if (!typed) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      emitChange(nextDigits);
      return;
    }

    const nextDigits = [...digits];

    // Người dùng dán nhiều số vào một ô và trải dần sang các ô phía sau.
    if (typed.length > 1) {
      typed
        .slice(0, length - index)
        .split('')
        .forEach((char, offset) => {
          nextDigits[index + offset] = char;
        });
      emitChange(nextDigits);
      focusAt(index + typed.length);
      return;
    }

    nextDigits[index] = typed;
    emitChange(nextDigits);
    if (index < length - 1) focusAt(index + 1);
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace') {
      if (digits[index]) return; // để onChange xoá ký tự hiện tại
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index - 1] = '';
      emitChange(nextDigits);
      focusAt(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  function handlePaste(index, event) {
    const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '');
    if (!pasted) return;

    event.preventDefault();
    const nextDigits = [...digits];
    pasted
      .slice(0, length - index)
      .split('')
      .forEach((char, offset) => {
        nextDigits[index + offset] = char;
      });
    emitChange(nextDigits);
    focusAt(index + pasted.length);
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Mã xác thực OTP">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-label={`Chữ số thứ ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={cn(
            'w-11 h-12 text-center text-base font-bold rounded-btn border transition-all tabular-nums',
            'focus:outline-none focus:border-primary focus:shadow-focus',
            disabled
              ? 'bg-disabled text-textMuted border-borderLine cursor-not-allowed'
              : hasError
                ? 'bg-danger-light/40 border-danger text-textMain'
                : 'bg-white border-borderLine text-textMain'
          )}
        />
      ))}
    </div>
  );
}
