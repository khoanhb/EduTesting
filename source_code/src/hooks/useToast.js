import { useContext } from 'react';
import ToastContext from '../contexts/ToastContext';

/**
 * Truy cập API thông báo toàn cục từ bất kỳ component nào.
 *
 *   const toast = useToast();
 *   toast.success('Cập nhật thành công!');
 *   toast.error('Mã số định danh hoặc mật khẩu không chính xác.');
 *   toast.warning('Cảnh báo: bạn đã rời màn hình 2/3 lần.');
 *   toast.info('Đang làm mới dữ liệu...', { duration: 0 });
 *
 * Các hàm nhận (message, options?) với options: { title, duration, action }.
 *
 * @returns {{
 *   push: Function, dismiss: Function, clear: Function,
 *   success: Function, error: Function, warning: Function, info: Function
 * }}
 */
export default function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast() phải được dùng bên trong <ToastProvider>. ' +
        'Hãy bọc <App /> bằng <ToastProvider> trong src/main.jsx.'
    );
  }

  return context;
}
