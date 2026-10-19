import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OtpInput from './OtpInput';
import useCountdown from '../../hooks/useCountdown';
import useToast from '../../hooks/useToast';
import { toMmSs } from '../../utils/time';
import { validatePasswordStrength } from '../../utils/detectRole';
import { mockPasswordPolicy, mockPasswordRecovery } from '../../data/shared/authAccounts';
import cn from '../../utils/cn';

/**
 * M.04 - Khôi phục mật khẩu.
 * Tham chiếu: design/screenshots/modal-figma/M.04_request-pw.png
 *
 * Ba bước rõ ràng thay vì một biểu mẫu dài:
 *   1. EMAIL  - nhập email trường để nhận mã xác thực
 *   2. OTP    - nhập mã 6 số + mật khẩu mới, có đếm ngược gửi lại
 *   3. DONE   - xác nhận hoàn tất
 *
 * Khi chưa có Backend, mã OTP được sinh ngay trên trình duyệt và hiển thị
 * qua toast để người kiểm thử nhập lại (thay cho email thật).
 */

const STEPS = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  DONE: 'DONE',
};

const STEP_TITLES = {
  [STEPS.EMAIL]: 'Khôi phục mật khẩu',
  [STEPS.OTP]: 'Xác thực và đặt lại mật khẩu',
  [STEPS.DONE]: 'Đặt lại mật khẩu thành công',
};

function generateOtp(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [issuedOtp, setIssuedOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resendCountdown = useCountdown(mockPasswordRecovery.resendCooldownSeconds);

  function resetAll() {
    setStep(STEPS.EMAIL);
    setEmail('');
    setIssuedOtp('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setIsSubmitting(false);
    resendCountdown.reset();
  }

  function handleClose() {
    if (isSubmitting) return;
    resetAll();
    onClose?.();
  }

  /** Bước 1: sinh mã minh hoạ và chuyển sang bước 2. */
  function issueOtp() {
    const code = generateOtp(mockPasswordRecovery.otpLength);
    setIssuedOtp(code);
    setOtp('');
    setError(null);
    setStep(STEPS.OTP);
    resendCountdown.restart(mockPasswordRecovery.resendCooldownSeconds);

    toast.info(`Mã xác thực minh hoạ của bạn là: ${code}`, {
      title: 'Đã gửi mã xác thực',
      duration: 0,
    });
  }

  function handleSubmitEmail(event) {
    event.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập email trường đã được cấp.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Email không đúng định dạng. Ví dụ: 52000000@student.tdtu.edu.vn');
      return;
    }
    setError(null);
    issueOtp();
  }

  /** Bước 2: kiểm tra mã và chính sách mật khẩu. */
  function handleSubmitOtp(event) {
    event.preventDefault();

    if (otp.length !== mockPasswordRecovery.otpLength) {
      setError(`Vui lòng nhập đủ ${mockPasswordRecovery.otpLength} chữ số của mã xác thực.`);
      return;
    }

    if (otp !== issuedOtp) {
      setError('Mã xác thực không đúng hoặc đã hết hiệu lực. Vui lòng kiểm tra lại.');
      return;
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setError(`Mật khẩu mới chưa đạt yêu cầu: ${strength.failures.join(', ')}.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Mô phỏng độ trễ gọi API đổi mật khẩu.
    window.setTimeout(() => {
      setIsSubmitting(false);
      setStep(STEPS.DONE);
      onSuccess?.('Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
    }, 700);
  }

  function handleResend() {
    if (resendCountdown.isRunning) return;
    issueOtp();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      icon={step === STEPS.EMAIL ? Mail : step === STEPS.OTP ? KeyRound : CheckCircle2}
      tone={step === STEPS.DONE ? 'success' : 'primary'}
      size="md"
      title={STEP_TITLES[step]}
      description={
        step === STEPS.EMAIL
          ? 'Vui lòng nhập email trường đã được cấp để nhận mã xác thực đặt lại mật khẩu.'
          : step === STEPS.OTP
            ? `Mã xác thực đã được gửi tới ${email}. Mã gồm ${mockPasswordRecovery.otpLength} chữ số.`
            : 'Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập lại bằng mật khẩu mới.'
      }
      footer={
        step === STEPS.EMAIL ? (
          <Button type="submit" form="forgot-email-form" fullWidth disabled={!email.trim()}>Gửi mã xác thực</Button>
        ) : step === STEPS.OTP ? (
          <>
            <Button
              variant="outline"
              tone="neutral"
              icon={ArrowLeft}
              onClick={() => {
                setError(null);
                setStep(STEPS.EMAIL);
                resendCountdown.reset();
              }}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
            <Button
              type="submit"
              form="forgot-otp-form"
              loading={isSubmitting}
              disabled={otp.length !== mockPasswordRecovery.otpLength}
            >
              Đặt lại mật khẩu
            </Button>
          </>
        ) : (
          <Button tone="primary" fullWidth onClick={handleClose}>
            Đăng nhập ngay
          </Button>
        )
      }
    >
      {step === STEPS.EMAIL && (
        <form id="forgot-email-form" onSubmit={handleSubmitEmail} className="space-y-4" noValidate>
          <Input
            label="Email trường"
            type="email"
            placeholder={mockPasswordRecovery.emailHint}
            icon={Mail}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
            error={error}
            autoFocus
          />
        </form>
      )}

      {step === STEPS.OTP && (
        <form id="forgot-otp-form" onSubmit={handleSubmitOtp} className="space-y-5" noValidate>
          <div>
            <p className="text-[11px] font-bold text-textSub text-center tracking-wider mb-2.5">
              NHẬP MÃ OTP
            </p>
            <OtpInput
              length={mockPasswordRecovery.otpLength}
              value={otp}
              onChange={(next) => {
                setOtp(next);
                if (error) setError(null);
              }}
              hasError={Boolean(error)}
              autoFocus
            />

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCountdown.isRunning}
                className={cn(
                  'text-xs font-medium transition-colors',
                  resendCountdown.isRunning
                    ? 'text-textMuted cursor-not-allowed'
                    : 'text-primary hover:underline cursor-pointer'
                )}
              >
                {resendCountdown.isRunning
                  ? `Gửi lại mã sau (${toMmSs(resendCountdown.remaining)})`
                  : 'Gửi lại mã xác thực'}
              </button>
            </div>
          </div>

          <Input
            label="Mật khẩu mới"
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            icon={Lock}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              if (error) setError(null);
            }}
            hint={mockPasswordPolicy.message}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            placeholder="Nhập lại mật khẩu"
            icon={Lock}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (error) setError(null);
            }}
            error={error}
          />
        </form>
      )}

      {step === STEPS.DONE && (
        <div className="p-4 bg-success-light border border-success-border rounded-widget text-center">
          <p className="text-xs text-textSub leading-relaxed">
            Mật khẩu cho tài khoản <span className="font-semibold text-textMain">{email}</span> đã
            được cập nhật thành công.
          </p>
        </div>
      )}
    </Modal>
  );
}
