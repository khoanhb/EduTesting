import { createContext } from 'react';

/**
 * Ngữ cảnh trạng thái thu gọn / mở rộng của thanh điều hướng bên trái.
 *
 * LÝ DO TỒN TẠI:
 *   Thanh bên được render lại ở mỗi trang, nên nếu trạng thái thu gọn nằm trong
 *   `useState` cục bộ của component thì mỗi lần điều hướng component bị unmount
 *   và trạng thái bị đặt lại về "mở rộng". Đưa trạng thái lên ngữ cảnh dùng chung
 *   giúp thanh bên giữ nguyên trạng thái khi chuyển trang mà không phải sao chép
 *   state vào từng page.
 *
 * Giá trị mặc định là null để `useSidebar` phát hiện được trường hợp component
 * dùng ngoài <SidebarProvider> và báo lỗi rõ ràng khi phát triển.
 */
const SidebarContext = createContext(null);

export default SidebarContext;
