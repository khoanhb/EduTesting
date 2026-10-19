/**
 * Thư viện giao diện dùng chung của EduTesting (Giai đoạn 0 - Foundation).
 *
 * Quy ước import từ nay về sau:
 *   import { Button, Modal, ConfirmDialog, Badge, useToast } from '../ui';
 *
 * Mọi thành phần ở đây đều đọc token màu/bo góc từ tailwind.config.js,
 * không hard-code mã màu hex trong trang nghiệp vụ.
 */

/* ---------- Linh kiện cơ bản ---------- */
export { default as Button } from './Button';
export { default as IconButton } from './IconButton';
export { default as Badge } from './Badge';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Textarea } from './Textarea';
export { default as Pagination } from './Pagination';

/* ---------- Lớp phủ (overlays) ---------- */
export { default as Modal } from './Modal';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as Popover } from './Popover';
export { default as Tooltip } from './Tooltip';
export { default as Dropdown } from './Dropdown';

/* ---------- Thông báo ---------- */
export { default as Toast } from './Toast';
export { TOAST_TYPES } from './toastTypes';
export { default as ToastProvider } from './ToastProvider';

/* ---------- Token màu dùng chung ---------- */
export { TONES, TONE_NAMES, getTone } from './tone';
