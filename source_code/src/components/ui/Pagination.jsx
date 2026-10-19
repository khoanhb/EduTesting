import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import cn from '../../utils/cn';
import { getTone } from './tone';

const DOTS = 'dots';
const DEFAULT_SIBLING_COUNT = 1;

/**
 * Tạo dải số trang hiển thị, có dấu "..." khi tổng số trang vượt ngưỡng.
 * Ví dụ page=5, total=20, sibling=1 -> [1, DOTS, 4, 5, 6, DOTS, 20]
 */
function buildPageRange(currentPage, totalPages, siblingCount) {
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, index) => index + 1);
    return [...leftRange, DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, index) => totalPages - (3 + siblingCount * 2) + index + 1
    );
    return [1, DOTS, ...rightRange];
  }

  return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, totalPages];
}

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

/**
 * Thanh phân trang dùng chung (FR-03.9, FR-04.7, FR-05.8, FR-07.1, FR-09.5).
 *
 * Hiển thị dòng trạng thái "Hiển thị A - B của X <itemLabel>" bên trái và cụm
 * nút [<] [1] [2] [3] [...] [>] bên phải. Component thuần trình bày, không tự
 * giữ state trang, cha truyền `page` + `onPageChange`.
 */
export default function Pagination({
  page = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  itemLabel = 'mục',
  siblingCount = DEFAULT_SIBLING_COUNT,
  showSummary = true,
  disabled = false,
  /**
   * Tông màu của nút trang đang chọn. Phân hệ Quản trị viên truyền 'admin' để
   * thanh phân trang dùng đúng màu Indigo của phân hệ thay vì màu Cyan chung.
   */
  tone = 'primary',
  className,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const toneTokens = getTone(tone);

  const pageItems = useMemo(
    () => buildPageRange(page, totalPages, siblingCount),
    [page, totalPages, siblingCount]
  );

  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);

  const goToPage = (nextPage) => {
    if (disabled || !onPageChange) return;
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    if (clamped !== page) onPageChange(clamped);
  };

  const navButtonClass =
    'p-1.5 border border-borderLine rounded-btn text-textSub transition-colors ' +
    'hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 text-xs text-textSub',
        className
      )}
    >
      {showSummary && (
        <div>
          Hiển thị{' '}
          <strong className="text-textMain tabular-nums">{startIndex}</strong> -{' '}
          <strong className="text-textMain tabular-nums">{endIndex}</strong> của{' '}
          <strong className="text-textMain tabular-nums">{totalItems}</strong> {itemLabel}
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Trang trước"
          disabled={disabled || page <= 1}
          onClick={() => goToPage(page - 1)}
          className={navButtonClass}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageItems.map((item, index) =>
          item === DOTS ? (
            <span
              key={`dots-${index}`}
              className="w-7 h-7 inline-flex items-center justify-center text-textMuted select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Trang ${item}`}
              aria-current={page === item ? 'page' : undefined}
              disabled={disabled}
              onClick={() => goToPage(item)}
              className={cn(
                'w-7 h-7 rounded-btn font-semibold text-xs transition-colors cursor-pointer tabular-nums',
                page === item
                  ? toneTokens.solid
                  : 'border border-borderLine text-textMain hover:bg-canvas'
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Trang sau"
          disabled={disabled || page >= totalPages}
          onClick={() => goToPage(page + 1)}
          className={navButtonClass}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
