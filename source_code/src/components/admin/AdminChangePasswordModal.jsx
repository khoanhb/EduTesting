import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminChangePasswordModal({ isOpen, onClose, onSuccess }) {
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSuccess?.('Đổi mật khẩu quản trị thành công!');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
        <div className="relative w-full max-w-[420px] bg-white rounded-card shadow-2xl p-6 md:p-8 border border-borderLine">
            <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-textMuted hover:text-textMain transition-colors"
            >
            <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-textMain mb-6">Đổi mật khẩu quản trị</h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
                <label className="block font-semibold text-textMain mb-1.5">Mật khẩu hiện tại</label>
                <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
                    <Lock className="w-4 h-4" />
                </span>
                <input 
                    type={showCurrent ? "text" : "password"}
                    required
                    placeholder="Tối thiểu 8 ký tự"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 border border-borderLine rounded-btn focus:outline-none focus:border-admin transition-colors"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textMain">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                </div>
            </div>

            <div>
                <label className="block font-semibold text-textMain mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
                    <Lock className="w-4 h-4" />
                </span>
                <input 
                    type={showNew ? "text" : "password"}
                    required
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 border border-borderLine rounded-btn focus:outline-none focus:border-admin transition-colors"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textMain">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                </div>
            </div>

            <div>
                <label className="block font-semibold text-textMain mb-1.5">Xác nhận mật khẩu mới</label>
                <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
                    <Lock className="w-4 h-4" />
                </span>
                <input 
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 border border-borderLine rounded-btn focus:outline-none focus:border-admin transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textMain">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                </div>
            </div>

            <div className="flex gap-3 pt-3">
                <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-borderLine text-textSub font-semibold rounded-btn hover:bg-slate-50 transition-colors"
                >
                Hủy bỏ
                </button>
                <button
                type="submit"
                className="flex-1 py-2.5 bg-admin hover:bg-admin-hover text-white font-semibold rounded-btn transition-colors shadow-sm"
                >
                Đổi mật khẩu
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}