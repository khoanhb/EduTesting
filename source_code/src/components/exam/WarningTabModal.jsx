import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function WarningTabModal({ isOpen, violationCount = 1, onContinue }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-[440px] bg-white rounded-[16px] shadow-2xl p-6 border border-[#E2E8F0] text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-[#F59E0B] mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[#0F172A] mb-2">
          Cảnh báo: Bạn vừa rời khỏi màn hình thi!
        </h3>
        <p className="text-xs text-[#475569] leading-relaxed mb-4">
          Hệ thống phát hiện bạn vừa chuyển tab hoặc thu nhỏ trình duyệt. Hành vi này đã được ghi nhận tự động vào nhật ký giám thị.
        </p>

        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-[8px] text-xs font-semibold text-[#D97706] mb-6">
          Số lần vi phạm: {violationCount}/3 lần (Vi phạm lần 3 bài thi sẽ tự động khóa và nộp).
        </div>

        <button
          onClick={onContinue}
          className="w-full py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm"
        >
          Tôi đã hiểu và quay lại làm bài
        </button>
      </div>
    </div>
  );
}