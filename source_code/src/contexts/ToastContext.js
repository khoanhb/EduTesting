import { createContext } from 'react';

/**
 * Ngữ cảnh thông báo toàn cục.
 * Giá trị mặc định là null để `useToast` phát hiện được trường hợp
 * component dùng ngoài <ToastProvider> và báo lỗi rõ ràng khi phát triển.
 */
const ToastContext = createContext(null);

export default ToastContext;
