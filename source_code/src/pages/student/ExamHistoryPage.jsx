import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import StudentHeader from '../../components/common/StudentHeader';
import CustomDropdown from '../../components/common/CustomDropdown';
import ViewOfficialRecordModal from '../../components/exam/ViewOfficialRecordModal';
import { mockHistoryExams, getHistoryExamConfig, mockStudentExams, canRetakeStudentExam, advanceStudentExamAttempt } from '../../data/student';
import { mockCurrentUser } from '../../data/shared/authAccounts';
import { getExamAccess } from '../../utils/examAccess';
import { SEMESTER_OPTIONS } from '../../data/shared/semesters';
import { EXAM_CATEGORIES } from '../../data/teacher/mockExams';
import { getSubjectById } from '../../data/teacher/mockSubjects';

const accessFor = (exam, result = exam) => getExamAccess({ ...exam, config: getHistoryExamConfig(exam) }, result);

export default function ExamHistoryPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  const [activeModalExam, setActiveModalExam] = useState(null);
  const [activeOfficialRecord, setActiveOfficialRecord] = useState(null);

  const historySemesters = new Set(mockHistoryExams.map((exam) => exam.semester));
  const semesterOptions = [
    { value: 'ALL', label: 'Tất cả học kỳ' },
    ...SEMESTER_OPTIONS.filter((option) => historySemesters.has(option.value)),
  ];

  const historyCategories = new Set(mockHistoryExams.map((exam) => exam.category));
  const categoryOptions = [
    { value: 'ALL', label: 'Tất cả loại kỳ thi' },
    ...EXAM_CATEGORIES.filter((option) => historyCategories.has(option.value)),
  ];

  const subjectOptions = [
    { value: 'ALL', label: 'Tất cả môn học' },
    ...[...new Set(mockHistoryExams.map((exam) => exam.subjectCode))].map((code) => ({
      value: code,
      label: getSubjectById(code)?.name ?? code,
    })),
  ];

  const filteredHistory = mockHistoryExams.filter(exam => {
    const matchSearch = exam.examCode.toLowerCase().includes(searchTerm.toLowerCase()) || exam.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSemester = selectedSemester === 'ALL' || exam.semester === selectedSemester;
    const matchCategory = selectedCategory === 'ALL' || exam.category === selectedCategory;
    const matchSubject = selectedSubject === 'ALL' || exam.subjectCode === selectedSubject;
    return matchSearch && matchSemester && matchCategory && matchSubject;
  });

  const retakeExam = mockStudentExams.find((exam) => exam.id === activeModalExam?.id);
  const canRetake = canRetakeStudentExam(retakeExam);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <StudentHeader avatar={mockCurrentUser.student.avatar} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 mb-6 shadow-sm">
            <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Lịch sử & kết quả các bài kiểm tra
            </h1>
            <p className="text-xs text-[#475569] mt-1">
                Tra cứu các bài kiểm tra và xem lại lời giải thích chi tiết
            </p>
        </div>

        {/* Thanh tìm kiếm mở rộng flex-1 & Dropdown lọc */}
        <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo kỳ thi, môn học"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-xs focus:outline-none focus:border-[#06B6D4] transition-colors shadow-sm"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
            <CustomDropdown 
              options={semesterOptions}
              value={selectedSemester}
              onChange={setSelectedSemester}
              className="w-44"
            />

            <CustomDropdown 
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-44"
            />

            <CustomDropdown 
              options={subjectOptions}
              value={selectedSubject}
              onChange={setSelectedSubject}
              className="w-48"
            />
          </div>
        </div>

        {/* Lưới danh sách bài kiểm tra */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredHistory.map((exam) => (
            <div key={exam.id} className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-[#475569] rounded text-[11px] font-semibold mb-3">
                  {exam.category}
                </span>

                <h3 className="text-sm font-bold text-[#0F172A] mb-1">
                  Kỳ thi: {exam.examCode}
                </h3>
                <p className="text-xs text-[#475569] mb-4">
                  {exam.subjectName}
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] text-[#475569] mb-4">
                  <span className="px-2 py-0.5 bg-slate-100 rounded">{exam.subjectCode}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">{exam.room}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">{exam.questionsCount} câu</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">{exam.durationMinutes} phút</span>
                </div>

                <div className="space-y-1 text-xs text-[#475569] border-t border-[#E2E8F0] pt-3 mb-6">
                  <div>Thời gian nộp: <span className="font-semibold text-[#0F172A]">{exam.submittedAt}</span></div>
                  <div>Lượt làm: <span className="font-semibold text-[#0F172A]">{exam.attempt}</span></div>
                  <div>Điểm số: <span className="font-bold text-[#06B6D4] text-sm">{accessFor(exam).canShowScore ? `${exam.score} / ${exam.scale}` : 'Chưa công bố'}</span></div>
                </div>
              </div>

              <button
                onClick={() => setActiveModalExam(exam)}
                className="w-full py-2.5 border border-[#06B6D4] text-[#06B6D4] hover:bg-sky-50 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer"
              >
                Xem kết quả
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL SV_XemKetQua: max-w-4xl, KHÔNG NÚT ĐÓNG THỪA */}
      {activeModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl p-6 md:p-8 max-w-4xl w-full border border-[#E2E8F0] relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
              <h3 className="text-base font-bold text-[#0F172A]">Xem kết quả chi tiết</h3>
              <button onClick={() => setActiveModalExam(null)} className="text-[#94A3B8] hover:text-[#0F172A] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left mb-6 min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#94A3B8]">
                    <th className="pb-3 w-10">STT</th>
                    <th className="pb-3">KỲ THI</th>
                    <th className="pb-3">MÔN HỌC</th>
                    <th className="pb-3">THỜI GIAN NỘP</th>
                    <th className="pb-3 text-center">LƯỢT LÀM</th>
                    <th className="pb-3 text-center">ĐIỂM SỐ</th>
                    <th className="pb-3 text-center">TRẠNG THÁI</th>
                    <th className="pb-3 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {activeModalExam.attemptsList?.map((att, i) => (
                    <tr key={i}>
                      <td className="py-3.5 font-semibold text-[#0F172A]">{i + 1}</td>
                      <td className="py-3.5 font-semibold text-[#0F172A]">{att.examCode}</td>
                      <td className="py-3.5 text-[#475569]">{att.subjectName}</td>
                      <td className="py-3.5 text-[#475569]">{att.submittedAt}</td>
                      <td className="py-3.5 text-[#475569] text-center">{att.attemptNumber}</td>
                      <td className="py-3.5 font-bold text-[#06B6D4] text-center">{accessFor(activeModalExam, att).canShowScore ? att.score : 'Chưa công bố'}</td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          att.isSuspended ? 'bg-red-50 text-[#EF4444]' : 'bg-emerald-50 text-[#10B981]'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {att.isSuspended && att.report && (
                            <button
                              onClick={() => setActiveOfficialRecord(att.report)}
                              className="px-3 py-1 bg-white text-[#06B6D4] border border-[#06B6D4] hover:bg-sky-50 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Xem biên bản
                            </button>
                          )}
                          <button
                            disabled={!accessFor(activeModalExam, att).canReview}
                            onClick={() => {
                              setActiveModalExam(null);
                              navigate(`/student/exam-review/${activeModalExam.id}?attempt=${att.attemptNumber.split('/')[0]}`);
                            }}
                            className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                              accessFor(activeModalExam, att).canReview
                                ? 'bg-[#06B6D4] text-white hover:bg-[#0891B2] cursor-pointer' 
                                : 'bg-slate-100 text-[#CBD5E1] cursor-not-allowed'
                            }`}
                          >
                            Xem lại bài làm
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chỉ giữ lại nút Làm lại khi còn lượt */}
            <div className="flex items-center justify-end pt-4 border-t border-[#E2E8F0]">
              <button
                disabled={!canRetake}
                onClick={() => {
                  if (!retakeExam || !advanceStudentExamAttempt(retakeExam.id)) return;
                  setActiveModalExam(null);
                  navigate(`/student/exam-detail/${retakeExam.id}`);
                }}
                className={`px-6 py-2.5 text-xs font-semibold rounded-[8px] transition-colors ${
                  canRetake
                    ? 'border border-[#06B6D4] text-[#06B6D4] hover:bg-sky-50 cursor-pointer'
                    : 'border border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                }`}
              >
                Làm lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL M.08 XEM BIÊN BẢN VI PHẠM READ-ONLY */}
      <ViewOfficialRecordModal 
        isOpen={!!activeOfficialRecord}
        onClose={() => setActiveOfficialRecord(null)}
        record={activeOfficialRecord}
      />

      <footer className="text-center text-xs text-[#94A3B8] py-4 border-t border-[#E2E8F0]">
        © 2026 EduTesting - Nền tảng khảo thí trực tuyến thông minh
      </footer>
    </div>
  );
}
