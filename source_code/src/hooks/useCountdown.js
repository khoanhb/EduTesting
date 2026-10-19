import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Đồng hồ đếm ngược dùng chung: OTP khôi phục mật khẩu (M.04),
 * đồng hồ phòng thi (3.2), tự động thu bài khi hết giờ (M.03).
 *
 * @param {number} initialSeconds - số giây bắt đầu đếm
 * @param {object} [options]
 * @param {boolean} [options.autoStart=false] - chạy ngay khi mount
 * @param {() => void} [options.onExpire] - gọi đúng một lần khi về 0
 * @returns {{ remaining: number, isRunning: boolean, start: Function, pause: Function, reset: Function, restart: Function, setRemaining: Function }}
 */
export default function useCountdown(initialSeconds, { autoStart = false, onExpire } = {}) {
  const safeInitial = Math.max(0, Math.floor(initialSeconds || 0));

  const [clock, setClock] = useState({
    remaining: safeInitial,
    status: autoStart && safeInitial > 0 ? 'running' : 'paused',
  });
  const { remaining } = clock;
  const isRunning = clock.status === 'running';

  const onExpireRef = useRef(onExpire);
  useLayoutEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Chặn gọi onExpire nhiều lần cho cùng một chu kỳ đếm.
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = window.setInterval(() => {
      setClock((previous) => previous.remaining <= 1
        ? { remaining: 0, status: 'expired' }
        : { ...previous, remaining: previous.remaining - 1 });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (clock.status !== 'expired') return;

    if (!hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpireRef.current?.();
    }
  }, [clock]);

  const start = useCallback(() => {
    hasExpiredRef.current = false;
    setClock((previous) => {
      const next = previous.remaining > 0 ? previous.remaining : safeInitial;
      return { remaining: next, status: next > 0 ? 'running' : 'expired' };
    });
  }, [safeInitial]);

  const pause = useCallback(() => setClock((previous) => ({ ...previous, status: 'paused' })), []);

  const setRemaining = useCallback((value) => {
    setClock((previous) => {
      const next = typeof value === 'function' ? value(previous.remaining) : value;
      return {
        remaining: next,
        status: previous.status === 'running' && next <= 0 ? 'expired'
          : previous.status === 'expired' ? 'paused' : previous.status,
      };
    });
  }, []);

  const reset = useCallback(
    (nextSeconds = safeInitial) => {
      hasExpiredRef.current = false;
      setClock({ remaining: Math.max(0, Math.floor(nextSeconds || 0)), status: 'paused' });
    },
    [safeInitial]
  );

  const restart = useCallback(
    (nextSeconds = safeInitial) => {
      hasExpiredRef.current = false;
      const next = Math.max(0, Math.floor(nextSeconds || 0));
      setClock({ remaining: next, status: next > 0 ? 'running' : 'expired' });
    },
    [safeInitial]
  );

  return { remaining, isRunning, start, pause, reset, restart, setRemaining };
}
