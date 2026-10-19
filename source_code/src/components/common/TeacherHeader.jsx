import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, LogOut } from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';
import { buildTeacherNotifications } from '../../data/shared/mockNotifications';
import { mockCurrentUser } from '../../data/shared/authAccounts';

export default function TeacherHeader({ title = 'Thông tin cá nhân', avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const [notifications, setNotifications] = useState(buildTeacherNotifications);

    const menuRef = useRef(null);
    const notiRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
        if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
        if (notiRef.current && !notiRef.current.contains(e.target)) setIsNotiOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <>
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-40">
            <span className="text-xs text-[#475569] font-medium">{title}</span>

            <div className="flex items-center gap-4">
            <div className="relative" ref={notiRef}>
                <button 
                onClick={() => setIsNotiOpen(!isNotiOpen)}
                className="p-2 text-[#475569] hover:bg-slate-100 rounded-full relative transition-colors cursor-pointer"
                >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
                )}
                </button>

                {/* Popover thông báo 2 dòng */}
                {isNotiOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-[16px] shadow-2xl border border-[#E2E8F0] overflow-hidden z-50 animate-fade-in">
                    <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
                    <span className="text-xs font-bold text-[#0F172A]">THÔNG BÁO GIẢNG VIÊN</span>
                    {unreadCount > 0 && (
                        <button 
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
                        className="text-[11px] text-[#06B6D4] hover:underline font-medium cursor-pointer"
                        >
                        Đánh dấu đã đọc
                        </button>
                    )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E8F0]">
                    {notifications.slice(0, 5).map((n) => (
                        <div 
                        key={n.id}
                        onClick={() => {
                            setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                            navigate(n.link);
                            setIsNotiOpen(false);
                        }}
                        className={`p-3 text-xs cursor-pointer transition-colors ${
                            n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-[#E0F2FE]/40 hover:bg-[#E0F2FE]/60'
                        }`}
                        >
                        <p className="font-bold text-[#0F172A] leading-snug">{n.title}</p>
                        <p className="text-[#475569] text-[11px] mt-0.5 leading-tight">{n.desc}</p>
                        <span className="text-[10px] text-[#94A3B8] mt-1.5 block">{n.time}</span>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </div>

            <div className="relative" ref={menuRef}>
                <div 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 cursor-pointer select-none p-1 rounded-lg hover:bg-slate-50"
                >
                <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
                <span className="text-xs font-bold text-[#0F172A]">GV. {mockCurrentUser.teacher.name}</span>
                <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                </div>

                {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1 z-50 animate-fade-in">
                    <button 
                    onClick={() => { setIsMenuOpen(false); navigate('/teacher/profile'); }}
                    className="w-full px-4 py-2.5 text-xs text-left text-[#0F172A] hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                    <User className="w-4 h-4 text-[#94A3B8]" />
                    Thông tin cá nhân
                    </button>
                    <div className="border-t border-[#E2E8F0] my-1"></div>
                    <button 
                    onClick={() => { setIsMenuOpen(false); setIsLogoutModalOpen(true); }}
                    className="w-full px-4 py-2.5 text-xs text-left text-[#EF4444] hover:bg-red-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                    <LogOut className="w-4 h-4 text-[#EF4444]" />
                    Đăng xuất
                    </button>
                </div>
                )}
            </div>
            </div>
        </header>

        <LogoutConfirmModal 
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={() => navigate('/login')}
        />
        </>
    );
}
