import { useEffect } from 'react';

/**
 * Bộ đếm dùng chung cho toàn ứng dụng.
 * Nhiều modal có thể mở chồng nhau (ví dụ: Modal chi tiết -> Modal xác nhận xóa);
 * chỉ khi modal CUỐI CÙNG đóng lại thì mới trả scrollbar về bình thường.
 */
let lockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

/**
 * Khóa cuộn trang nền khi có modal/overlay đang mở.
 * Đồng thời bù khoảng trống của scrollbar để bố cục không bị "giật" sang phải.
 *
 * @param {boolean} isLocked
 */
export default function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;

    lockCount += 1;

    if (lockCount === 1) {
      savedOverflow = document.body.style.overflow;
      savedPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow;
        document.body.style.paddingRight = savedPaddingRight;
      }
    };
  }, [isLocked]);
}
