import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Gọi `handler` khi người dùng nhấn phím Escape.
 * Dùng chung cho Modal, Popover, Dropdown, Menu cá nhân.
 *
 * @param {(event: KeyboardEvent) => void} handler
 * @param {boolean} isActive - chỉ gắn listener khi overlay đang mở
 */
export default function useEscapeKey(handler, isActive = true) {
  const handlerRef = useRef(handler);
  useLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isActive) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        handlerRef.current?.(event);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
}
