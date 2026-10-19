import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap
} from 'lucide-react';
import logoAdmin from '../../assets/images/logo_admin.png';
import useSidebar from '../../hooks/useSidebar';
import { mockCurrentUser } from '../../data/shared/authAccounts';
import LogoutConfirmModal from './LogoutConfirmModal';

/**
 * Thanh điều hướng phân hệ Quản trị viên.
 *
 * Trạng thái thu gọn/mở rộng dùng chung <SidebarProvider> (hook `useSidebar`) nên
 * giữ nguyên khi chuyển giữa Tổng quan / Quản lý người dùng / Môn học.
 *
 * Thông tin quản trị viên lấy từ `mockCurrentUser` thay vì viết cứng trong JSX.
 */
export default function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isCollapsed, toggle } = useSidebar();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const menuItems = [
        { title: 'Tổng quan', path: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'Quản lý người dùng', path: '/admin/users', icon: Users },
        { title: 'Môn học & Chủ đề', path: '/admin/subjects', icon: BookOpen },
    ];

    return (
        <>
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0F172A] text-white flex flex-col justify-between shrink-0 min-h-screen transition-all duration-300 relative select-none z-30`}>
            {/* Nút bấm co giãn đặt chính giữa chiều dọc thanh bên */}
            <button
            onClick={toggle}
            aria-label={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 bg-[#6366F1] hover:bg-[#4F46E5] text-white p-1 rounded-full shadow-lg border-2 border-[#0F172A] transition-colors z-50 flex items-center justify-center cursor-pointer"
            title={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>

            <div>
            {/* Header Logo */}
            <div className="h-16 flex items-center px-5 border-b border-slate-800 overflow-hidden">
                {isCollapsed ? (
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] mx-auto">
                    <GraduationCap className="w-6 h-6 text-[#6366F1]" />
                </div>
                ) : (
                <img src={logoAdmin} alt="EduTesting Admin" className="h-7 brightness-200 object-contain" />
                )}
            </div>

                <div
                    aria-hidden={isCollapsed}
                    className={`px-6 pt-5 pb-2 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap ${isCollapsed ? 'invisible' : ''}`}
                >
                ADMIN PORTAL
                </div>

            {/* Danh sách Menu */}
            <nav className="p-3 space-y-1.5 text-xs font-medium">
                {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                    <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    title={isCollapsed ? item.title : ''}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-colors relative ${
                        isActive
                        ? 'bg-[#6366F1] text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </button>
                );
                })}
            </nav>
            </div>

            {/* Footer Admin User */}
            <div className={`p-4 border-t border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed ? (
                <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                    src={mockCurrentUser.admin.avatar}
                    alt={mockCurrentUser.admin.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                />
                <div className="text-left truncate">
                    <div className="text-xs font-bold text-white truncate">{mockCurrentUser.admin.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{mockCurrentUser.admin.email}</div>
                </div>
                </div>
            ) : (
                <img
                src={mockCurrentUser.admin.avatar}
                alt={mockCurrentUser.admin.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
            )}

            {!isCollapsed && (
                <button
                onClick={() => setIsLogoutModalOpen(true)}
                title="Đăng xuất"
                className="text-slate-400 hover:text-[#EF4444] transition-colors p-1 cursor-pointer"
                >
                <LogOut className="w-4 h-4" />
                </button>
            )}
            </div>
        </aside>

        <LogoutConfirmModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={() => navigate('/login')}
        />
        </>
    );
}
