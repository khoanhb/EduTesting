import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * Hộp thoại xác nhận dùng chung, phủ toàn bộ các modal "chốt hành động":
 *  - Đăng xuất tài khoản (LogoutConfirmModal)
 *  - Xóa vĩnh viễn dữ liệu: câu hỏi (M.05), đề thi (M.06), môn học (M.16), người dùng
 *  - Khóa / mở khóa tài khoản (M.19)
 *  - Đặt lại mật khẩu mặc định, mở khóa bài thi (M.09)
 *
 * Quy chuẩn §2.5: có nút X ở góc phải thì chân modal KHÔNG có nút "Đóng",
 * chỉ còn hai nút thao tác (hủy + xác nhận).
 *
 * Tone gợi ý theo mức độ nghiêm trọng:
 *  - danger  : hành động phá huỷ / đình chỉ / xoá
 *  - warning : hành động cần cân nhắc (khóa tài khoản, nộp bài)
 *  - success : hành động tích cực (mở khóa, xác nhận xuất bản)
 *  - admin   : thao tác trong phân hệ quản trị
 *  - primary : xác nhận thông thường
 */

const DEFAULT_ICONS = {
  danger: Trash2,
  warning: AlertTriangle,
  success: CheckCircle2,
  admin: ShieldAlert,
  primary: Info,
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận thao tác?',
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  tone = 'danger',
  icon,
  size = 'sm',
  isProcessing = false,
  hideCancel = false,
  showCloseButton = true,
  children,
  confirmButtonProps,
}) {
  const IconComponent = icon || DEFAULT_ICONS[tone] || AlertTriangle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? undefined : onClose}
      icon={IconComponent}
      tone={tone}
      size={size}
      title={title}
      description={description}
      showCloseButton={showCloseButton && !isProcessing}
      closeOnBackdrop={!isProcessing}
      closeOnEscape={!isProcessing}
      footer={
        <>
          {!hideCancel && (
            <Button
              variant="outline"
              tone="neutral"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            variant="solid"
            tone={tone}
            onClick={onConfirm}
            loading={isProcessing}
            className="flex-1"
            {...confirmButtonProps}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
