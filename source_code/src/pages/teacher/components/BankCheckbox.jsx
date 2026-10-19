import React from 'react';
import { Check } from 'lucide-react';

/**
 * Checkbox tuỳ biến của Ngân hàng câu hỏi (2.1): khi được chọn hiển thị dấu tick
 * màu trắng trên nền Primary Cyan (#06B6D4), đồng bộ với bảng ở Ma trận đề thi.
 */
export default function BankCheckbox({ checked, onChange, ariaLabel }) {
  return (
    <label className="inline-flex items-center justify-center cursor-pointer select-none">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <span
        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[#06B6D4] border-[#06B6D4]'
            : 'bg-white border-[#CBD5E1] hover:border-[#06B6D4]'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
    </label>
  );
}
