import React from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function ConfirmSubmitModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  answered = 37, 
  total = 40, 
  unanswered = 3, 
  flagged = 2, 
  timeLeft = "08:35" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-[420px] bg-white rounded-[16px] shadow-2xl p-6 border border-[#E2E8F0]">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-[#0F172A]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#06B6D4]">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        <h3 className="text-base font-bold text-center text-[#0F172A] mb-4">
          Xác nhận nộp bài thi?
        </h3>

        <div className="bg-slate-50 p-4 rounded-[8px] space-y-2.5 text-xs mb-4">
          <div className="flex justify-between text-[#475569]">
            <span>Câu đã làm:</span>
            <span className="font-bold text-[#10B981]">{answered} / {total} câu</span>
          </div>
          <div className="flex justify-between text-[#475569]">
            <span>Câu chưa làm:</span>
            <span className="font-bold text-[#EF4444]">{unanswered} câu</span>
          </div>
          <div className="flex justify-between text-[#475569]">
            <span>Câu đang gắn cờ review:</span>
            <span className="font-bold text-[#F59E0B]">{flagged} câu</span>
          </div>
        </div>

        <p className="text-xs text-center text-[#475569] mb-6">
          Thời gian làm bài còn lại <span className="font-bold text-[#0F172A]">{timeLeft}</span>. Bạn có chắc chắn muốn kết thúc bài thi ngay bây giờ?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors"
          >
            Tiếp tục làm bài
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 py-2.5 bg-[#EF4444] hover:bg-red-600 text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm"
          >
            Xác nhận nộp bài
          </button>
        </div>
      </div>
    </div>
  );
}