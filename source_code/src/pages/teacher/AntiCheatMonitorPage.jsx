import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  FileWarning,
  RefreshCw,
  Activity,
  Filter,
  Eye,
  Users,
  Search,
  Lock,
} from 'lucide-react';
import TeacherSidebar from '../../components/common/TeacherSidebar';
import TeacherHeader from '../../components/common/TeacherHeader';
import ToastNotification from '../../components/common/ToastNotification';
import CustomDropdown from '../../components/common/CustomDropdown';
import ViolationReportModal from './components/ViolationReportModal';
import {
  getLiveRoomsBySubjects,
  getViolationsBySubjects,
  isCheatingViolation,
  isPendingFraudAlert,
  mockTeacherUser,
  RISK_LEVEL_LABELS,
  VIOLATION_STATUS_LABELS,
} from '../../data/teacher';

const RISK_TONES = {
  NORMAL: 'bg-[#F1F5F9] text-[#64748B]',
  SUSPICIOUS: 'bg-[#FEF3C7] text-[#D97706]',
  HIGH: 'bg-[#FEF2F2] text-[#EF4444]',
};

/**
 * Hai trạng thái xử lý: chờ xử lý và đã lập biên bản.
 * Hệ thống không có luồng mở khóa bài thi, khi thí sinh chạm ngưỡng vi phạm,
 * bài thi bị khóa và thu bắt buộc, giảng viên chỉ lập biên bản ghi nhận.
 */
const STATUS_TONES = {
  PENDING: 'bg-[#FEF3C7] text-[#D97706]',
  REPORTED: 'bg-[#ECFDF5] text-[#059669]',
};

/** Màu điểm rủi ro AI (FR-10.2). */
const getAiRiskTone = (score) => {
  if (score >= 85) return 'text-[#EF4444]';
  if (score >= 60) return 'text-[#D97706]';
  return 'text-[#059669]';
};

/**
 * Ràng buộc phân quyền: Giảng viên chỉ giám sát phòng thi / vi phạm
 * thuộc các môn học được phân công (FR-10.1).
 */
const MANAGED_SUBJECTS = mockTeacherUser.managedSubjects;

/** Ghi thêm một dòng vào nhật ký kiểm tra (audit log) của bản ghi vi phạm. */
function appendAuditEntry(violation, action, note, timestamp) {
  return {
    ...violation,
    auditLog: [
      ...(violation.auditLog ?? []),
      {
        action,
        byUserId: mockTeacherUser.id,
        at: timestamp,
        note,
      },
    ],
  };
}

