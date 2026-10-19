import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Clock, FileText, CheckCircle2, Award, AlertTriangle, ArrowLeft, Check } from 'lucide-react';
import StudentHeader from '../../components/common/StudentHeader';
import { mockStudentExams, canEnterStudentExam, getStudentExamConfig } from '../../data/student';
import { mockCurrentUser } from '../../data/shared/authAccounts';

export default function ExamDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isAgreed, setIsAgreed] = useState(false);

    const exam = mockStudentExams.find(e => e.id === id);
    const student = mockCurrentUser.student;

    if (!exam) return <main className="p-8 text-center">
        <p>Không tìm thấy bài thi.</p>
        <button onClick={() => navigate('/student/exams')}>Quay về danh sách bài thi</button>
    </main>;
    const canEnter = canEnterStudentExam(exam);
    const antiCheatEnabled = getStudentExamConfig(exam).antiCheat;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <StudentHeader avatar={student.avatar} />

        <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8">
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 md:p-8 shadow-sm">
            {/* Header trạng thái */}
            <div className="mb-6">
                <span className="inline-block px-2.5 py-0.5 bg-red-50 text-[#EF4444] rounded text-[11px] font-bold mb-2">
                {exam.status === 'ACTIVE' ? 'Đang diễn ra' : 'Chưa mở phòng thi'}
                </span>
                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                {exam.subjectName}
                </h1>
                <p className="text-xs text-[#475569] mt-1">
                Kỳ thi: <span className="font-semibold text-[#0F172A]">{exam.examCode}</span> | Mã môn: <span className="font-semibold text-[#0F172A]">{exam.subjectCode}</span> | Học kỳ: <span className="font-semibold text-[#0F172A]">{exam.semester}</span> | Phòng thi: <span className="font-semibold text-[#0F172A]">{exam.room}</span>
                </p>
            </div>

            {/* Student Summary Strip */}
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 mb-6 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center text-xs divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
                <div className="flex items-center gap-3 pt-2 md:pt-0">
                    <div className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#06B6D4] shrink-0">
                    <User className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                    <div className="text-[11px] text-[#94A3B8]">Thí sinh</div>
                    <div className="font-bold text-[#0F172A] truncate">{student.name}</div>
                    </div>
                </div>

                <div className="pt-2 md:pt-0 md:pl-4">
                    <div className="text-[11px] text-[#94A3B8]">Mã số sinh viên</div>
                    <div className="font-bold text-[#0F172A]">{student.id}</div>
                </div>

                <div className="pt-2 md:pt-0 md:pl-4">
                    <div className="text-[11px] text-[#94A3B8]">Kỳ thi</div>
                    <div className="font-bold text-[#0F172A] truncate">{exam.examCode}</div>
                </div>

                <div className="pt-2 md:pt-0 md:pl-4">
                    <div className="text-[11px] text-[#94A3B8]">Mã đề thi</div>
                    <div className="font-bold text-[#0F172A]">{exam.testCode}</div>
                </div>

                <div className="pt-2 md:pt-0 md:pl-4">
                    <div className="text-[11px] text-[#94A3B8]">Phòng thi</div>
                    <div className="font-bold text-[#0F172A]">{exam.room}</div>
                </div>
                </div>
            </div>

            {/* 4 Thẻ thông số */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
                <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[12px] flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#475569]" />
                <div>
                    <span className="text-[#94A3B8] block text-[11px]">Thời gian làm bài:</span>
                    <span className="font-bold text-[#0F172A]">{exam.durationMinutes} phút</span>
                </div>
                </div>

                <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[12px] flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#475569]" />
                <div>
                    <span className="text-[#94A3B8] block text-[11px]">Số lượng:</span>
                    <span className="font-bold text-[#0F172A]">{exam.questionsCount} câu hỏi</span>
                </div>
                </div>

                <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[12px] flex items-center gap-3">                <CheckCircle2 className="w-5 h-5 text-[#475569]" />
                <div>
                    <span className="text-[#94A3B8] block text-[11px]">Số lượt còn lại:</span>
                    <span className="font-bold text-[#0F172A]">
                        {exam.currentAttempt ?? 1} / {exam.maxAttempts === 0 ? 'Không giới hạn' : (exam.maxAttempts ?? 1)} lượt
                    </span>
                </div>
                </div>

                <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-[12px] flex items-center gap-3">
                <Award className="w-5 h-5 text-[#475569]" />
                <div>
                    <span className="text-[#94A3B8] block text-[11px]">Thang điểm:</span>
                    <span className="font-bold text-[#0F172A]">{exam.scale} điểm</span>
                </div>
                </div>
            </div>

            {/* Quy chế bắt buộc */}
            <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-[16px] mb-6 text-xs space-y-2 text-[#92400E]">
                <h3 className="font-bold text-sm text-[#B45309] mb-1">Quy chế & lưu ý phòng thi bắt buộc</h3>
                <p className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                <span>Hãy giữ cửa sổ làm bài ở trạng thái hiển thị trong suốt lượt thi.</span>
                </p>
                {antiCheatEnabled && (
                <p className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                <span>Chuyển tab, rời hoặc thu nhỏ cửa sổ làm bài sẽ bị ghi nhận. Lần vi phạm thứ 3 sẽ đình chỉ lượt thi.</span>
                </p>
                )}
                <p className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                <span>Bản demo giữ câu trả lời khi trang đang mở; hãy nộp bài trước khi đóng trang.</span>
                </p>
                <p className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                <span>Khi hết giờ đếm ngược, bản demo tự kết thúc lượt làm bài.</span>
                </p>
            </div>

            {/* Checkbox cam kết */}
            <div 
                onClick={() => setIsAgreed(!isAgreed)}
                className="flex items-center gap-3 cursor-pointer select-none text-xs text-[#0F172A] font-medium mb-8"
            >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                isAgreed ? 'bg-[#06B6D4] border-[#06B6D4]' : 'border-[#CBD5E1] bg-white'
                }`}>
                {isAgreed && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
                <span>Tôi đã đọc kỹ quy chế và cam kết làm bài nghiêm túc, trung thực.</span>
            </div>

            {/* 2 nút thao tác */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                onClick={() => navigate('/student/exams')}
                className="px-6 py-2.5 border border-[#E2E8F0] text-[#475569] text-xs font-semibold rounded-[8px] hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
                </button>
                <button
                disabled={!isAgreed || !canEnter}
                onClick={() => canEnter && navigate(`/student/exam-room/${exam.id}`)}
                className={`px-6 py-2.5 text-xs font-semibold rounded-[8px] transition-colors shadow-sm ${
                    isAgreed && canEnter
                    ? 'bg-[#06B6D4] hover:bg-[#0891B2] text-white cursor-pointer' 
                    : 'bg-slate-200 text-[#94A3B8] cursor-not-allowed'
                }`}
                >
                Bắt đầu làm bài
                </button>
            </div>
            </div>
        </main>

        <footer className="text-center text-xs text-[#94A3B8] py-4 border-t border-[#E2E8F0]">
            © 2026 EduTesting - Nền tảng khảo thí trực tuyến thông minh
        </footer>
        </div>
    );
}
