/**
 * Tiện ích định dạng thời gian dùng chung cho đồng hồ đếm ngược phòng thi,
 * đếm ngược gửi lại OTP, và thời lượng làm bài.
 */

function pad(value) {
  return String(value).padStart(2, '0');
}

/**
 * Đổi số giây thành chuỗi MM:SS (âm sẽ được kẹp về 00:00).
 * @param {number} totalSeconds
 * @returns {string} ví dụ: "04:59"
 */
export function toMmSs(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Đổi số giây thành chuỗi HH:MM:SS, dùng khi thời lượng vượt quá 60 phút.
 * @param {number} totalSeconds
 * @returns {string} ví dụ: "01:45:00"
 */
export function toHhMmSs(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Chọn định dạng phù hợp: dưới 1 giờ dùng MM:SS, từ 1 giờ trở lên dùng HH:MM:SS.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function toClock(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  return safeSeconds >= 3600 ? toHhMmSs(safeSeconds) : toMmSs(safeSeconds);
}
