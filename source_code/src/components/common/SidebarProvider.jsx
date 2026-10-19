import React, { useCallback, useMemo, useState } from 'react';
import SidebarContext from '../../contexts/SidebarContext';

/**
 * Nhà cung cấp trạng thái thanh điều hướng, bọc toàn bộ ứng dụng trong main.jsx
 * (cùng cấp với <ToastProvider>).
 *
 * Nhờ đặt state ở đây, thanh bên của cả phân hệ Giảng viên lẫn Quản trị viên giữ
 * nguyên trạng thái thu gọn / mở rộng khi người dùng chuyển trang, điều hướng
 * không còn làm state bị đặt lại như khi dùng useState cục bộ trong Sidebar.
 *
 * Truy cập qua hook `useSidebar()`:
 *   const { isCollapsed, toggle, collapse, expand } = useSidebar();
 */
export default function SidebarProvider({ children, defaultCollapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggle = useCallback(() => setIsCollapsed((previous) => !previous), []);
  const collapse = useCallback(() => setIsCollapsed(true), []);
  const expand = useCallback(() => setIsCollapsed(false), []);

  const value = useMemo(
    () => ({ isCollapsed, toggle, collapse, expand, setIsCollapsed }),
    [isCollapsed, toggle, collapse, expand]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
