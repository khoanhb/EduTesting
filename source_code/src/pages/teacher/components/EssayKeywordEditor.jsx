import React, { useState } from 'react';
import { Plus, X, Info } from 'lucide-react';
import {
  ESSAY_CASE_RULE_LABELS,
  ESSAY_SCORING_RULE_LABELS,
} from '../../../data/teacher';

/**
 * Cấu hình chấm điểm câu tự luận ngắn / điền từ (2.2 - FR-05.7).
 *
 * Hệ thống chấm bằng cách đối soát câu trả lời của thí sinh với DANH SÁCH TỪ KHÓA
 * bên dưới, nên không tồn tại "chế độ so khớp chuỗi ký tự" tách rời khỏi từ khóa.
 * Giảng viên chỉ bật/tắt hai tùy chọn tác động trực tiếp tới cách tính điểm:
 *
 *   - allowPartialKeywordScore : cho phép tính điểm theo từng từ khóa khớp
 *     (tắt ⇒ phải khớp đủ mọi từ khóa mới được điểm).
 *   - isCaseSensitive : phân biệt chữ hoa / chữ thường khi đối soát.
 *
 * Props:
 *   keywords, allowPartialKeywordScore, isCaseSensitive, onChange(patch)
 */
export default function EssayKeywordEditor({
  keywords,
  allowPartialKeywordScore,
  isCaseSensitive,
  onChange,
}) {
  const [draftKeyword, setDraftKeyword] = useState('');

  const addKeyword = () => {
    const value = draftKeyword.trim();
    if (value === '' || keywords.includes(value)) return;
    onChange({ keywords: [...keywords, value] });
    setDraftKeyword('');
  };

  const removeKeyword = (keyword) => {
    onChange({ keywords: keywords.filter((item) => item !== keyword) });
  };

  const scoringOptions = [
    {
      value: false,
      label: ESSAY_SCORING_RULE_LABELS.ALL_KEYWORDS_REQUIRED,
      hint: 'Câu chỉ được tính điểm tự động khi thí sinh nêu đủ TẤT CẢ từ khóa.',
    },
    {
      value: true,
      label: ESSAY_SCORING_RULE_LABELS.PARTIAL_KEYWORD_SCORE,
      hint: 'Điểm gợi ý bằng tỉ lệ từ khóa thí sinh đã nêu; giảng viên xác nhận lại ở màn hình chấm.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 px-3.5 py-3 bg-[#E0F2FE]/40 border border-[#BAE6FD] rounded-[12px] text-[11px] text-[#0369A1]">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          Hệ thống đối soát câu trả lời của thí sinh với danh sách từ khóa bên dưới. Câu nêu đủ
          toàn bộ từ khóa được cộng điểm tối đa và gắn nhãn "Đã chấm tự động"; các trường
          hợp khớp một phần hoặc không khớp được chuyển sang màn hình chấm tay.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0F172A] mb-2">
          Danh sách từ khóa chấp nhận
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draftKeyword}
            onChange={(event) => setDraftKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addKeyword();
              }
            }}
            placeholder="Nhập từ khóa rồi nhấn Enter (VD: Khóa chính, Primary Key)"
            className="flex-1 px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4] transition-colors"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#BAE6FD] text-[#0891B2] text-xs font-semibold rounded-[8px] hover:bg-[#E0F2FE]/50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm
          </button>
        </div>

        {keywords.length === 0 ? (
          <p className="text-[11px] text-[#94A3B8] mt-2">
            Chưa có từ khóa nào được cấu hình. Câu hỏi chưa có từ khóa sẽ luôn phải chấm tay.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-3">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F0FDFA] border border-[#06B6D4]/40 text-[#0E7490] text-[11px] font-semibold rounded-[8px]"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="text-[#0E7490] hover:text-[#EF4444] transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-2">
            Cách tính điểm theo từ khóa
          </label>
          <div className="space-y-2">
            {scoringOptions.map((option) => {
              const isActive = allowPartialKeywordScore === option.value;

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => onChange({ allowPartialKeywordScore: option.value })}
                  className={`w-full flex items-start gap-3 px-3.5 py-2.5 border rounded-[8px] text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'border-[#06B6D4] bg-[#F0FDFA] text-[#0F172A] font-semibold'
                      : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#06B6D4]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 mt-0.5 rounded-full border shrink-0 flex items-center justify-center ${
                      isActive ? 'border-[#06B6D4]' : 'border-[#CBD5E1]'
                    }`}
                  >
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#06B6D4]"></span>}
                  </span>
                  <span>
                    <span className="block text-xs">{option.label}</span>
                    <span className="block text-[11px] text-[#94A3B8] mt-0.5 font-normal">
                      {option.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-2">Đối soát chữ hoa / thường</label>
          <button
            type="button"
            onClick={() => onChange({ isCaseSensitive: !isCaseSensitive })}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-3 border border-[#E2E8F0] rounded-[8px] bg-white text-xs cursor-pointer hover:border-[#06B6D4] transition-colors"
          >
            <span className="text-left">
              <span className="block font-semibold text-[#0F172A]">Phân biệt hoa / thường</span>
              <span className="block text-[11px] text-[#94A3B8] mt-0.5">
                {isCaseSensitive
                  ? `${ESSAY_CASE_RULE_LABELS.SENSITIVE} - "UseEffect" khác "useEffect"`
                  : `${ESSAY_CASE_RULE_LABELS.INSENSITIVE} - "UseEffect" vẫn khớp "useEffect"`}
              </span>
            </span>
            <span
              className={`w-9 h-5 rounded-full shrink-0 relative transition-colors ${
                isCaseSensitive ? 'bg-[#06B6D4]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  isCaseSensitive ? 'left-[18px]' : 'left-0.5'
                }`}
              ></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
