import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDeleteModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Xác nhận xóa dữ liệu?", 
    description = "Dữ liệu này sẽ bị gỡ bỏ vĩnh viễn và không thể khôi phục lại. Bạn có chắc chắn muốn tiếp tục?" 
    }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
        <div className="relative w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl p-6 border border-[#E2E8F0]">
            <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
            >
            <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[#EF4444]">
                <AlertTriangle className="w-6 h-6" />
            </div>
            </div>

            <h3 className="text-base font-bold text-center text-[#0F172A] mb-2">
            {title}
            </h3>
            <p className="text-xs text-center text-[#475569] leading-relaxed mb-6">
            {description}
            </p>

            <div className="flex gap-3">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors"
            >
                Đóng
            </button>
            <button
                type="button"
                onClick={() => { onConfirm(); onClose(); }}
                className="flex-1 py-2.5 bg-[#EF4444] hover:bg-red-600 text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm"
            >
                Xóa vĩnh viễn
            </button>
            </div>
        </div>
        </div>
    );
}