/** Thời điểm ghi nhật ký theo định dạng dd/MM/yyyy HH:mm:ss. */
function buildTimestamp(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function AntiCheatMonitorPage() {
  const [violations, setViolations] = useState(() =>
    getViolationsBySubjects(MANAGED_SUBJECTS)
  );
  const [selectedId, setSelectedId] = useState(
    () => getViolationsBySubjects(MANAGED_SUBJECTS)[0]?.id ?? null
  );
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [examFilter, setExamFilter] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [onlyLocked, setOnlyLocked] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Chỉ liệt kê phòng thi thuộc môn học được phân công (FR-10.1).
  const scopedRooms = useMemo(() => getLiveRoomsBySubjects(MANAGED_SUBJECTS), []);

  const roomOptions = [
    { value: 'ALL', label: 'Tất cả phòng thi' },
    ...scopedRooms.map((room) => ({ value: room.room, label: `${room.room} · ${room.examCode}` })),
  ];

  const riskOptions = [
    { value: 'ALL', label: 'Tất cả mức rủi ro' },
    ...Object.entries(RISK_LEVEL_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const examOptions = [
    { value: 'ALL', label: 'Tất cả kỳ thi' },
    ...Array.from(new Set(violations.map((violation) => violation.examCode))).map((examCode) => ({
      value: examCode,
      label: examCode,
    })),
  ];

  /** Thí sinh bị khóa bài = đã chạm ngưỡng vi phạm tối đa (3/3). */
  const isLockedViolation = (violation) => violation.occurrences >= violation.maxOccurrences;

  const filteredViolations = useMemo(
    () =>
      violations.filter((violation) => {
        const search = keyword.trim().toLowerCase();
        const matchRoom = roomFilter === 'ALL' || violation.room === roomFilter;
        const matchRisk = riskFilter === 'ALL' || violation.riskLevel === riskFilter;
        const matchExam = examFilter === 'ALL' || violation.examCode === examFilter;
        const matchKeyword =
          search === '' ||
          violation.studentName.toLowerCase().includes(search) ||
          violation.studentId.toLowerCase().includes(search);
        const matchLocked = !onlyLocked || isLockedViolation(violation);
        return matchRoom && matchRisk && matchExam && matchKeyword && matchLocked;
      }),
    [violations, roomFilter, riskFilter, examFilter, keyword, onlyLocked]
  );

  const selectedViolation =
    filteredViolations.find((violation) => violation.id === selectedId) ?? filteredViolations[0] ?? null;

  const summary = useMemo(
    () => [
      {
        id: 'rooms',
        label: 'Phòng thi đang giám sát',
        value: scopedRooms.length,
        icon: Activity,
        tone: 'bg-[#E0F2FE] text-[#0891B2]',
      },
      {
        id: 'online',
        label: 'Thí sinh đang làm bài',
        value: scopedRooms.reduce((sum, room) => sum + room.online, 0),
        icon: Users,
        tone: 'bg-[#EEF2FF] text-[#4F46E5]',
      },
      {
        // Sự cố kỹ thuật (mất kết nối mạng) không tính là vi phạm cần xử lý.
        id: 'pending',
        label: 'Vi phạm chờ xử lý',
        value: violations.filter(isPendingFraudAlert).length,
        icon: ShieldAlert,
        tone: 'bg-[#FEF3C7] text-[#D97706]',
      },
      {
        id: 'reported',
        label: 'Đã lập biên bản',
        value: violations.filter((violation) => violation.status === 'REPORTED').length,
        icon: FileWarning,
        tone: 'bg-[#ECFDF5] text-[#059669]',
      },
    ],
    [violations, scopedRooms]
  );

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Làm mới dữ liệu thành công!');
    }, 600);
  };

  /** POST /teacher/violations/{id}/report lưu biên bản do giảng viên lập. */
  const handleSubmitReport = (report) => {
    const timestamp = buildTimestamp(new Date());

    setViolations((current) =>
      current.map((violation) =>
        violation.id === reportTarget.id
          ? appendAuditEntry(
              { ...violation, status: 'REPORTED', report },
              'LẬP BIÊN BẢN VI PHẠM',
              `${report.penalty} - ${report.detail}`,
              timestamp
            )
          : violation
      )
    );

    setReportTarget(null);
    showToast(`Đã lưu biên bản vi phạm. Đã ghi nhật ký bởi GV: ${mockTeacherUser.id} lúc ${timestamp}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader title="Nhật ký theo dõi" avatar={mockTeacherUser.avatar} />

        <ToastNotification
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Nhật ký & giám sát gian lận</h1>
              <p className="text-xs text-[#475569] mt-1">
                Theo dõi trực tiếp các phòng thi đang diễn ra, xem chi tiết sự kiện và lập biên bản vi phạm.
                Bài thi đã bị khóa do chạm ngưỡng vi phạm sẽ được thu và giữ nguyên trạng thái.
              </p>
            </div>

            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#06b6d4] hover:bg-[#0891b2] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}</span>
            </button>
          </div>

          {/* 4 thẻ tổng quan giám sát */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {summary.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.id} className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
                  <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center mb-4 ${card.tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] text-[#94A3B8] font-medium mb-1">{card.label}</p>
                  <p className="text-2xl font-extrabold text-[#0F172A]">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Bộ lọc */}
          <section className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-[#06B6D4]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Bộ lọc nhật ký giám sát</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="relative xl:col-span-2">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm theo MSSV hoặc họ tên sinh viên"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-xs focus:outline-none focus:border-[#06B6D4] transition-colors"
                />
              </div>

              <CustomDropdown options={examOptions} value={examFilter} onChange={setExamFilter} className="w-full" />
              <CustomDropdown options={roomOptions} value={roomFilter} onChange={setRoomFilter} className="w-full" />
              <CustomDropdown options={riskOptions} value={riskFilter} onChange={setRiskFilter} className="w-full" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <label className="inline-flex items-center gap-2 text-[11px] font-medium text-[#475569] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyLocked}
                  onChange={(event) => setOnlyLocked(event.target.checked)}
                  className="w-4 h-4 accent-[#EF4444] cursor-pointer"
                />
                Chỉ hiển thị thí sinh đang bị khóa bài (vi phạm 3/3)
              </label>

              <button
                type="button"
                onClick={() => {
                  setRoomFilter('ALL');
                  setRiskFilter('ALL');
                  setExamFilter('ALL');
                  setKeyword('');
                  setOnlyLocked(false);
                }}
                className="text-[11px] font-semibold text-[#06B6D4] hover:underline cursor-pointer"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Bảng nhật ký vi phạm */}
            <section className="xl:col-span-8 bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                  <h2 className="text-sm font-bold text-[#0F172A]">Nhật ký vi phạm quy chế</h2>
                </div>
                <span className="text-[11px] font-semibold text-[#475569]">
                  {filteredViolations.length} bản ghi
                </span>
              </div>

              {filteredViolations.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#94A3B8]">
                  Không có vi phạm nào khớp bộ lọc hiện tại.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[880px]">
                    <thead>
                      <tr className="text-left text-[#94A3B8] font-semibold border-b border-[#E2E8F0] bg-slate-50/60">
                        <th className="py-3 pl-6 pr-3">Thí sinh</th>
                        <th className="py-3 pr-3">Kỳ thi / Phòng</th>
                        <th className="py-3 pr-3">Loại vi phạm</th>
                        <th className="py-3 pr-3 text-center">Số lần</th>
                        <th className="py-3 pr-3 text-center">Điểm rủi ro AI</th>
                        <th className="py-3 pr-3">Mức rủi ro</th>
                        <th className="py-3 pr-3">Trạng thái</th>
                        <th className="py-3 pr-6 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {filteredViolations.map((violation) => (
                        <tr
                          key={violation.id}
                          onClick={() => setSelectedId(violation.id)}
                          className={`transition-colors align-top cursor-pointer ${
                            selectedViolation?.id === violation.id ? 'bg-[#E0F2FE]/40' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3.5 pl-6 pr-3">
                            <div className="font-bold text-[#0F172A]">{violation.studentName}</div>
                            <div className="text-[10px] text-[#94A3B8] mt-0.5">
                              {violation.studentId} · Lớp {violation.className}
                            </div>
                          </td>

                          <td className="py-3.5 pr-3">
                            <div className="text-[#0F172A] font-semibold">{violation.examCode}</div>
                            <div className="text-[10px] text-[#94A3B8] mt-0.5">{violation.room}</div>
                          </td>

                          <td className="py-3.5 pr-3 text-[#475569]">
                            <div className="font-medium">{violation.type}</div>
                            <div className="text-[10px] text-[#94A3B8] mt-0.5">{violation.lastTime}</div>
                          </td>

                          <td className="py-3.5 pr-3 text-center">
                            <span
                              className={`font-bold ${
                                isLockedViolation(violation) ? 'text-[#EF4444]' : 'text-[#D97706]'
                              }`}
                            >
                              {violation.occurrences}/{violation.maxOccurrences}
                            </span>
                          </td>

                          <td className="py-3.5 pr-3 text-center">
                            <span className={`font-bold ${getAiRiskTone(violation.aiRiskScore)}`}>
                              {violation.aiRiskScore}%
                            </span>
                          </td>

                          <td className="py-3.5 pr-3">
                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${RISK_TONES[violation.riskLevel]}`}>
                              {RISK_LEVEL_LABELS[violation.riskLevel]}
                            </span>
                          </td>

                          <td className="py-3.5 pr-3">
                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${STATUS_TONES[violation.status]}`}>
                              {VIOLATION_STATUS_LABELS[violation.status]}
                            </span>
                          </td>

                          <td className="py-3.5 pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Bài thi đã khóa thì chỉ còn ghi nhận, không có thao tác mở lại */}
                              {isCheatingViolation(violation) && isLockedViolation(violation) && (
                                <span
                                  title="Bài thi đã bị khóa và thu do chạm ngưỡng vi phạm"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-[#FEF2F2] text-[10px] font-bold text-[#EF4444] whitespace-nowrap"
                                >
                                  <Lock className="w-3 h-3" />
                                </span>
                              )}

                              <button
                                type="button"
                                title={violation.report ? 'Xem biên bản vi phạm' : 'Lập biên bản vi phạm'}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setReportTarget(violation);
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-[8px] transition-colors cursor-pointer ${
                                  violation.report
                                    ? 'bg-white border border-[#BAE6FD] text-[#0891B2] hover:bg-[#E0F2FE]/50'
                                    : 'bg-[#EF4444] hover:bg-red-600 text-white'
                                }`}
                              >
                                {violation.report ? <Eye className="w-3.5 h-3.5" /> : <FileWarning className="w-3.5 h-3.5" />}
                                {violation.report ? 'Xem biên bản' : 'Lập biên bản'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Bảng nhật ký sự kiện của bản ghi đang chọn */}
            <aside className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A] mb-4">Nhật ký chi tiết</h2>

              {!selectedViolation ? (
                <p className="text-xs text-[#94A3B8]">Chọn một bản ghi để xem chi tiết sự kiện.</p>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-[16px] text-[11px]">
                    <p className="font-bold text-[#0F172A]">{selectedViolation.studentName}</p>
                    <p className="text-[#475569] mt-0.5">{selectedViolation.studentId} · Lớp {selectedViolation.className}</p>
                    <p className="text-[#475569] mt-1">{selectedViolation.subjectName}</p>
                    <p className="text-[#94A3B8] mt-1">
                      {selectedViolation.examCode} · Phòng {selectedViolation.room}
                    </p>
                  </div>

                  <ol className="relative border-l border-[#E2E8F0] pl-4 space-y-4">
                    {selectedViolation.events.map((event) => (
                      <li key={`${event.time}-${event.type}`} className="relative">
                        <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-white"></span>
                        <p className="text-[11px] font-bold text-[#0F172A]">{event.type}</p>
                        <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">{event.time}</p>
                        <p className="text-[11px] text-[#475569] leading-relaxed mt-1">{event.detail}</p>
                      </li>
                    ))}
                  </ol>

                  {selectedViolation.report && (
                    <div className="p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[16px] text-[11px]">
                      <p className="font-bold text-[#047857] mb-1">Biên bản đã lập</p>
                      <p className="text-[#047857]">Hình thức: {selectedViolation.report.penalty}</p>
                      <p className="text-[#047857] mt-1 leading-relaxed">{selectedViolation.report.detail}</p>
                    </div>
                  )}

                  {/* Nhật ký kiểm tra (audit log): mọi thao tác của Giảng viên đều được ghi lại (FR-10.3) */}
                  <div className="border-t border-[#E2E8F0] pt-4">
                    <p className="text-[11px] font-bold text-[#0F172A] mb-2">Nhật ký kiểm tra</p>

                    {(selectedViolation.auditLog ?? []).length === 0 ? (
                      <p className="text-[11px] text-[#94A3B8]">
                        Chưa có thao tác nào được ghi nhận cho bản ghi này.
                      </p>
                    ) : (
                      <ul className="space-y-2.5">
                        {selectedViolation.auditLog.map((entry, index) => (
                          <li
                            key={`${entry.action}-${entry.at}-${index}`}
                            className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-[12px] text-[11px]"
                          >
                            <p className="font-semibold text-[#0F172A]">{entry.action}</p>
                            <p className="text-[#475569] mt-0.5 leading-relaxed">{entry.note}</p>
                            <p className="text-[10px] text-[#94A3B8] mt-1">
                              Đã ghi nhật ký bởi GV: {entry.byUserId} lúc {entry.at}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>

      {/* Modal M.14 Lập / xem biên bản vi phạm */}
      <ViolationReportModal
        isOpen={Boolean(reportTarget)}
        violation={reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}
