import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, GraduationCap, Lock, Mail, User } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
import DemoAccountList from './components/DemoAccountList';
import useToast from '../../hooks/useToast';
import cn from '../../utils/cn';
import { mockAuthAccounts } from '../../data/shared/authAccounts';
import { ROLE_LABELS, detectRole } from '../../utils/detectRole';

/**
 * 1.0 - Màn hình Đăng nhập.
 * Tham chiếu: design/screenshots/1.0_DangNhap.png
 *
 * Một biểu mẫu duy nhất cho cả ba vai trò; hệ thống nhận diện vai trò từ
 * mã định danh (context.md §3) và điều hướng tới phân hệ tương ứng.
 *
 * Backend thay thế phần kiểm tra `mockAuthAccounts` bằng POST /auth/login.
 */

const INVALID_CREDENTIALS_MESSAGE =
  'Mã số định danh hoặc mật khẩu không chính xác. Vui lòng thử lại.';

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const timeoutRef = useRef(null);

  const detectedRole = detectRole(identifier);

  function handleSelectDemoAccount(account) {
    setIdentifier(account.identifier);
    setPassword(account.password);
    setError(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError(INVALID_CREDENTIALS_MESSAGE);
      toast.error(INVALID_CREDENTIALS_MESSAGE);
      return;
    }

    if (!detectedRole) {
      setError(INVALID_CREDENTIALS_MESSAGE);
      toast.error(INVALID_CREDENTIALS_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    // Mô phỏng độ trễ gọi API trước khi Backend được nối vào.
    timeoutRef.current = window.setTimeout(() => {
      const account = mockAuthAccounts.find(
        (item) =>
          item.identifier.toLowerCase() === identifier.trim().toLowerCase() &&
          item.password === password
      );

      if (!account) {
        setError(INVALID_CREDENTIALS_MESSAGE);
        toast.error(INVALID_CREDENTIALS_MESSAGE);
        setIsSubmitting(false);
        return;
      }

      toast.success(`Xin chào ${account.displayName}!`, {
        title: `Đăng nhập thành công - ${ROLE_LABELS[account.role]}`,
      });
      navigate(account.redirect);
    }, 600);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-canvas px-4 py-8 font-sans">
      <div className="w-full" />

      <div className="w-full max-w-[460px]">
        {/* Khối nhận diện thương hiệu */}
        <div className="text-center mb-6">
          <span className="inline-flex w-12 h-12 rounded-widget bg-primary text-white items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6" aria-hidden="true" />
          </span>
          <h2 className="text-sm font-bold tracking-wider text-textMain uppercase mb-1">
            ĐẠI HỌC TÔN ĐỨC THẮNG
          </h2>
          <h1 className="text-xl font-extrabold text-textMain tracking-tight">
            HỆ THỐNG KHẢO THÍ TRỰC TUYẾN
          </h1>
          <p className="text-xs text-textSub mt-1">
            Đăng nhập tài khoản Giảng viên / Sinh viên / Quản trị viên
          </p>
        </div>

        <div className="bg-white border border-borderLine rounded-card shadow-card p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <Input
                label="Mã số định danh (MSSV / MSGV / admin)"
                placeholder="Nhập mã số của bạn"
                icon={User}
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  if (error) setError(null);
                }}
                autoComplete="username"
                autoFocus
              />

              {detectedRole && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone={detectedRole === 'ADMIN' ? 'admin' : 'primary'} size="sm" dot>
                    {ROLE_LABELS[detectedRole]}
                  </Badge>
                  <span className="text-[10px] text-textMuted">
                    Hệ thống đã nhận diện được vai trò của bạn
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                icon={Lock}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError(null);
                }}
                autoComplete="current-password"
              />

              {error && (
                <p role="alert" className="text-xs font-medium text-danger">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setRememberMe((previous) => !previous)}
                aria-pressed={rememberMe}
                className="flex items-center gap-2 cursor-pointer select-none text-textSub"
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    rememberMe ? 'bg-primary border-primary' : 'border-borderLine bg-white'
                  )}
                >
                  {rememberMe && (
                    <Check className="w-3 h-3 text-white stroke-[3]" aria-hidden="true" />
                  )}
                </span>
                <span>Ghi nhớ đăng nhập</span>
              </button>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
              Đăng nhập
            </Button>
          </form>

          <DemoAccountList accounts={mockAuthAccounts} onSelect={handleSelectDemoAccount} />

          <div className="mt-8 pt-6 border-t border-borderLine text-center text-xs text-textSub space-y-1.5">
            <p className="inline-flex items-center gap-1.5 justify-center">
              Hỗ trợ kỹ thuật:
              <a
                href="mailto:support@tdtu.edu.vn"
                className="inline-flex items-center gap-1 text-textMain hover:underline font-medium"
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                support@tdtu.edu.vn
              </a>
            </p>
            <p>
              Hotline hỗ trợ thi trực tuyến:{' '} 
              <span className="font-semibold text-textMain">1900 xxxx</span>
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-textMuted mt-8">
        © 2026 EduTesting - Nền tảng khảo thí thông minh
      </footer>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
}
