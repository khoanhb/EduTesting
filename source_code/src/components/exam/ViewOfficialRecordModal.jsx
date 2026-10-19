import React from 'react';
import { User, X } from 'lucide-react';

export default function ViewOfficialRecordModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="bg-white rounded-[24px] shadow-2xl p-6 md:p-8 max-w-3xl w-full border border-[#E2E8F0] relative">
        {/* NÚT X ĐÓNG GÓC TRÊN */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-[#0F172A] mb-5">
          Lập biên bản vi phạm quy chế thi
        </h3>

        {/* Thông tin sinh viên & ca thi: Không dùng truncate, hiển thị trọn vẹn */}
        <div className="text-xs mb-5">
          <span className="font-semibold text-[#475569] block mb-2">Thông tin sinh viên & ca thi:</span>
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
              <div className="flex items-center gap-3 pt-1 md:pt-0">
                <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#06B6D4] shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-[#94A3B8]">Thí sinh</div>
                  <div className="font-bold text-[#0F172A] whitespace-nowrap">{record.studentName}</div>
                </div>
              </div>

              <div className="pt-2 md:pt-0 md:pl-4">
                <div className="text-[10px] text-[#94A3B8]">Mã số sinh viên</div>
                <div className="font-bold text-[#0F172A]">{record.studentId}</div>
              </div>

              <div className="pt-2 md:pt-0 md:pl-4">
                <div className="text-[10px] text-[#94A3B8]">Kỳ thi</div>
                <div className="font-bold text-[#0F172A] whitespace-nowrap">{record.examCode}</div>
              </div>

              <div className="pt-2 md:pt-0 md:pl-4">
                <div className="text-[10px] text-[#94A3B8]">Mã đề thi</div>
                <div className="font-bold text-[#0F172A]">{record.testCode}</div>
              </div>

              <div className="pt-2 md:pt-0 md:pl-4">
                <div className="text-[10px] text-[#94A3B8]">Phòng thi</div>
                <div className="font-bold text-[#0F172A]">{record.room}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hành vi phát hiện tự động */}
        <div className="text-xs mb-4">
          <span className="font-semibold text-[#475569] block mb-1.5">Hành vi phát hiện tự động:</span>
          <div className="p-3 bg-red-50 text-[#EF4444] rounded-[8px] border border-red-200 font-semibold leading-relaxed">
            {record.behavior}
          </div>
        </div>

        {/* Hình thức đề xuất xử lý */}
        <div className="text-xs mb-4">
          <span className="font-semibold text-[#475569] block mb-1.5">Hình thức đề xuất xử lý:</span>
          <input 
            type="text" 
            disabled 
            value={record.penalty} 
            className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-[8px] bg-slate-50 text-[#475569] font-medium cursor-not-allowed"
          />
        </div>

        {/* Mô tả chi tiết vi phạm */}
        <div className="text-xs">
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-[12px] space-y-1.5">
            <span className="font-bold text-[#0F172A] block">Mô tả chi tiết vi phạm:</span>
            <p className="text-[#475569] leading-relaxed">
              {record.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}