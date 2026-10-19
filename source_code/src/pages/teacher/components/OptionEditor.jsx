import React from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Khung soạn phương án cho câu trắc nghiệm.
 * - MCQ_SINGLE: chọn 1 đáp án đúng (radio tròn).
 * - MCQ_MULTIPLE: chọn nhiều đáp án đúng (checkbox vuông).
 */
export default function OptionEditor({ type, options, correctAnswers, onChangeOptions, onChangeCorrect }) {
  const isMultiple = type === 'MCQ_MULTIPLE';

  const updateOptionText = (key, text) => {
    onChangeOptions(options.map((option) => (option.key === key ? { ...option, text } : option)));
  };

  const addOption = () => {
    const nextKey = OPTION_KEYS[options.length];
    if (!nextKey) return;
    onChangeOptions([...options, { key: nextKey, text: '' }]);
  };

  const removeOption = (key) => {
    const nextOptions = options
      .filter((option) => option.key !== key)
      .map((option, index) => ({ ...option, key: OPTION_KEYS[index] }));
    onChangeOptions(nextOptions);
    onChangeCorrect(correctAnswers.filter((answer) => answer !== key));
  };

  const toggleCorrect = (key) => {
    if (isMultiple) {
      onChangeCorrect(
        correctAnswers.includes(key)
          ? correctAnswers.filter((answer) => answer !== key)
          : [...correctAnswers, key]
      );
      return;
    }
    onChangeCorrect([key]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#0F172A]">
          Phương án trả lời
          <span className="ml-2 font-normal text-[#94A3B8]">
            {isMultiple ? '(tích vào ô của các đáp án đúng)' : '(chọn ô của đáp án đúng)'}
          </span>
        </label>

        {options.length < OPTION_KEYS.length && (
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#06B6D4] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm phương án
          </button>
        )}
      </div>

      {options.map((option) => {
        const isCorrect = correctAnswers.includes(option.key);

        return (
          <div
            key={option.key}
            className={`flex items-center gap-3 p-3 border rounded-[12px] transition-colors ${
              isCorrect ? 'border-[#06B6D4] bg-[#F0FDFA]' : 'border-[#E2E8F0] bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleCorrect(option.key)}
              title="Đánh dấu là đáp án đúng"
              className={`w-5 h-5 shrink-0 flex items-center justify-center border transition-colors cursor-pointer ${
                isMultiple ? 'rounded-[4px]' : 'rounded-full'
              } ${
                isCorrect
                  ? 'bg-[#06B6D4] border-[#06B6D4]'
                  : 'bg-white border-[#CBD5E1] hover:border-[#06B6D4]'
              }`}
            >
              {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </button>

            <span className="w-5 text-xs font-bold text-[#0F172A] shrink-0">{option.key}.</span>

            <input
              type="text"
              value={option.text}
              onChange={(event) => updateOptionText(option.key, event.target.value)}
              placeholder={`Nhập nội dung phương án ${option.key}`}
              className="flex-1 px-3 py-2 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4] transition-colors"
            />

            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(option.key)}
                title="Xóa phương án"
                className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
