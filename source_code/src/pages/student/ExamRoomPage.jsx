import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Send, Flag, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import WarningTabModal from '../../components/exam/WarningTabModal';
import ConfirmSubmitModal from '../../components/exam/ConfirmSubmitModal';
import TimeoutModal from '../../components/exam/TimeoutModal';
import SuspendExamModal from '../../components/exam/SuspendExamModal';
import { mockStudentExams, mockQuestionsData, canEnterStudentExam, getStudentExamConfig } from '../../data/student';

export default function ExamRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const exam = mockStudentExams.find(e => e.id === id);
  if (!canEnterStudentExam(exam)) return <main className="p-8 text-center">
    <p>{exam ? 'Bài thi chưa mở hoặc lượt thi không hợp lệ.' : 'Không tìm thấy bài thi.'}</p>
    <button onClick={() => navigate('/student/exams')}>Quay về danh sách bài thi</button>
  </main>;
  return <ExamSession key={exam.id} exam={exam} />;
}

function ExamSession({ exam }) {
  const navigate = useNavigate();
  const antiCheat = getStudentExamConfig(exam).antiCheat;
  const questions = mockQuestionsData;
  const totalQuestions = questions.length;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  // Chặn nút Back & Forward của trình duyệt
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [violationCount, setViolationCount] = useState(0);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const isTimeoutOpen = timeLeft <= 0 && !isSuspendOpen;

  const lastViolationTimeRef = useRef(0);
  const violationCountRef = useRef(0);
  // Đếm ngược đồng hồ
  useEffect(() => {
    if (timeLeft <= 0 || isSuspendOpen) return;
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSuspendOpen]);


  const formatMinutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const formatSeconds = (timeLeft % 60).toString().padStart(2, '0');
  const isTimeCritical = timeLeft <= 300;

  // HỆ THỐNG GIÁM SÁT GIAN LẬN TOÀN DIỆN (CHUYỂN TAB + THU NHỎ CỬA SỔ + CLICK RA NGOÀI)
  useEffect(() => {
    if (!antiCheat || isTimeoutOpen || isSuspendOpen) return;
    const triggerViolation = () => {
      const now = Date.now();
      // Chặn kích hoạt liên tục trong vòng 1.5 giây
      if (now - lastViolationTimeRef.current < 1500) return;
      lastViolationTimeRef.current = now;

      if (!isConfirmSubmitOpen && !isTimeoutOpen && !isSuspendOpen) {
        const next = violationCountRef.current + 1;
        violationCountRef.current = next;
        setViolationCount(next);
        if (next >= 3) {
          setIsConfirmSubmitOpen(false);
          setIsWarningOpen(false);
          setIsSuspendOpen(true);
        } else {
          setIsWarningOpen(true);
        }
      }
    };

    // 1. Kiểm tra chuyển tab / ẩn tab
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Ẩn tab / Chuyển tab');
      }
    };

    // 2. Kiểm tra click ra ngoài cửa sổ thi / nhảy sang ứng dụng khác
    const handleBlur = () => {
      triggerViolation('Mất tiêu điểm cửa sổ');
    };

    // 3. Kiểm tra thu nhỏ kích thước cửa sổ (Resize dưới 85% màn hình)
    const handleResize = () => {
      const isWindowTooSmall = 
        window.innerWidth < screen.availWidth * 0.85 || 
        window.innerHeight < screen.availHeight * 0.85;

      if (isWindowTooSmall) {
        triggerViolation('Thu nhỏ cửa sổ trình duyệt');
      }
    };

    // 4. Kiểm tra ngay khi vừa mount component (Phát hiện thu nhỏ sẵn từ trước)
    const checkInitialScreenSize = () => {
      const isWindowTooSmall = 
        window.innerWidth < screen.availWidth * 0.85 || 
        window.innerHeight < screen.availHeight * 0.85;
      if (isWindowTooSmall) {
        triggerViolation('Cửa sổ không đạt chuẩn toàn màn hình khi bắt đầu');
      }
    };

    const initialCheck = setTimeout(checkInitialScreenSize, 0);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initialCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
    };
  }, [antiCheat, isConfirmSubmitOpen, isTimeoutOpen, isSuspendOpen]);

  const triggerAutoSave = () => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaveStatus('saved'), 600);
  };

  const handleSelectSingle = (qIndex, val) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: val }));
    triggerAutoSave();
  };

  const handleSelectMultiple = (qIndex, val) => {
    const currentList = Array.isArray(answers[qIndex]) ? answers[qIndex] : [];
    const updated = currentList.includes(val)
      ? currentList.filter((item) => item !== val)
      : [...currentList, val];
    setAnswers((prev) => ({ ...prev, [qIndex]: updated }));
    triggerAutoSave();
  };

  const handleTextChange = (qIndex, text) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: text }));
    triggerAutoSave();
  };

  const toggleFlag = (qIndex) => {
    setFlags((prev) => ({ ...prev, [qIndex]: !prev[qIndex] }));
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter((k) => {
    const val = answers[k];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== '';
  }).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = Object.values(flags).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none">
      {/* HEADER PHÒNG THI */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-40 relative">
        <div className="z-10">
          <h2 className="text-sm font-bold text-[#0F172A]">{exam.subjectName}</h2>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">
            {exam.semester} • Mã MH: {exam.subjectCode} • Mã đề: {exam.testCode}
          </p>
        </div>

        {/* Đồng hồ căn chính giữa */}
        <div className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className={`px-6 py-2 rounded-[8px] border text-center transition-colors pointer-events-auto ${
            isTimeCritical 
              ? 'bg-[#FEE2E2] border-[#EF4444] text-[#EF4444]' 
              : 'bg-white border-[#06B6D4] text-[#06B6D4]'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 stroke-[2.5]" />
              <span className="text-xl font-black font-mono tracking-tight leading-none">
                {formatMinutes}:{formatSeconds}
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#64748B] block mt-0.5">
              {isTimeCritical ? 'Sắp hết giờ!' : 'Thời gian còn lại'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 z-10">
          <div className="w-28 flex items-center justify-end text-xs font-semibold">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1.5 text-[#06B6D4]">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Đang lưu...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <Check className="w-4 h-4 stroke-[3] shrink-0" />
                <span>Đã lưu</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setIsConfirmSubmitOpen(true)}
            className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-600 text-white text-xs font-bold rounded-[8px] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            Nộp bài
          </button>
        </div>
      </header>

      {/* VÙNG THI CỬ CHÍNH */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KHUNG CÂU HỎI (8 CỘT) */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-[24px] p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[540px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
              <span className="text-xs font-bold text-[#06B6D4]">
                Câu hỏi {currentQuestionIndex + 1}:
              </span>
              <span className="text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                {currentQ.typeLabel}
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#0F172A] leading-relaxed mb-6">
              {currentQ.title}
            </h3>

            {/* DẠNG 1: TRẮC NGHIỆM 1 ĐÁP ÁN (MCQ_SINGLE) */}
            {currentQ.type === 'MCQ_SINGLE' && (
              <div className="space-y-3 text-xs">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQuestionIndex] === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectSingle(currentQuestionIndex, opt.key)}
                      className={`p-4 rounded-[12px] border flex items-center gap-3.5 cursor-pointer transition-all select-none ${
                        isSelected 
                          ? 'border-[#06B6D4] bg-[#F0FDFA] font-bold text-[#0F172A]' 
                          : 'border-[#E2E8F0] hover:bg-slate-50 text-[#475569]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#06B6D4]' : 'border-[#CBD5E1] bg-white'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></div>}
                      </div>
                      <span>{opt.key}. {opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 2: CHỌN NHIỀU ĐÁP ÁN (MCQ_MULTIPLE) */}
            {currentQ.type === 'MCQ_MULTIPLE' && (
              <div className="space-y-3 text-xs">
                {currentQ.options.map((opt) => {
                  const selectedList = Array.isArray(answers[currentQuestionIndex]) ? answers[currentQuestionIndex] : [];
                  const isSelected = selectedList.includes(opt.key);
                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectMultiple(currentQuestionIndex, opt.key)}
                      className={`p-4 rounded-[12px] border flex items-center gap-3.5 cursor-pointer transition-all select-none ${
                        isSelected 
                          ? 'border-[#06B6D4] bg-[#F0FDFA] font-bold text-[#0F172A]' 
                          : 'border-[#E2E8F0] hover:bg-slate-50 text-[#475569]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-[#06B6D4] border-[#06B6D4]' : 'border-[#CBD5E1] bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <span>{opt.key}. {opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 3: ĐÚNG / SAI (TRUE_FALSE) */}
            {currentQ.type === 'TRUE_FALSE' && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQuestionIndex] === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectSingle(currentQuestionIndex, opt.key)}
                      className={`p-5 rounded-[12px] border flex items-center justify-center gap-3 cursor-pointer transition-all select-none ${
                        isSelected 
                          ? 'border-[#06B6D4] bg-[#F0FDFA] text-[#06B6D4] font-bold shadow-sm' 
                          : 'border-[#E2E8F0] hover:bg-slate-50 text-[#475569]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#06B6D4]' : 'border-[#CBD5E1] bg-white'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></div>}
                      </div>
                      <span className="text-sm font-semibold">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 4: TỰ LUẬN / ĐIỀN TỪ (ESSAY) */}
            {currentQ.type === 'ESSAY' && (
              <div>
                <textarea
                  rows="5"
                  placeholder="Nhập câu trả lời của bạn tại đây..."
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleTextChange(currentQuestionIndex, e.target.value)}
                  className="w-full p-4 border border-[#E2E8F0] rounded-[12px] text-xs focus:outline-none focus:border-[#06B6D4] transition-colors leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Điều hướng Trước / Đánh dấu / Tiếp theo */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E2E8F0] mt-8 text-xs">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className={`px-5 py-2.5 border border-[#E2E8F0] rounded-[8px] font-bold flex items-center gap-1.5 ${
                currentQuestionIndex === 0 ? 'text-[#CBD5E1] cursor-not-allowed' : 'text-[#475569] hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>

            <button
              onClick={() => toggleFlag(currentQuestionIndex)}
              className="px-5 py-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] border border-[#FDE68A] rounded-[8px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Flag className={`w-3.5 h-3.5 ${flags[currentQuestionIndex] ? 'fill-[#D97706]' : ''}`} />
              Đánh dấu
            </button>

            <button
              disabled={currentQuestionIndex === totalQuestions - 1}
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className={`px-6 py-2.5 rounded-[8px] font-bold flex items-center gap-1.5 transition-colors ${
                currentQuestionIndex === totalQuestions - 1 
                  ? 'bg-slate-200 text-[#94A3B8] cursor-not-allowed' 
                  : 'bg-[#06B6D4] hover:bg-[#0891B2] text-white cursor-pointer shadow-sm'
              }`}
            >
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BẢNG CÂU HỎI & CHÚ GIẢI (4 CỘT) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase">Bảng câu hỏi</h3>
              <span className="text-[11px] font-bold text-[#06B6D4]">
                {answeredCount}/{totalQuestions} đã làm
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {Array.from({ length: totalQuestions }).map((_, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const hasAnswer = answers[idx] !== undefined && (Array.isArray(answers[idx]) ? answers[idx].length > 0 : answers[idx] !== '');
                const isFlagged = flags[idx];

                let btnStyle = "border-[#E2E8F0] bg-white text-[#475569]";
                if (hasAnswer) btnStyle = "bg-[#06B6D4] text-white border-[#06B6D4] font-bold";
                if (isCurrent) btnStyle += " ring-2 ring-[#06B6D4] ring-offset-2";

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 rounded-[8px] border text-xs font-semibold flex items-center justify-center transition-all relative cursor-pointer ${btnStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EF4444] rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#E2E8F0] pt-4">
              <div className="text-[11px] font-bold text-[#94A3B8] uppercase mb-3">Chú giải trạng thái</div>
              <div className="grid grid-cols-2 gap-y-2.5 text-xs text-[#475569]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded border-2 border-[#06B6D4] bg-white"></span>
                  <span>Câu hiện tại</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#06B6D4]"></span>
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full"></span>
                  </span>
                  <span>Đánh dấu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded border border-[#E2E8F0] bg-white"></span>
                  <span>Chưa trả lời</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[16px] text-[11px] text-[#64748B] leading-relaxed">
            <span className="font-bold text-[#0F172A] block mb-1">LƯU Ý</span>
            Việc đóng trình duyệt, mở tab mới hoặc chuyển sang ứng dụng khác trong quá trình làm bài sẽ tự động thông báo cho giám thị và bài thi của bạn sẽ bị đánh dấu[cite: 56].
          </div>
        </div>
      </main>

      <WarningTabModal
        isOpen={isWarningOpen}
        violationCount={violationCount}
        onContinue={() => setIsWarningOpen(false)}
      />

      <SuspendExamModal
        isOpen={isSuspendOpen}
        onLeave={() => {
          navigate(`/student/exam-result/${exam.id}?suspended=true`);
        }}
      />

      <ConfirmSubmitModal
        isOpen={isConfirmSubmitOpen}
        answered={answeredCount}
        total={totalQuestions}
        unanswered={unansweredCount}
        flagged={flaggedCount}
        timeLeft={`${formatMinutes}:${formatSeconds}`}
        onClose={() => setIsConfirmSubmitOpen(false)}
        onSubmit={() => navigate(`/student/exam-result/${exam.id}`)}
      />

      <TimeoutModal
        isOpen={isTimeoutOpen}
        onDirectToResult={() => navigate(`/student/exam-result/${exam.id}`)}
      />
    </div>
  );
}
