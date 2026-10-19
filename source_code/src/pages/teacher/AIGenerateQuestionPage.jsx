import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wand2, FileText, Loader2, Save, Info, BookmarkPlus } from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import ToastNotification from '../../components/common/ToastNotification';
import CustomDropdown from '../../components/common/CustomDropdown';
import AIQuestionPreviewCard from './components/AIQuestionPreviewCard';
import {
  mockSubjects,
  mockTeacherUser,
  mockAIGenerateConfig,
  mockAIGeneratedQuestions,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from '../../data/teacher';

/** Thời gian mô phỏng gọi API AI (ms) thay bằng thời gian thực khi ghép Backend. */
const AI_GENERATE_DELAY = 1800;

export default function AIGenerateQuestionPage() {
  const navigate = useNavigate();

  const [subjectCode, setSubjectCode] = useState(mockSubjects[0].code);
  const [chapterId, setChapterId] = useState(mockSubjects[0].chapters[0].id);
  const [quantity, setQuantity] = useState(5);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questionType, setQuestionType] = useState('MCQ_SINGLE');
  const [contextText, setContextText] = useState('');

  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const chapters = useMemo(
    () => mockSubjects.find((subject) => subject.code === subjectCode)?.chapters ?? [],
    [subjectCode]
  );

  const subjectOptions = mockSubjects.map((subject) => ({
    value: subject.code,
    label: `${subject.code} - ${subject.name}`,
  }));
  const chapterOptions = chapters.map((chapter) => ({ value: chapter.id, label: chapter.name }));
  const quantityOptions = mockAIGenerateConfig.quantityOptions.map((value) => ({
    value,
    label: `${value} câu hỏi`,
  }));
  const difficultyOptions = Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label }));
  const typeOptions = Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  /** POST /ai/generate-questions */
  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const sample = mockAIGeneratedQuestions.slice(0, Math.min(quantity, mockAIGeneratedQuestions.length));
      setGeneratedQuestions(
        sample.map((question) => ({ ...question, subjectCode, chapterId, difficulty }))
      );
      setSavedIds([]);
      setIsGenerating(false);
      showToast(`AI đã sinh ${sample.length} câu hỏi. Vui lòng duyệt trước khi lưu.`);
    }, AI_GENERATE_DELAY);
  };

  /** Sinh lại riêng một câu hỏi chưa đạt yêu cầu. */
  const handleRegenerate = (questionId) => {
    setRegeneratingId(questionId);

    setTimeout(() => {
      setGeneratedQuestions((current) =>
        current.map((question) =>
          question.id === questionId
            ? { ...question, confidence: Math.min(99, question.confidence + 3) }
            : question
        )
      );
      setRegeneratingId(null);
      showToast('Đã sinh lại câu hỏi với nội dung cải tiến.');
    }, 900);
  };

  /** Lưu câu hỏi vào mock data nhưng GIỮ NGUYÊN người dùng ở trang hiện tại. */
  const saveQuestions = (questionIds) => {
    const newlySaved = questionIds.filter((id) => !savedIds.includes(id));
    setSavedIds((current) => Array.from(new Set([...current, ...questionIds])));
    setSelectedIds((current) => current.filter((id) => !questionIds.includes(id)));
    return newlySaved.length;
  };

  const handleSaveOne = (questionId) => {
    const saved = saveQuestions([questionId]);
    showToast(
      saved > 0
        ? 'Đã lưu câu hỏi vào ngân hàng. Bạn có thể tiếp tục chọn hoặc sinh các câu còn lại.'
        : 'Câu hỏi này đã được lưu trước đó.'
    );
  };

  /** Nút "Lưu các câu đã chọn": lưu đúng các câu được tick, không điều hướng đi đâu. */
  const handleSaveSelected = () => {
    if (selectedIds.length === 0) return;
    const saved = saveQuestions(selectedIds);
    showToast(
      `Đã lưu ${saved} câu hỏi đã chọn vào ngân hàng. Bạn vẫn đang ở trang Sinh câu hỏi AI để tiếp tục làm việc.`
    );
  };

  const handleSaveAll = () => {
    const ids = generatedQuestions.map((question) => question.id);
    const saved = saveQuestions(ids);
    showToast(`Đã lưu ${saved} câu hỏi vào ngân hàng. Trang hiện tại được giữ nguyên.`);
  };

  const handleToggleSelect = (questionId) => {
    setSelectedIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    );
  };

  /** Cập nhật nội dung câu hỏi sau khi chỉnh sửa trực tiếp trên thẻ. */
  const handleChangeQuestion = (updatedQuestion) => {
    setGeneratedQuestions((current) =>
      current.map((question) => (question.id === updatedQuestion.id ? updatedQuestion : question))
    );
    showToast('Đã cập nhật nội dung câu hỏi.');
  };

  /** Xóa một câu hỏi AI không đạt khỏi danh sách xem trước. */
  const handleDeleteQuestion = (questionId) => {
    setGeneratedQuestions((current) => current.filter((question) => question.id !== questionId));
    setSavedIds((current) => current.filter((id) => id !== questionId));
    setSelectedIds((current) => current.filter((id) => id !== questionId));
    showToast('Đã xóa câu hỏi khỏi danh sách xem trước.');
  };

  const allSaved = generatedQuestions.length > 0 && savedIds.length === generatedQuestions.length;

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

        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                <h1 className="text-2xl font-bold text-[#0F172A]">Sinh câu hỏi bằng AI</h1>
                <p className="text-xs text-[#475569] mt-1">
                  Dán nội dung bài giảng, AI phân tích và đề xuất câu hỏi kèm đáp án, phương án nhiễu và lời giải.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/teacher/questions')}
                className="px-5 py-2.5 border border-[#E2E8F0] bg-white text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Quay lại
              </button>

              {generatedQuestions.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveSelected}
                    disabled={selectedIds.length === 0}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-[8px] transition-colors border ${
                      selectedIds.length === 0
                        ? 'bg-slate-100 text-[#94A3B8] border-slate-200 cursor-not-allowed'
                        : 'bg-white border-[#06B6D4] text-[#0891B2] hover:bg-[#E0F2FE]/50 cursor-pointer'
                    }`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    Lưu các câu đã chọn ({selectedIds.length})
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={allSaved}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-[8px] transition-colors shadow-sm ${
                      allSaved
                        ? 'bg-slate-100 text-[#94A3B8] cursor-not-allowed'
                        : 'bg-[#06B6D4] hover:bg-[#0891B2] text-white cursor-pointer'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {allSaved ? 'Đã lưu tất cả' : `Lưu tất cả (${generatedQuestions.length - savedIds.length})`}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Cột trái: cấu hình sinh câu hỏi */}
            <section className="xl:col-span-5 bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#06B6D4]" />
                <h2 className="text-sm font-bold text-[#0F172A]">Cấu hình sinh câu hỏi</h2>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#475569]">
                    Văn bản ngữ cảnh bài giảng / tài liệu
                  </label>
                  <button
                    type="button"
                    onClick={() => setContextText(mockAIGenerateConfig.sampleContext)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#06B6D4] hover:underline cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Dùng văn bản mẫu
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={contextText}
                  onChange={(event) => setContextText(event.target.value)}
                  placeholder="Dán nội dung bài giảng, tóm tắt chương hoặc ghi chú môn học tại đây..."
                  className="w-full px-3.5 py-3 text-xs border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4] transition-colors resize-y leading-relaxed"
                ></textarea>
                <p className="text-[10px] text-[#94A3B8] mt-1.5">
                  {contextText.trim().length} ký tự · Nên từ 500 ký tự trở lên để AI sinh câu hỏi chính xác.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Môn học</label>
                  <CustomDropdown
                    options={subjectOptions}
                    value={subjectCode}
                    onChange={(value) => {
                      const nextSubject = mockSubjects.find((subject) => subject.code === value);
                      setSubjectCode(value);
                      setChapterId(nextSubject?.chapters[0]?.id ?? '');
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Chương kiến thức</label>
                  <CustomDropdown
                    options={chapterOptions}
                    value={chapterId}
                    onChange={setChapterId}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Số lượng câu hỏi</label>
                  <CustomDropdown
                    options={quantityOptions}
                    value={quantity}
                    onChange={setQuantity}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-2">Độ khó</label>
                  <CustomDropdown
                    options={difficultyOptions}
                    value={difficulty}
                    onChange={setDifficulty}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-2">Dạng câu hỏi</label>
                <CustomDropdown
                  options={typeOptions}
                  value={questionType}
                  onChange={setQuestionType}
                  className="w-full"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || contextText.trim() === ''}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-[8px] transition-colors shadow-sm ${
                  isGenerating || contextText.trim() === ''
                    ? 'bg-slate-100 text-[#94A3B8] cursor-not-allowed'
                    : 'bg-[#06B6D4] hover:bg-[#0891B2] text-white cursor-pointer'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI đang phân tích tài liệu...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Sinh câu hỏi bằng AI
                  </>
                )}
              </button>

              {contextText.trim() === '' && (
                <p className="flex items-start gap-1.5 text-[11px] text-[#D97706]">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Vui lòng dán văn bản ngữ cảnh trước khi sinh câu hỏi.
                </p>
              )}
            </section>

            {/* Cột phải: danh sách xem trước */}
            <section className="xl:col-span-7 space-y-4">
<div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Danh sách câu hỏi AI đề xuất
                </h2>
                {generatedQuestions.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#475569]">
                    {savedIds.length}/{generatedQuestions.length} đã lưu
                  </span>
                )}
              </div>

              {isGenerating && (
                <div className="space-y-4">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-sm animate-pulse"
                    >
                      <div className="h-3 w-32 bg-slate-200 rounded mb-3"></div>
                      <div className="h-3 w-full bg-slate-100 rounded mb-2"></div>
                      <div className="h-3 w-3/4 bg-slate-100 rounded mb-4"></div>
                      <div className="h-10 w-full bg-slate-50 rounded"></div>
                    </div>
                  ))}
                </div>
              )}

              {!isGenerating && generatedQuestions.length === 0 && (
                <div className="bg-white border border-dashed border-[#CBD5E1] rounded-[24px] py-16 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0891B2] mx-auto mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] mb-1">Chưa có câu hỏi nào được sinh</p>
                  <p className="text-xs text-[#475569] leading-relaxed max-w-md mx-auto">
                    Dán văn bản ngữ cảnh bài giảng ở cột bên trái, chọn môn học, chương, độ khó và số lượng
                    rồi bấm "Sinh câu hỏi bằng AI". Kết quả sẽ xuất hiện tại đây để bạn duyệt trước khi lưu.
                  </p>
                </div>
              )}

              {!isGenerating && generatedQuestions.length > 0 && (
                <div className="space-y-4">
                  {generatedQuestions.map((question) => (
                    <div key={question.id} className="relative">
                      {regeneratingId === question.id && (
                        <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm rounded-[24px] flex items-center justify-center gap-2 text-xs font-semibold text-[#0891B2]">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang sinh lại câu hỏi...
                        </div>
                      )}

                      <AIQuestionPreviewCard
                        question={question}
                        isSaved={savedIds.includes(question.id)}
                        isSelected={selectedIds.includes(question.id)}
                        onToggleSelect={handleToggleSelect}
                        onRegenerate={handleRegenerate}
                        onChange={handleChangeQuestion}
                        onDelete={handleDeleteQuestion}
                        onSave={handleSaveOne}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
