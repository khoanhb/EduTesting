import React from 'react';
import { Lock } from 'lucide-react';

export default function SuspendModal({ isOpen, onLeave }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl p-8 border border-[#E2E8F0] text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-[#EF4444] mx-auto mb-5">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-[#0F172A] mb-2">
          Bài thi đã bị đình chỉ!
        </h3>
        <p className="text-xs text-[#475569] leading-relaxed mb-6">
          Bạn đã rời khỏi màn hình làm bài quá 3 lần quy định. Hệ thống đã tự động thu bài và gửi báo cáo vi phạm đến Giám thị.
        </p>

        <button
          onClick={onLeave}
          className="w-full py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-bold rounded-[8px] transition-colors shadow-sm cursor-pointer"
        >
          Rời phòng thi
        </button>
      </div>
    </div>
  );
}
