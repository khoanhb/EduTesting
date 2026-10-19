/**
 * EduTesting: Tailwind CSS v3.4.1 design tokens
 * Nguồn chuẩn: design/design-system.md (Giai đoạn 0.1 DesignSystem_Base)
 * Mọi mã màu / bo góc / bóng đổ trong dự án PHẢI lấy từ đây, không hard-code thêm.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },

      colors: {
        /* 1.1 Màu nhận diện thương hiệu (Sinh viên & Giảng viên) */
        primary: {
          DEFAULT: '#06B6D4',
          hover: '#0891B2',
          dark: '#0E7490',
          light: '#E0F2FE',
          subtle: '#F0FDFA',
          ring: '#A5F3FC',
        },
        /* 1.1 Màu nhận diện Quản trị viên (Admin Workspace) */
        admin: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          dark: '#4338CA',
          light: '#EEF2FF',
          subtle: '#EEF2FF',
          ring: '#C7D2FE',
        },

        /* 1.2 Nền & bố cục hệ thống */
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        disabled: '#F1F5F9',
        borderLine: '#E2E8F0',

        /* 1.4 Cấp bậc chữ */
        textMain: '#0F172A',
        textSub: '#475569',
        textMuted: '#94A3B8',

        /* 1.3 Màu trạng thái & phân loại nghiệp vụ */
        success: { DEFAULT: '#10B981', hover: '#059669', light: '#ECFDF5', border: '#A7F3D0' },
        warning: { DEFAULT: '#D97706', hover: '#B45309', light: '#FEF3C7', border: '#FDE68A' },
        danger: { DEFAULT: '#EF4444', hover: '#DC2626', light: '#FEF2F2', border: '#FCA5A5' },
        neutral: { DEFAULT: '#94A3B8', light: '#F1F5F9' },

        /* Giữ alias cũ để không phá vỡ các trang đã có */
        status: {
          success: '#10B981',
          warning: '#D97706',
          danger: '#EF4444',
          neutral: '#94A3B8',
        },
      },

      /* 2.1 Bo góc: nút/input 8px, thẻ phương án 12–16px, thẻ lớn & modal 24px */
      borderRadius: {
        badge: '6px',
        btn: '8px',
        input: '8px',
        option: '12px',
        widget: '16px',
        card: '24px',
        modal: '24px',
        'modal-sm': '16px',
      },

      /* Bóng đổ dùng thống nhất thay cho shadow-sm/md rải rác */
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)',
        raised: '0 4px 12px -2px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.05)',
        popover: '0 12px 28px -8px rgba(15,23,42,0.18)',
        overlay: '0 24px 48px -12px rgba(15,23,42,0.28)',
        focus: '0 0 0 3px rgba(6,182,212,0.18)',
        'focus-admin': '0 0 0 3px rgba(99,102,241,0.18)',
        'focus-danger': '0 0 0 3px rgba(239,68,68,0.18)',
      },

      /* 3.1 / 3.2 Kích thước layout đặc thù */
      height: {
        header: '64px',
        'header-exam': '80px',
        palette: '36px',
      },
      width: {
        sidebar: '256px',
        'sidebar-collapsed': '80px',
        palette: '36px',
      },
      minWidth: {
        palette: '36px',
      },

      /* Thứ tự lớp z-index tránh cộng trừ số vô tội vạ */
      zIndex: {
        base: '0',
        docked: '10',
        sidebar: '30',
        header: '40',
        overlay: '50',
        modal: '60',
        popover: '70',
        tooltip: '80',
        toast: '90',
      },

      /* 0.2 Chuyển động chuẩn của hệ thống overlay */
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(16px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        'ring-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.45)' },
          '100%': { boxShadow: '0 0 0 10px rgba(239,68,68,0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out both',
        'fade-out': 'fade-out 140ms ease-in both',
        'scale-in': 'scale-in 180ms cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right': 'slide-in-right 200ms cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-left': 'slide-in-left 200ms cubic-bezier(0.16,1,0.3,1) both',
        'toast-in': 'toast-in 220ms cubic-bezier(0.16,1,0.3,1) both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        shake: 'shake 320ms ease-in-out',
        'ring-pulse': 'ring-pulse 1.6s ease-out infinite',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
