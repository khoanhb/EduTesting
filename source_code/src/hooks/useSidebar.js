import { useContext } from 'react';
import SidebarContext from '../contexts/SidebarContext';

/**
 * Truy cập trạng thái thu gọn / mở rộng của thanh điều hướng.
 *
 * Trả về: { isCollapsed, toggle, collapse, expand, setIsCollapsed }
 *
 * Bắt buộc dùng bên trong <SidebarProvider> (đã bọc ở src/main.jsx). Ném lỗi rõ
 * ràng khi thiếu provider để phát hiện sớm lúc phát triển, thay vì âm thầm quay
 * về state cục bộ và làm lỗi "thu gọn bị reset khi chuyển trang" tái xuất hiện.
 */
export default function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar phải được dùng bên trong <SidebarProvider> (xem src/main.jsx).');
  }

  return context;
}
