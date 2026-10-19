import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import cn from '../../utils/cn';

/**
 * Hộp chọn chuẩn - nâng cấp của CustomDropdown, dùng cho toàn bộ bộ lọc:
 *  - Lọc ngân hàng câu hỏi (môn -> chương -> loại câu -> độ khó)
 *  - Lọc đề thi, lọc người dùng theo Khoa / Lớp-Bộ môn / Trạng thái
 *  - Chọn môn học, chọn giảng viên phụ trách, chọn ca thi
 *
 * Hỗ trợ: tìm kiếm, nhóm lựa chọn, vô hiệu hóa từng lựa chọn, xoá lựa chọn,
 * điều hướng bằng bàn phím.
 * Đóng khi bấm ra ngoài hoặc nhấn Escape.
 */

const SIZES = {
  sm: 'h-9 text-xs px-3',
  md: 'h-10 text-xs px-3.5',
  lg: 'h-11 text-sm px-4',
};

export default function Dropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Chọn một mục',
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
  disabled = false,
  clearable = false,
  emptyMessage = 'Không có dữ liệu phù hợp',
  size = 'md',
  className,
  menuClassName,
  id,
  triggerClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const keyword = query.trim().toLowerCase();
    return options.filter((option) => option.label?.toLowerCase().includes(keyword));
  }, [options, query, searchable]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  function openMenu() {
    setQuery('');
    const currentIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsOpen(true);
  }

  // Đóng khi bấm ra ngoài
  useEffect(() => {
    if (!isOpen) return undefined;
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeMenu();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, closeMenu]);

  // Tự focus ô tìm kiếm khi mở
  useEffect(() => {
    if (isOpen && searchable) {
      const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, searchable]);

  function commit(option) {
    if (!option || option.disabled) return;
    onChange?.(option.value);
    closeMenu();
  }

  function handleKeyDown(event) {
    if (disabled) return;

    if (!isOpen && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      event.preventDefault();
      openMenu();
      return;
    }

    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((previous) => Math.min(previous + 1, filteredOptions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((previous) => Math.max(previous - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      commit(filteredOptions[activeIndex]);
    }
  }

  function handleClear(event) {
    event.stopPropagation();
    onChange?.(null);
    closeMenu();
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <span className="block text-xs font-semibold text-textMain mb-1.5">{label}</span>
      )}

      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => isOpen ? closeMenu() : openMenu()}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full rounded-input border flex items-center justify-between gap-2 text-left',
          'transition-colors focus:outline-none',
          SIZES[size] || SIZES.md,
          disabled
            ? 'bg-disabled border-borderLine text-textMuted cursor-not-allowed'
            : isOpen
              ? 'bg-white border-primary text-textMain'
              : 'bg-white border-borderLine text-textMain hover:border-primary/60',
          triggerClassName
        )}
      >
        <span
          className={cn(
            'truncate font-medium',
            !selectedOption && 'text-textMuted font-normal'
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span className="flex items-center gap-1 shrink-0">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Xoá lựa chọn"
              onClick={handleClear}
              className="text-textMuted hover:text-danger transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 transition-transform',
              isOpen ? 'rotate-180 text-primary' : 'text-textMuted'
            )}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 mt-1.5 w-full min-w-[200px] z-popover bg-white',
            'border border-borderLine rounded-input shadow-popover overflow-hidden animate-fade-in',
            menuClassName
          )}
        >
          {searchable && (
            <div className="p-2 border-b border-borderLine">
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-textMuted"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full h-8 pl-8 pr-2.5 text-xs bg-canvas border border-borderLine rounded-btn
                             focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          <div role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-xs text-textMuted text-center">{emptyMessage}</div>
            )}

            {filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(option)}
                  className={cn(
                    'px-3 py-2 flex items-center justify-between gap-3 text-xs transition-colors',
                    option.disabled
                      ? 'text-textMuted cursor-not-allowed'
                      : 'cursor-pointer',
                    !option.disabled && isActive && !isSelected && 'bg-canvas',
                    isSelected && 'bg-primary-light/50 text-primary font-semibold'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="block text-[10px] text-textMuted truncate mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
