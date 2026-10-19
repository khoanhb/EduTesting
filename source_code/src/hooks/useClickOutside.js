import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Gọi `handler` khi người dùng bấm ra ngoài (các) phần tử được tham chiếu.
 * Dùng chung cho Dropdown, Popover, Menu cá nhân, chuông thông báo.
 *
 * @param {React.RefObject|React.RefObject[]} refs - một hoặc nhiều ref cần theo dõi
 * @param {(event: MouseEvent) => void} handler - xử lý khi bấm ra ngoài
 * @param {boolean} isActive - chỉ gắn listener khi đang mở (mặc định true)
 */
export default function useClickOutside(refs, handler, isActive = true) {
  const handlerRef = useRef(handler);

  const refsRef = useRef(refs);
  useLayoutEffect(() => {
    handlerRef.current = handler;
    refsRef.current = refs;
  }, [handler, refs]);

  useEffect(() => {
    if (!isActive) return undefined;

    function handlePointerDown(event) {
      const list = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const clickedInside = list.some((ref) => ref?.current?.contains(event.target));
      if (!clickedInside) handlerRef.current?.(event);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isActive]);
}
