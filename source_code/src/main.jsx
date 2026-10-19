import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import SidebarProvider from './components/common/SidebarProvider';
import ToastProvider from './components/ui/ToastProvider';

/**
 * Điểm khởi động ứng dụng EduTesting.
 *
 * <ToastProvider> và <SidebarProvider> bọc ngoài <App /> để mọi trang
 * (Sinh viên / Giảng viên / Quản trị) dùng chung được:
 *   - `useToast()`  : hiển thị thông báo (không cần khai báo lại mỗi trang)
 *   - `useSidebar()`: trạng thái thu gọn thanh điều hướng, nhờ đó điều hướng
 *     giữa các trang KHÔNG còn làm thanh bên tự mở rộng trở lại.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </ToastProvider>
  </StrictMode>
);
