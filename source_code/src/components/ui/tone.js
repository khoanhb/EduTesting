/**
 * Bảng tông màu dùng chung cho Button, Badge, ConfirmDialog, Toast, Alert.
 * Tất cả mã màu đều trỏ về token trong tailwind.config.js, không hard-code hex ở component.
 *
 * Nguồn chuẩn: design/design-system.md §1.1, §1.3, §2.2
 */

/** Các tông được hỗ trợ trong toàn hệ thống. */
export const TONE_NAMES = ['primary', 'admin', 'success', 'warning', 'danger', 'neutral'];

/**
 * solid      - nút hành động chính (nền đặc, chữ trắng)
 * soft       - nhãn/nút phụ (nền nhạt, chữ đậm cùng tông)
 * outline    - nút viền mảnh trên nền trắng
 * text       - chỉ đổi màu chữ
 * focusRing  - box-shadow khi focus
 */
export const TONES = {
  primary: {
    label: 'Cyan: Sinh viên & Giảng viên',
    solid: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-dark',
    soft: 'bg-primary-light text-primary hover:bg-primary-ring',
    outline: 'border border-primary/40 text-primary bg-white hover:bg-primary-subtle',
    text: 'text-primary',
    border: 'border-primary',
    surface: 'bg-primary-subtle',
    focusRing: 'focus-visible:shadow-focus',
    dot: 'bg-primary',
  },
  admin: {
    label: 'Indigo: Quản trị viên',
    solid: 'bg-admin text-white hover:bg-admin-hover active:bg-admin-dark',
    soft: 'bg-admin-light text-admin hover:bg-admin-ring',
    outline: 'border border-admin/40 text-admin bg-white hover:bg-admin-subtle',
    text: 'text-admin',
    border: 'border-admin',
    surface: 'bg-admin-subtle',
    focusRing: 'focus-visible:shadow-focus-admin',
    dot: 'bg-admin',
  },
  success: {
    label: 'Thành công / Đáp án đúng',
    solid: 'bg-success text-white hover:bg-success-hover',
    soft: 'bg-success-light text-success hover:bg-success-border',
    outline: 'border border-success/40 text-success bg-white hover:bg-success-light',
    text: 'text-success',
    border: 'border-success',
    surface: 'bg-success-light',
    focusRing: 'focus-visible:shadow-focus',
    dot: 'bg-success',
  },
  warning: {
    label: 'Cảnh báo / Đánh dấu / Rủi ro trung bình',
    solid: 'bg-warning text-white hover:bg-warning-hover',
    soft: 'bg-warning-light text-warning hover:bg-warning-border',
    outline: 'border border-warning-border text-warning bg-warning-light hover:bg-warning-light/70',
    text: 'text-warning',
    border: 'border-warning-border',
    surface: 'bg-warning-light',
    focusRing: 'focus-visible:shadow-focus',
    dot: 'bg-warning',
  },
  danger: {
    label: 'Nguy hiểm / Vi phạm / Đáp án sai',
    solid: 'bg-danger text-white hover:bg-danger-hover',
    soft: 'bg-danger-light text-danger hover:bg-danger-border',
    outline: 'border border-danger-border text-danger bg-white hover:bg-danger-light',
    text: 'text-danger',
    border: 'border-danger-border',
    surface: 'bg-danger-light',
    focusRing: 'focus-visible:shadow-focus-danger',
    dot: 'bg-danger',
  },
  neutral: {
    label: 'Bỏ qua / Chưa trả lời / Vô hiệu hóa',
    solid: 'bg-neutral text-white hover:bg-textSub',
    soft: 'bg-neutral-light text-textSub hover:bg-borderLine',
    outline: 'border border-borderLine text-textSub bg-white hover:bg-canvas',
    text: 'text-textMuted',
    border: 'border-borderLine',
    surface: 'bg-neutral-light',
    focusRing: 'focus-visible:outline-borderLine',
    dot: 'bg-neutral',
  },
};

/**
 * Lấy bộ class của một tông; trả về tông `neutral` nếu tên không hợp lệ.
 * @param {string} tone
 * @returns {typeof TONES.primary}
 */
export function getTone(tone) {
  return TONES[tone] || TONES.neutral;
}
