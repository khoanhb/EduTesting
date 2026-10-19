import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  FileSpreadsheet,
  Upload,
  Pencil,
  Trash2,
  Layers,
  AlertTriangle,
  Users,
  Filter,
  Info,
  Database,
  Layers3,
} from 'lucide-react';
import AdminSidebar from '../../components/common/AdminSidebar';
import AdminHeader from '../../components/common/AdminHeader';
import ToastNotification from '../../components/common/ToastNotification';
import Dropdown from '../../components/ui/Dropdown';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SubjectFormModal from './components/SubjectFormModal';
import {
  FILTER_ALL,
  SUBJECT_STATUS_LABELS,
  buildDepartmentFilterOptions,
  getSubjectDeleteBlockReason,
  mockAdminSubjectList,
} from '../../data/admin';

import { readTabularFile, exportTable } from '../../utils/tabularFiles';
import { SUBJECT_COLUMNS, validateImport } from '../../utils/adminFileData';

/** Số môn học mỗi trang (FR-04 - phân trang danh mục môn học). */
const SUBJECTS_PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: FILTER_ALL, label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: SUBJECT_STATUS_LABELS.ACTIVE },
  { value: 'LOCKED', label: SUBJECT_STATUS_LABELS.LOCKED },
];

const STATUS_TONES = {
  ACTIVE: 'bg-success-light text-success border-success-border',
  LOCKED: 'bg-danger-light text-danger border-danger-border',
};

/**
 * Quản lý Môn học & Cấu trúc chương (màn hình 4.2 - FR-04).
 *
 * Bố cục theo cùng khuôn với Quản lý đề thi / Ngân hàng câu hỏi: thẻ Bộ lọc ở
 * trên, bảng dữ liệu có phân trang ở dưới; mọi trường chọn dùng `Dropdown` của
 * Design System thay cho thẻ <select> mặc định của trình duyệt.
 *
 * Danh mục môn học lấy từ `mockAdminSubjectList` là nguồn dữ liệu mà Ngân
 * hàng câu hỏi, Ma trận đề thi và Dashboard Quản trị viên đang dùng, nên số môn
 * học ở mọi màn hình luôn khớp nhau.
 *
 * Ràng buộc toàn vẹn FR-04.6: môn học còn đề thi hoặc câu hỏi liên kết thì KHÔNG
 * được xoá; hệ thống giải thích rõ lý do thay vì xoá mù.
 */
