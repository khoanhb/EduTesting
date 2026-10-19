import React from 'react';
import { GraduationCap, ShieldCheck, Users } from 'lucide-react';
import cn from '../../../utils/cn';
import { ROLE_LABELS, ROLES } from '../../../utils/detectRole';

/**
 * Bảng tài khoản mẫu hiển thị dưới biểu mẫu đăng nhập.
 *
 * Mục đích: khi chưa nối Backend, người kiểm thử bấm một dòng là điền sẵn
 * mã định danh + mật khẩu để vào đúng phân hệ, không phải nhớ tài khoản.
 * Khi Backend hoàn thiện, chỉ cần bỏ component này khỏi LoginPage.
 *
 * Dữ liệu lấy từ `mockAuthAccounts` trong src/data/shared/authAccounts.js.
 */

const ROLE_ICONS = {
  [ROLES.STUDENT]: GraduationCap,
  [ROLES.TEACHER]: Users,
  [ROLES.ADMIN]: ShieldCheck,
};

const ROLE_ACCENTS = {
  [ROLES.STUDENT]: 'text-primary bg-primary-light',
  [ROLES.TEACHER]: 'text-primary bg-primary-light',
  [ROLES.ADMIN]: 'text-admin bg-admin-light',
};

export default function DemoAccountList({ accounts = [], onSelect }) {
  if (accounts.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-borderLine">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-textSub tracking-wide">
          TÀI KHOẢN MẪU:
        </p>
        <span className="text-[10px] text-textMuted">Dữ liệu minh hoạ</span>
      </div>

      <div className="space-y-2">
        {accounts.map((account) => {
          const Icon = ROLE_ICONS[account.role] || Users;

          return (
            <button
              key={account.identifier}
              type="button"
              onClick={() => onSelect?.(account)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                'bg-white border border-borderLine rounded-btn',
                'hover:border-primary hover:bg-primary-subtle transition-colors'
              )}
            >
              <span
                className={cn(
                  'w-8 h-8 rounded-btn flex items-center justify-center shrink-0',
                  ROLE_ACCENTS[account.role] || ROLE_ACCENTS[ROLES.STUDENT]
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-textMain truncate">
                  {ROLE_LABELS[account.role]} · {account.displayName}
                </span>
                <span className="block text-[10px] text-textMuted font-mono truncate mt-0.5">
                  {account.identifier} / {account.password}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
