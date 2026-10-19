import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Database,
    FileText,
    BarChart2,
    ShieldAlert,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    PenLine
} from 'lucide-react';
import logoGv from '../../assets/images/logo_gv.png';
import useSidebar from '../../hooks/useSidebar';
import { mockTeacherUser } from '../../data/teacher';
import LogoutConfirmModal from './LogoutConfirmModal';

/**
 * Thanh điều hướng phân hệ Giảng viên.
 *
 * Trạng thái thu gọn/mở rộng lấy từ <SidebarProvider> ở src/main.jsx (qua hook
 * `useSidebar`) thay vì `useState` cục bộ, nên khi chuyển trang thanh bên KHÔNG
 * tự bung rộng trở lại.
 *
 * Thông tin giảng viên ở chân thanh bên lấy từ `mockTeacherUser`, không viết
 * cứng tên/đơn vị trong JSX để khi nối API chỉ cần thay nguồn dữ liệu.
 */
export default function TeacherSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isCollapsed, toggle } = useSidebar();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const menuItems = [
        { title: 'Tổng quan', path: '/teacher/dashboard', icon: LayoutDashboard },
        { title: 'Ngân hàng câu hỏi', path: '/teacher/questions', icon: Database },
        { title: 'Quản lý đề thi', path: '/teacher/exams', icon: FileText },
        { title: 'Chấm bài tự luận', path: '/teacher/grade-essay', icon: PenLine },
        { title: 'Thống kê & Phân tích', path: '/teacher/analytics', icon: BarChart2 },
        { title: 'Nhật ký theo dõi', path: '/teacher/anti-cheat', icon: ShieldAlert },
    ];

    return (
        <>
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0F172A] text-white flex flex-col justify-between shrink-0 min-h-screen transition-all duration-300 relative select-none z-30`}>
            {/* Nút bấm co giãn đặt chính giữa chiều dọc thanh bên */}
            <button
            onClick={toggle}
            aria-label={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 bg-[#06B6D4] hover:bg-[#0891B2] text-white p-1 rounded-full shadow-lg border-2 border-[#0F172A] transition-colors z-50 flex items-center justify-center cursor-pointer"
            title={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>

            <div>
            {/* Header Logo */}
            <div className="h-16 flex items-center px-5 border-b border-slate-800 overflow-hidden">
                {isCollapsed ? (
                <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4] mx-auto">
                    <GraduationCap className="w-6 h-6 text-[#06B6D4]" />
                </div>
                ) : (
                <img src={logoGv} alt="Logo EduTesting" className="h-7 brightness-200 object-contain" />
                )}
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
                        ? 'bg-[#06B6D4] text-white font-bold'
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

            {/* Footer Profile User */}
            <div className={`p-4 border-t border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed ? (
                <div
                onClick={() => navigate('/teacher/profile')}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                >
                <img
                    src={mockTeacherUser.avatar}
                    alt={mockTeacherUser.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="text-left truncate">
                    <div className="text-xs font-bold text-white truncate">{mockTeacherUser.displayName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{mockTeacherUser.faculty}</div>
                </div>
                </div>
            ) : (
                <img
                onClick={() => navigate('/teacher/profile')}
                src={mockTeacherUser.avatar}
                alt={mockTeacherUser.name}
                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80"
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