export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState(mockAdminSubjectList);
  const fileInputRef = useRef(null);
  const latestLists = useRef(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  useEffect(() => {
    latestLists.current = { subjects };
  }, [subjects]);

  const [keyword, setKeyword] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [blockedReason, setBlockedReason] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastType(type);
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const departmentOptions = useMemo(() => buildDepartmentFilterOptions(), []);

  /** Thống kê nhanh, suy từ chính danh sách đang quản lý. */
  const summary = useMemo(
    () => [
      { id: 'total', label: 'Tổng số môn học', value: subjects.length, icon: BookOpen },
      {
        id: 'chapters',
        label: 'Tổng chương kiến thức',
        value: subjects.reduce((sum, subject) => sum + subject.chapterCount, 0),
        icon: Layers,
      },
      {
        id: 'teachers',
        label: 'Lượt phân công giảng viên',
        value: subjects.reduce((sum, subject) => sum + subject.teachers.length, 0),
        icon: Users,
      },
      {
        id: 'locked',
        label: 'Môn đang tạm khóa',
        value: subjects.filter((subject) => subject.status === 'LOCKED').length,
        icon: AlertTriangle,
      },
    ],
    [subjects]
  );

  const filteredSubjects = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchKeyword =
        search === '' ||
        subject.code.toLowerCase().includes(search) ||
        subject.name.toLowerCase().includes(search);
      const matchDepartment =
        departmentFilter === FILTER_ALL || subject.departmentId === departmentFilter;
      const matchStatus = statusFilter === FILTER_ALL || subject.status === statusFilter;

      return matchKeyword && matchDepartment && matchStatus;
    });
  }, [subjects, keyword, departmentFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / SUBJECTS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSubjects = filteredSubjects.slice(
    (safePage - 1) * SUBJECTS_PAGE_SIZE,
    safePage * SUBJECTS_PAGE_SIZE
  );

  const resetFilters = () => {
    setKeyword('');
    setDepartmentFilter(FILTER_ALL);
    setStatusFilter(FILTER_ALL);
    setCurrentPage(1);
  };

  /** Yêu cầu xoá môn học; nếu môn còn ràng buộc thì báo lý do thay vì xoá (FR-04.6). */
  const handleRequestDelete = (subject) => {
    const reason = getSubjectDeleteBlockReason(subject.id);
    if (reason) {
      setBlockedReason(reason);
      return;
    }
    setDeleteTarget(subject);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    setSubjects((current) => current.filter((subject) => subject.id !== deleteTarget.id));
    showToast(`Đã xóa môn học "${deleteTarget.name}" thành công!`);
    setDeleteTarget(null);
  };

  const handleSaveSubject = (payload) => {
    if (editingSubject) {
      setSubjects((current) =>
        current.map((subject) =>
          subject.id === editingSubject.id
            ? {
                ...subject,
                ...payload,
                department:
                  departmentOptions.find((option) => option.value === payload.departmentId)?.label ??
                  subject.department,
                chapterCount: payload.chapters.length,
                totalHours: payload.chapters.reduce(
                  (sum, chapter) => sum + (Number(chapter.hours) || 0),
                  0
                ),
              }
            : subject
        )
      );
      showToast('Cập nhật môn học thành công!');
    } else {
      const newSubject = {
        id: `SUB_${Date.now()}`,
        ...payload,
        department:
          departmentOptions.find((option) => option.value === payload.departmentId)?.label ?? '',
        chapterCount: payload.chapters.length,
        totalHours: payload.chapters.reduce(
          (sum, chapter) => sum + (Number(chapter.hours) || 0),
          0
        ),
        questionCount: 0,
        examCount: 0,
      };

      setSubjects((current) => [newSubject, ...current]);
      showToast('Thêm mới môn học thành công!');
    }

    setIsFormOpen(false);
    setEditingSubject(null);
  };


  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || fileBusy) return;
    
    setFileBusy(true);
    setImportErrors([]);
    try {
      const rows = await readTabularFile(file);
      const lists = latestLists.current;
      const { errors, records } = validateImport(rows, 'SUBJECT', lists.subjects);
      if (errors.length) {
        setImportErrors(errors);
        return;
      }
      const imported = records.map((record) => ({ ...record, id: 'IMPORT_' + crypto.randomUUID() }));
      const updateList = setSubjects;
      updateList((current) => [...imported, ...current]);
      resetFilters();
      
      showToast(`Đã nhập ${imported.length} dòng vào danh sách tạm thời. Chưa lưu lên máy chủ.`);
    } catch (error) {
      setImportErrors([error.message || 'Không đọc được file.']);
    } finally {
      setFileBusy(false);
    }
  };

  const handleExportFile = async (format) => {
    if (fileBusy) return;
    setFileBusy(true);
    try {
      await exportTable(SUBJECT_COLUMNS, filteredSubjects, 'mon-hoc', format);
      showToast('Đã tạo file tải xuống theo bộ lọc hiện tại.');
    } catch (error) {
      showToast(error.message || 'Không xuất được file.', 'error');
    } finally {
      setFileBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Môn học & Chủ đề" />

        <ToastNotification
          type={toastType}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-textMain">
                Quản lý môn học & cấu trúc chương
              </h1>
              <p className="text-xs text-textSub mt-1">
                Quản lý danh mục môn học, chủ đề kiến thức và phân công giảng viên phụ trách.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                disabled={fileBusy}
                placeholder={
                  <span className="inline-flex items-center gap-2 text-[#4F46E5] font-semibold">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Xuất dữ liệu
                  </span>
                }
                options={[
                  { value: 'xlsx', label: 'Tải Excel (.xlsx)' },
                  { value: 'csv', label: 'Tải CSV (.csv)' },
                ]}
                onChange={handleExportFile}
                className="w-fit min-w-0"
                triggerClassName="!h-[38px] !border-[#C7D2FE] !rounded-[8px]"
              />

              <button
                type="button"
                disabled={fileBusy}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#C7D2FE] text-[#4F46E5] text-xs font-semibold rounded-[8px] hover:bg-[#EEF2FF]/50 transition-colors shadow-sm cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Nhập Excel/CSV
              </button>

              <Button
                variant="solid"
                tone="admin"
                icon={Plus}
                onClick={() => {
                  setEditingSubject(null);
                  setIsFormOpen(true);
                }}
              >
                Thêm mới môn học
              </Button>
            </div>
          </div>


          <input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="hidden"
            aria-label="Chọn file nhập" onChange={handleImportFile} disabled={fileBusy} />
          <p className="text-xs text-textSub">
            Xuất toàn bộ danh sách theo bộ lọc. Nhập theo tiêu đề của file xuất (tối đa 5 MB, 5.000 dòng).
            Dữ liệu nhập chỉ lưu ở trang hiện tại và mất khi tải lại hoặc rời trang.
            Chỉ nhập thông tin môn học; chưa gồm chương và phân công giảng viên.
            {fileBusy && ' Đang xử lý file…'}
          </p>
          {importErrors.length > 0 && (
            <div role="alert" className="p-4 rounded-input border border-danger-border bg-danger-light text-danger text-xs">
              <p className="font-semibold">Chưa nhập dữ liệu. Vui lòng sửa các lỗi sau:</p>
              <ul className="list-disc pl-5 mt-2">
                {importErrors.slice(0, 20).map((error, index) => <li key={index}>{error}</li>)}
              </ul>
              {importErrors.length > 20 && <p>Còn {importErrors.length - 20} lỗi khác; sửa file rồi nhập lại.</p>}
            </div>
          )}

          {/* Thống kê nhanh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {summary.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-white border border-borderLine rounded-card p-5 shadow-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium text-textMuted">{card.label}</span>
                    <span className="w-9 h-9 rounded-widget bg-admin-light text-admin flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-textMain">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Bộ lọc */}
          <section className="bg-white border border-borderLine rounded-card p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-admin" />
              <h2 className="text-sm font-bold text-textMain">Bộ lọc môn học</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="relative xl:col-span-2">
                <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã môn, tên môn"
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-borderLine rounded-input text-xs text-textMain focus:outline-none focus:border-admin transition-colors"
                />
              </div>

              <Dropdown
                options={departmentOptions}
                value={departmentFilter}
                onChange={(value) => {
                  setDepartmentFilter(value);
                  setCurrentPage(1);
                }}
              />

              <Dropdown
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-semibold text-admin hover:underline cursor-pointer"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </div>
          </section>

          {/* Bảng danh mục môn học */}
          <section className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-admin" />
                <h2 className="text-sm font-bold text-[#0F172A]">Danh sách môn học</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                <Layers3 className="w-3.5 h-3.5" />
                Hiển thị {filteredSubjects.length} / {subjects.length} môn học
              </span>
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="py-16 text-center text-xs text-textMuted">
                Không tìm thấy môn học nào khớp bộ lọc hiện tại.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[1100px]">
                  <thead>
                    <tr className="bg-canvas border-b border-borderLine text-textMuted font-semibold">
                      <th className="py-3 pl-6 pr-3 w-12 text-center">STT</th>
                      <th className="py-3 pr-3">MÃ MÔN</th>
                      <th className="py-3 pr-3">TÊN MÔN HỌC</th>
                      <th className="py-3 pr-3 text-center">SỐ TC</th>
                      <th className="py-3 pr-3">BỘ MÔN PHỤ TRÁCH</th>
                      <th className="py-3 pr-3">CẤU TRÚC CHƯƠNG</th>
                      <th className="py-3 pr-3">GIẢNG VIÊN PHỤ TRÁCH</th>
                      <th className="py-3 pr-3">TRẠNG THÁI</th>
                      <th className="py-3 pr-6 text-right">THAO TÁC</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-borderLine text-textMain">
                    {paginatedSubjects.map((subject, index) => (
                      <tr key={subject.id} className="hover:bg-canvas/70 transition-colors align-top">
                        <td className="py-3.5 pl-6 pr-3 text-center text-textSub font-medium">
                          {(safePage - 1) * SUBJECTS_PAGE_SIZE + index + 1}
                        </td>

                        <td className="py-3.5 pr-3 font-semibold text-textMain whitespace-nowrap">
                          {subject.code}
                        </td>

                        <td className="py-3.5 pr-3 font-medium text-textMain max-w-[240px]">
                          {subject.name}
                        </td>

                        <td className="py-3.5 pr-3 text-center font-semibold text-textMain">
                          {subject.credits}
                        </td>

                        <td className="py-3.5 pr-3 text-textSub">{subject.department}</td>

                        <td className="py-3.5 pr-3">
                          {subject.chapterCount > 0 ? (
                            <span className="text-textSub">
                              <strong className="text-textMain">{subject.chapterCount}</strong> chương ·{' '}
                              {subject.totalHours ?? 0} tiết
                            </span>
                          ) : (
                            <span className="font-medium text-warning">Chưa thiết lập</span>
                          )}
                        </td>

                        <td className="py-3.5 pr-3">
                          {subject.teachers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {subject.teachers.map((teacher) => (
                                <span
                                  key={teacher.teacherId}
                                  className="inline-block px-2 py-1 rounded bg-canvas border border-borderLine text-[11px] font-semibold text-textSub whitespace-nowrap"
                                >
                                  {teacher.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="font-medium text-warning">Chưa phân công</span>
                          )}
                        </td>

                        <td className="py-3.5 pr-3">
                          <span
                            className={`inline-block px-2 py-1 rounded text-[11px] font-bold whitespace-nowrap ${
                              STATUS_TONES[subject.status] ?? ''
                            }`}
                          >
                            {SUBJECT_STATUS_LABELS[subject.status] ?? subject.status}
                          </span>
                        </td>

                        <td className="py-3.5 pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="Chỉnh sửa môn học & chương"
                              onClick={() => {
                                setEditingSubject(subject);
                                setIsFormOpen(true);
                              }}
                              className="p-2 text-textSub hover:text-admin hover:bg-admin-light rounded-btn transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              title="Xóa môn học"
                              onClick={() => handleRequestDelete(subject)}
                              className="p-2 text-textSub hover:text-danger hover:bg-danger-light rounded-btn transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredSubjects.length > 0 && (
              <div className="px-6 py-4 border-t border-borderLine">
                <Pagination
                  page={safePage}
                  pageSize={SUBJECTS_PAGE_SIZE}
                  totalItems={filteredSubjects.length}
                  onPageChange={setCurrentPage}
                  itemLabel="môn học"
                  tone="admin"
                />
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modal M.17 - Thêm / Sửa môn học & cấu trúc chương */}
      {isFormOpen && (
        <SubjectFormModal
          isOpen={isFormOpen}
          initialData={editingSubject}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSubject(null);
          }}
          onSave={handleSaveSubject}
        />
      )}

      {/* Modal M.16 - Xác nhận xóa môn học */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        tone="danger"
        title="Xác nhận xóa môn học"
        description={
          deleteTarget
            ? `Bạn có chắc chắn muốn xóa môn học "${deleteTarget.name}" (${deleteTarget.code})? Toàn bộ cấu trúc chương của môn cũng bị xóa và thao tác này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa môn học"
      />

      {/* M.16b - Ràng buộc FR-04.6: giải thích lý do không thể xóa */}
      <Modal
        isOpen={Boolean(blockedReason)}
        onClose={() => setBlockedReason(null)}
        icon={AlertTriangle}
        tone="warning"
        size="sm"
        title="Không thể xóa môn học"
        description={blockedReason ?? ''}
        footer={
          <Button
            variant="solid"
            tone="warning"
            onClick={() => setBlockedReason(null)}
            fullWidth
          >
            Đã hiểu
          </Button>
        }
      >
        <div className="flex items-start gap-2 p-3 bg-warning-light border border-warning-border rounded-widget text-[11px] text-warning">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Hãy xử lý các liên kết trên trước, hoặc chuyển môn học sang trạng thái{' '}
            <strong>Tạm khóa</strong> nếu không muốn môn tiếp tục được sử dụng cho kỳ thi mới.
          </p>
        </div>
      </Modal>
    </div>
  );
}
