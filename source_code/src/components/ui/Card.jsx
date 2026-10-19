import React from 'react';
import cn from '../../utils/cn';

/**
 * Thẻ nội dung chính - quy chuẩn design-system.md §2.1:
 * bo góc lớn 24px, nền trắng, viền mảnh #E2E8F0, bóng đổ nhẹ.
 *
 * Dùng cho: thẻ KPI, khung câu hỏi, khung đề thi, widget đồng hồ đếm ngược,
 * bảng dữ liệu, khu vực biểu đồ.
 *
 * - `radius="card"` (24px) cho khối lớn, `radius="widget"` (16px) cho widget nhỏ,
 *   `radius="option"` (12px) cho thẻ phương án trắc nghiệm.
 * - `padding` nhận các mức: none | sm | md | lg.
 */

const PADDINGS = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 md:p-8',
};

const RADIUS = {
  card: 'rounded-card',
  widget: 'rounded-widget',
  option: 'rounded-option',
  btn: 'rounded-btn',
};

export default function Card({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  tone = null,
  padding = 'lg',
  radius = 'card',
  hoverable = false,
  className,
  headerClassName,
  bodyClassName,
  as: Component = 'div',
  ...rest
}) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <Component
      className={cn(
        'bg-white border border-borderLine shadow-card',
        RADIUS[radius] || RADIUS.card,
        PADDINGS[padding] ?? PADDINGS.lg,
        hoverable && 'transition-shadow duration-200 hover:shadow-raised',
        className
      )}
      {...rest}
    >
      {hasHeader && (
        <div
          className={cn(
            'flex items-start justify-between gap-4',
            padding === 'none' ? 'p-5 border-b border-borderLine' : 'mb-4',
            headerClassName
          )}
        >
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <span
                className={cn(
                  'w-9 h-9 rounded-btn flex items-center justify-center shrink-0',
                  tone ? `bg-${tone}-light text-${tone}` : 'bg-primary-light text-primary'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm font-bold text-textMain leading-snug">{title}</h2>
              )}
              {subtitle && (
                <p className="text-xs text-textSub mt-0.5 leading-relaxed">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={cn(bodyClassName)}>{children}</div>
    </Component>
  );
}
