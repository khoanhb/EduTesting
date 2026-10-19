import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, XCircle, Eye } from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import ToastNotification from '../../components/common/ToastNotification';
import CustomDropdown from '../../components/common/CustomDropdown';
import OptionEditor from './components/OptionEditor';
import EssayKeywordEditor from './components/EssayKeywordEditor';
import {
  mockQuestions,
  mockSubjects,
  mockTeacherUser,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from '../../data/teacher';

const DEFAULT_OPTIONS = [
  { key: 'A', text: '' },
  { key: 'B', text: '' },
  { key: 'C', text: '' },
  { key: 'D', text: '' },
];

const TRUE_FALSE_OPTIONS = [
  { key: 'A', text: 'Đúng' },
  { key: 'B', text: 'Sai' },
];

/** Khởi tạo state form: tạo mới hoặc nạp dữ liệu câu hỏi đang sửa. */
const buildInitialForm = (question) => {
  if (!question) {
    return {
      subjectCode: mockSubjects[0].code,
      chapterId: mockSubjects[0].chapters[0].id,
      type: 'MCQ_SINGLE',
      difficulty: 'MEDIUM',
      content: '',
      options: DEFAULT_OPTIONS,
      correctAnswers: [],
      keywords: [],
      matchMode: 'KEYWORD',
      caseSensitive: false,
      explanation: '',
    };
  }

  return {
    subjectCode: question.subjectCode,
    chapterId: question.chapterId,
    type: question.type,
    difficulty: question.difficulty,
    content: question.content,
    options: question.options.length > 0 ? question.options : DEFAULT_OPTIONS,
    correctAnswers: question.correctAnswers,
    keywords: question.acceptedKeywords ?? [],
    matchMode: question.matchMode ?? 'KEYWORD',
    caseSensitive: false,
    explanation: question.explanation,
  };
};

export default function AddEditQuestionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('edit');

  const editingQuestion = useMemo(
    () => mockQuestions.find((question) => question.id === editingId) || null,
    [editingId]
  );

  const [form, setForm] = useState(() => buildInitialForm(editingQuestion));
  const [toastMessage, setToastMessage] = useState(null);

  const chapters = useMemo(
    () => mockSubjects.find((subject) => subject.code === form.subjectCode)?.chapters ?? [],
    [form.subjectCode]
  );

  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }));

  /** Đổi loại câu hỏi, thiết lập lại cấu trúc đáp án cho phù hợp với loại mới. */
  const handleTypeChange = (type) => {
    const nextOptions =
      type === 'TRUE_FALSE' ? TRUE_FALSE_OPTIONS : type === 'ESSAY' ? [] : DEFAULT_OPTIONS;

    updateForm({ type, options: nextOptions, correctAnswers: [] });
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    showToast(editingQuestion ? 'Cập nhật thành công!' : 'Đã thêm câu hỏi vào ngân hàng!');
    setTimeout(() => navigate('/teacher/questions'), 900);
  };

  const subjectOptions = mockSubjects.map((subject) => ({
    value: subject.code,
    label: `${subject.code} - ${subject.name}`,
  }));
  const chapterOptions = chapters.map((chapter) => ({ value: chapter.id, label: chapter.name }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader title="Ngân hàng câu hỏi" avatar={mockTeacherUser.avatar} />

        <ToastNotification
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/teacher/questions')}
                title="Quay lại ngân hàng câu hỏi"
                className="p-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[#475569] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">
                  {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
                </h1>
                <p className="text-xs text-[#475569] mt-1">
                  {editingQuestion
                    ? `Đang chỉnh sửa câu ${editingQuestion.code}`
                    : 'Soạn câu hỏi thủ công và lưu vào ngân hàng theo môn học / chương kiến thức.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/teacher/questions')}
                className="px-5 py-2.5 border border-[#E2E8F0] bg-white text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="question-form"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {editingQuestion ? 'Lưu thay đổi' : 'Lưu câu hỏi'}
              </button>
            </div>
          </div>

          <form
            id="question-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
          >
            <div className="xl:col-span-8 space-y-6">
              {/* Phân loại câu hỏi */}
              <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-5">
                <h2 className="text-sm font-bold text-[#0F172A]">Phân loại câu hỏi</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-2">Môn học</label>
                    <CustomDropdown
                      options={subjectOptions}
                      value={form.subjectCode}
                      onChange={(value) => {
                        const nextSubject = mockSubjects.find((subject) => subject.code === value);
                        updateForm({
                          subjectCode: value,
                          chapterId: nextSubject?.chapters[0]?.id ?? '',
                        });
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-2">
                      Chương kiến thức
                    </label>
                    <CustomDropdown
                      options={chapterOptions}
                      value={form.chapterId}
                      onChange={(value) => updateForm({ chapterId: value })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Loại câu hỏi</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleTypeChange(value)}
                        className={`px-3 py-3 border rounded-[12px] text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                          form.type === value
                            ? 'border-[#06B6D4] bg-[#F0FDFA] text-[#0F172A]'
                            : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#06B6D4]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Độ khó</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateForm({ difficulty: value })}
                        className={`px-4 py-2 border rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                          form.difficulty === value
                            ? 'border-[#06B6D4] bg-[#F0FDFA] text-[#0891B2]'
                            : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#06B6D4]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
{/* Nội dung câu hỏi & đáp án */}
              <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-5">
                <h2 className="text-sm font-bold text-[#0F172A]">Nội dung câu hỏi</h2>

                <textarea
                  required
                  rows={3}
                  value={form.content}
                  onChange={(event) => updateForm({ content: event.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3.5 py-3 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4] transition-colors resize-y"
                ></textarea>

                {form.type === 'ESSAY' ? (
                  <EssayKeywordEditor
                    keywords={form.keywords}
                    matchMode={form.matchMode}
                    caseSensitive={form.caseSensitive}
                    onChange={(patch) => updateForm(patch)}
                  />
                ) : form.type === 'TRUE_FALSE' ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-2">
                      Đáp án đúng của câu Đúng / Sai
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {TRUE_FALSE_OPTIONS.map((option) => {
                        const isCorrect = form.correctAnswers.includes(option.key);

                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => updateForm({ correctAnswers: [option.key] })}
                            className={`flex items-center justify-center gap-2 py-5 border-2 rounded-[16px] text-sm font-bold transition-colors cursor-pointer ${
                              isCorrect
                                ? 'border-[#06B6D4] bg-[#F0FDFA] text-[#0891B2]'
                                : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#06B6D4]'
                            }`}
                          >
                            {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                            {option.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <OptionEditor
                    type={form.type}
                    options={form.options}
                    correctAnswers={form.correctAnswers}
                    onChangeOptions={(options) => updateForm({ options })}
                    onChangeCorrect={(correctAnswers) => updateForm({ correctAnswers })}
                  />
                )}
              </section>

              {/* Lời giải chi tiết */}
              <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-bold text-[#0F172A]">Lời giải chi tiết</h2>
                </div>

                <textarea
                  rows={4}
                  value={form.explanation}
                  onChange={(event) => updateForm({ explanation: event.target.value })}
                  placeholder="Giải thích đáp án đúng sẽ hiển thị cho sinh viên ở màn hình xem lại bài làm."
                  className="w-full px-3.5 py-3 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4] transition-colors resize-y"
                ></textarea>
              </section>
            </div>

            {/* Cột phải: xem trước & gợi ý */}
            <aside className="xl:col-span-4 space-y-6 xl:sticky xl:top-24">
              <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-[#06B6D4]" />
                  <h2 className="text-sm font-bold text-[#0F172A]">Xem trước câu hỏi</h2>
                </div>

                <span className="inline-block px-2 py-1 bg-[#F1F5F9] text-[#475569] rounded text-[10px] font-semibold mb-3">
                  {QUESTION_TYPE_LABELS[form.type]}
                </span>

                <p className="text-xs font-bold text-[#0F172A] leading-relaxed mb-4">
                  {form.content || 'Nội dung câu hỏi sẽ hiển thị tại đây.'}
                </p>

                {form.type === 'ESSAY' ? (
                  <div className="p-3 border border-dashed border-[#CBD5E1] rounded-[8px] text-[11px] text-[#94A3B8]">
                    Thí sinh nhập câu trả lời ngắn / điền từ khóa.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {form.options.map((option) => {
                      const isCorrect = form.correctAnswers.includes(option.key);

                      return (
                        <li
                          key={option.key}
                          className={`flex items-start gap-2 px-3 py-2 border rounded-[8px] text-[11px] ${
                            isCorrect
                              ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857]'
                              : 'border-[#E2E8F0] text-[#475569]'
                          }`}
                        >
                          <span className="font-bold shrink-0">{option.key}.</span>
                          <span className="flex-1">{option.text || 'Chưa nhập nội dung'}</span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {form.correctAnswers.length === 0 && form.type !== 'ESSAY' && (
                  <p className="flex items-center gap-1.5 text-[11px] text-[#EF4444] font-medium mt-4">
                    <XCircle className="w-3.5 h-3.5" />
                    Chưa chọn đáp án đúng.
                  </p>
                )}
              </section>

              <section className="bg-[#E0F2FE]/40 border border-[#BAE6FD] rounded-[24px] p-6 text-[11px] text-[#0369A1] leading-relaxed">
                <p className="font-bold mb-2">Gợi ý soạn câu hỏi</p>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>Trắc nghiệm 1 đáp án cần 4 phương án và đúng 1 đáp án duy nhất.</li>
                  <li>Trắc nghiệm nhiều đáp án phải có tối thiểu 2 đáp án đúng.</li>
                  <li>Câu tự luận ngắn nên cấu hình 2–4 từ khóa chấp nhận để tránh chấm sai.</li>
                </ul>
              </section>
            </aside>
          </form>
        </main>
      </div>
    </div>
  );
}
