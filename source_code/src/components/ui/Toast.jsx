import React from 'react';
import { X } from 'lucide-react';
import cn from '../../utils/cn';
import { TOAST_TYPES } from './toastTypes';

/**
 * Một thẻ thông báo (toast) đơn lẻ - nguồn chuẩn: design-system.md §1.3.
 *
 * Bốn loại thông báo tương ứng token trạng thái:
 *  - success : thao tác thành công (lưu câu hỏi, cập nhật hồ sơ, xuất bản đề)
 *  - error   : thất bại (sai tài khoản/mật khẩu, không lưu được)
 *  - warning : cảnh báo (vi phạm gian lận, sắp hết giờ)
 *  - info    : thông tin trung tính (làm mới dữ liệu, đang tải)
 */

export default function Toast({ type = 'info', title, message, onDismiss, action }) {
  const typeTokens = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = typeTokens.icon;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'relative flex items-start gap-3 w-full max-w-[380px] pl-4 pr-3 py-3',
        'bg-white border rounded-widget shadow-popover overflow-hidden',
        'animate-toast-in',
        typeTokens.surface
      )}
    >
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', typeTokens.accent)} aria-hidden="true" />

      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', typeTokens.iconColor)} aria-hidden="true" />

      <div className="flex-1 min-w-0">
        {title && <p className="text-xs font-bold text-textMain leading-snug">{title}</p>}
        {message && (
          <p className={cn('text-xs text-textSub leading-relaxed', title && 'mt-0.5')}>{message}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Đóng thông báo"
          className="shrink-0 p-1 rounded text-textMuted hover:text-textMain hover:bg-canvas transition-colors"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
