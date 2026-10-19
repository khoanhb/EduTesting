/**
 * Ghép các class Tailwind lại với nhau, tự động bỏ qua giá trị rỗng/false.
 * Dùng thay cho template string để điều kiện hoá class gọn gàng hơn.
 *
 * cn('px-4', isActive && 'bg-primary', undefined) -> 'px-4 bg-primary'
 *
 * @param {...(string|false|null|undefined|0)} inputs
 * @returns {string}
 */
export default function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
