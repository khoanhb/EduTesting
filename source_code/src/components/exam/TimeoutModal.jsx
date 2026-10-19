import React from 'react';
import { Clock } from 'lucide-react';

export default function TimeoutModal({ isOpen, onDirectToResult }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-[420px] bg-white rounded-[16px] shadow-2xl p-6 border border-[#E2E8F0] text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[#EF4444] mx-auto mb-4 animate-pulse">
          <Clock className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[#0F172A] mb-2">
          Đã hết thời gian làm bài!
        </h3>
        <p className="text-xs text-[#475569] leading-relaxed mb-6">
          Thời gian làm bài đã về 00:00. Hệ thống đang tiến hành khóa giao diện và tự động nộp bài làm của bạn...
        </p>

        <button
          onClick={onDirectToResult}
          className="w-full py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm"
        >
          Xem kết quả bài thi
        </button>
      </div>
    </div>
  );
}