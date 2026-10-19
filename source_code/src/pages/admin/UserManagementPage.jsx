import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users,
  GraduationCap,
  Search,
  Plus,
  FileSpreadsheet,
  Upload,
  Lock,
  Unlock,
  KeyRound,
  Pencil,
  CheckSquare,
  Filter,
  Database,
  Layers3,
} from 'lucide-react';
import AdminSidebar from '../../components/common/AdminSidebar';
import AdminHeader from '../../components/common/AdminHeader';
import ToastNotification from '../../components/common/ToastNotification';
import Dropdown from '../../components/ui/Dropdown';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import UserFormModal from './components/UserFormModal';
import {
  FILTER_ALL,
  USER_STATUS_FILTER_OPTIONS,
  USER_STATUS_LABELS,
  buildClassFilterOptions,
  buildDepartmentFilterOptions,
  buildMajorFilterOptions,
  mockStudentsList,
  mockTeachersList,
} from '../../data/admin';

import { readTabularFile, exportTable } from '../../utils/tabularFiles';
import { STUDENT_COLUMNS, TEACHER_COLUMNS, validateImport } from '../../utils/adminFileData';

/** Số tài khoản mỗi trang (FR-03.1 - phân trang danh sách người dùng). */
const USERS_PAGE_SIZE = 10;

const ROLE_TABS = [
  { value: 'STUDENT', label: 'Sinh viên', icon: GraduationCap },
  { value: 'TEACHER', label: 'Giảng viên', icon: Users },
];

const EMPTY_FILTERS = {
  keyword: '',
  majorId: FILTER_ALL,
  classId: FILTER_ALL,
  departmentId: FILTER_ALL,
  status: FILTER_ALL,
};

/**
 * Quản lý người dùng & tài khoản (màn hình 4.1 - FR-03).
 *
 * Bố cục theo cùng khuôn với Quản lý đề thi / Ngân hàng câu hỏi: thẻ Bộ lọc ở
 * trên, thanh thao tác hàng loạt khi có dòng được chọn, bảng dữ liệu có phân
 * trang ở dưới.
 *
 * Bộ lọc của tab Sinh viên gồm NGÀNH HỌC và LỚP SINH HOẠT, trong đó danh sách
 * lớp PHỤ THUỘC vào ngành đang chọn: đổi ngành thì bộ lọc lớp được nạp lại theo
 * đúng các lớp của ngành đó. Tab Giảng viên lọc theo BỘ MÔN, cùng một danh mục
 * đơn vị với Ngành học, chỉ khác nhãn hiển thị.
 *
 * Hai loại "khóa" khác nhau trong hệ thống:
 *   - M.19 khóa tài khoản (màn hình này): người dùng không đăng nhập được.
 *   - Mở khóa BÀI THI đã bị loại bỏ hoàn toàn: khi thí sinh chạm ngưỡng vi phạm,
 *     bài thi bị thu và giảng viên chỉ lập biên bản, không có luồng mở lại.
 */
export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('STUDENT');
  const [students, setStudents] = useState(mockStudentsList);
  const [teachers, setTeachers] = useState(mockTeachersList);
  const fileInputRef = useRef(null);
  const latestLists = useRef(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  useEffect(() => {
    latestLists.current = { students, teachers };
  }, [students, teachers]);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastType(type);
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isStudentTab = activeTab === 'STUDENT';
  const currentList = isStudentTab ? students : teachers;

  const majorOptions = useMemo(() => buildMajorFilterOptions(), []);
  const departmentOptions = useMemo(() => buildDepartmentFilterOptions(), []);

  /** Lớp sinh hoạt luôn phụ thuộc Ngành học đang chọn (bộ lọc phụ thuộc). */
  const classOptions = useMemo(() => buildClassFilterOptions(filters.majorId), [filters.majorId]);

  const updateFilter = (patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setCurrentPage(1);
  };

  /** Đổi Ngành học thì đặt lại bộ lọc Lớp vì danh sách lớp đã thay đổi. */
  const handleChangeMajorFilter = (value) => {
    updateFilter({ majorId: value, classId: FILTER_ALL });
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  const filteredList = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return currentList.filter((user) => {
      const code = isStudentTab ? user.studentId : user.teacherId;
      const matchKeyword =
        keyword === '' ||
        code.toLowerCase().includes(keyword) ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);

      const matchScope = isStudentTab
        ? (filters.majorId === FILTER_ALL || user.majorId === filters.majorId) &&
          (filters.classId === FILTER_ALL || user.classId === filters.classId)
        : filters.departmentId === FILTER_ALL || user.departmentId === filters.departmentId;

      const matchStatus = filters.status === FILTER_ALL || user.status === filters.status;

      return matchKeyword && matchScope && matchStatus;
    });
  }, [currentList, isStudentTab, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / USERS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedList = filteredList.slice(
    (safePage - 1) * USERS_PAGE_SIZE,
    safePage * USERS_PAGE_SIZE
  );

  /** Đổi danh sách tài khoản của đúng tab đang mở. */
  const updateActiveList = (updater) => {
    if (isStudentTab) setStudents(updater);
    else setTeachers(updater);
  };

  const changeTab = (tab) => {
    setImportErrors([]);
    setActiveTab(tab);
    setSelectedIds([]);
    resetFilters();
  };

  const toggleSelected = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = paginatedList.map((user) => user.id);
    const isAllSelected = pageIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      isAllSelected
        ? current.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...current, ...pageIds]))
    );
  };

  const codeOf = (user) => (isStudentTab ? user.studentId : user.teacherId);

  /** M.19 - khóa / mở khóa một tài khoản (FR-03.2). */
  const requestToggleLock = (user) => {
    const willLock = user.status !== 'LOCKED';

    setConfirmConfig({
      tone: willLock ? 'warning' : 'success',
      title: willLock ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      description: willLock
        ? `Tài khoản "${user.name}" (${codeOf(user)}) sẽ bị khóa và không thể đăng nhập cho tới khi được mở lại.`
        : `Tài khoản "${user.name}" (${codeOf(user)}) sẽ được mở khóa và có thể đăng nhập trở lại.`,
      confirmLabel: willLock ? 'khóa tài khoản' : 'Mở khóa',
      onConfirm: () => {
        updateActiveList((current) =>
          current.map((item) =>
            item.id === user.id ? { ...item, status: willLock ? 'LOCKED' : 'ACTIVE' } : item
          )
        );
        showToast(
          willLock
            ? `Đã khóa tài khoản ${codeOf(user)} thành công!`
            : `Đã mở khóa tài khoản ${codeOf(user)} thành công!`
        );
        setConfirmConfig(null);
      },
    });
  };

  /** M.15 - Đặt lại mật khẩu về mặc định {mã định danh}@123. */
  const requestResetPassword = (user) => {
    setConfirmConfig({
      tone: 'warning',
      title: 'Đặt lại mật khẩu mặc định',
      description: `Mật khẩu của tài khoản "${user.name}" (${codeOf(user)}) sẽ được đặt lại về mật khẩu mặc định dạng {mã định danh}@123. Thao tác này không thể hoàn tác.`,
      confirmLabel: 'Đặt lại mật khẩu',
      onConfirm: () => {
        showToast(`Đã đặt lại mật khẩu mặc định cho ${user.name}!`);
        setConfirmConfig(null);
      },
    });
  };

  const requestBulkStatus = (nextStatus) => {
    const willLock = nextStatus === 'LOCKED';
    const count = selectedIds.length;

    setConfirmConfig({
      tone: willLock ? 'warning' : 'success',
      title: willLock ? 'Khóa hàng loạt' : 'Mở khóa hàng loạt',
      description: `Bạn có chắc chắn muốn ${willLock ? 'khóa' : 'mở khóa'} ${count} tài khoản đã chọn?`,
      confirmLabel: willLock ? 'Khóa tất cả' : 'Mở khóa tất cả',
      onConfirm: () => {
        updateActiveList((current) =>
          current.map((item) =>
            selectedIds.includes(item.id) ? { ...item, status: nextStatus } : item
          )
        );
        showToast(`Đã cập nhật trạng thái ${count} tài khoản thành công!`);
        setSelectedIds([]);
        setConfirmConfig(null);
      },
    });
  };

  const requestBulkResetPassword = () => {
    const count = selectedIds.length;

    setConfirmConfig({
      tone: 'warning',
      title: 'Đặt lại mật khẩu hàng loạt',
      description: `Mật khẩu của ${count} tài khoản đã chọn sẽ được đưa về mật khẩu mặc định dạng {mã định danh}@123. Tiếp tục?`,
      confirmLabel: 'Đặt lại mật khẩu',
      onConfirm: () => {
        showToast(`Đã đặt lại mật khẩu cho ${count} tài khoản thành công!`);
        setSelectedIds([]);
        setConfirmConfig(null);
      },
    });
  };

  const handleSaveUser = (payload) => {
    if (editingUser) {
      updateActiveList((current) =>
        current.map((user) => (user.id === editingUser.id ? { ...user, ...payload } : user))
      );
      showToast('Cập nhật thông tin người dùng thành công!');
    } else {
      const newUser = {
        id: `USER_${Date.now()}`,
        role: activeTab,
        status: 'ACTIVE',
        ...payload,
      };
      updateActiveList((current) => [newUser, ...current]);
      showToast(
        isStudentTab
          ? 'Thêm mới tài khoản sinh viên thành công!'
          : 'Thêm mới tài khoản giảng viên thành công!'
      );
    }

    setIsFormOpen(false);
    setEditingUser(null);
  };

  const isAllOnPageSelected =
    paginatedList.length > 0 && paginatedList.every((user) => selectedIds.includes(user.id));

  const hasSelection = selectedIds.length > 0;


  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || fileBusy) return;
    const role = activeTab;
    setFileBusy(true);
    setImportErrors([]);
    try {
      const rows = await readTabularFile(file);
      const lists = latestLists.current;
      const { errors, records } = validateImport(rows, role, role === 'STUDENT' ? lists.students : lists.teachers, role === 'STUDENT' ? lists.teachers : lists.students);
      if (errors.length) {
        setImportErrors(errors);
        return;
      }
      const imported = records.map((record) => ({ ...record, id: 'IMPORT_' + crypto.randomUUID() }));
      const updateList = role === 'STUDENT' ? setStudents : setTeachers;
      updateList((current) => [...imported, ...current]);
      resetFilters();
      setSelectedIds([]);
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
      await exportTable(isStudentTab ? STUDENT_COLUMNS : TEACHER_COLUMNS, filteredList, isStudentTab ? 'sinh-vien' : 'giang-vien', format);
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
        <AdminHeader title="Quản lý người dùng" />

        <ToastNotification
          type={toastType}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-textMain">Quản lý người dùng & tài khoản</h1>
              <p className="text-xs text-textSub mt-1">
                Quản lý danh sách sinh viên, giảng viên, khóa/mở khóa tài khoản và cấp lại mật khẩu
                mặc định.
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
                  setEditingUser(null);
                  setIsFormOpen(true);
                }}
              >
                Thêm mới {isStudentTab ? 'sinh viên' : 'giảng viên'}
              </Button>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="hidden"
            aria-label="Chọn file nhập" onChange={handleImportFile} disabled={fileBusy} />
          <p className="text-xs text-textSub">
            Xuất toàn bộ danh sách theo bộ lọc. Nhập theo tiêu đề của file xuất (tối đa 5 MB, 5.000 dòng).
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

          {/* Tabs theo vai trò */}
          <div className="flex items-center gap-2 border-b border-borderLine">
            {ROLE_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tab.value === 'STUDENT' ? students.length : teachers.length;
              const isActive = activeTab === tab.value;

              return (
                <button
                  disabled={fileBusy}
                  key={tab.value}
                  onClick={() => changeTab(tab.value)}
                  className={`flex items-center gap-2 px-4 pb-3 border-b-2 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'border-admin text-admin'
                      : 'border-transparent text-textMuted hover:text-textMain'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Bộ lọc */}
          <section className="bg-white border border-borderLine rounded-card p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-admin" />
              <h2 className="text-sm font-bold text-textMain">Bộ lọc người dùng</h2>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${isStudentTab ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
              <div className="relative min-w-0 xl:col-span-2">
                <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    isStudentTab
                      ? 'Tìm kiếm theo MSSV, họ tên'
                      : 'Tìm kiếm theo mã GV, họ tên'
                  }
                  value={filters.keyword}
                  onChange={(event) => updateFilter({ keyword: event.target.value })}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-borderLine rounded-input text-xs text-textMain focus:outline-none focus:border-admin transition-colors"
                />
              </div>

              {isStudentTab ? (
                <>
                  {/* Lọc theo Ngành học (chính là Bộ môn của sinh viên) */}
                  <Dropdown
                    options={majorOptions}
                    value={filters.majorId}
                    onChange={handleChangeMajorFilter}
                  />

                  {/* Lọc theo Lớp, danh sách phụ thuộc Ngành học đang chọn */}
                  <Dropdown
                    options={classOptions}
                    value={filters.classId}
                    onChange={(value) => updateFilter({ classId: value })}
                  />
                </>
              ) : (
                <div className="min-w-0">
                  <Dropdown
                    options={departmentOptions}
                    value={filters.departmentId}
                    onChange={(value) => updateFilter({ departmentId: value })}
                  />
                </div>
              )}

              <Dropdown
                options={USER_STATUS_FILTER_OPTIONS}
                value={filters.status}
                onChange={(value) => updateFilter({ status: value })}
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

          {/* Thanh thao tác hàng loạt (M.19 / M.15) */}
          {hasSelection ? (
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-admin-light border border-admin-ring rounded-widget">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-admin">
                <CheckSquare className="w-4 h-4" />
                Đã chọn {selectedIds.length} tài khoản
              </span>

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  tone="success"
                  size="sm"
                  icon={Unlock}
                  onClick={() => requestBulkStatus('ACTIVE')}
                >
                  Mở khóa tài khoản
                </Button>

                <Button
                  variant="outline"
                  tone="danger"
                  size="sm"
                  icon={Lock}
                  onClick={() => requestBulkStatus('LOCKED')}
                >
                  Khóa tài khoản
                </Button>

                <Button
                  variant="solid"
                  tone="admin"
                  size="sm"
                  icon={KeyRound}
                  onClick={requestBulkResetPassword}
                >
                  Đặt lại mật khẩu
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-admin-light border border-admin-ring rounded-[16px] text-[11px] text-admin font-medium">
              <CheckSquare className="w-4 h-4 shrink-0" />
              Chọn ít nhất một tài khoản trong bảng để dùng các thao tác hàng loạt (khóa, mở khóa,
              đặt lại mật khẩu).
            </div>
          )}

          {/* Bảng tài khoản */}
          <section className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-admin" />
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Danh sách {isStudentTab ? 'sinh viên' : 'giảng viên'}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                <Layers3 className="w-3.5 h-3.5" />
                Hiển thị {filteredList.length} / {currentList.length} tài khoản
              </span>
            </div>

            {filteredList.length === 0 ? (
              <div className="py-16 text-center text-xs text-textMuted">
                Không tìm thấy tài khoản nào khớp bộ lọc hiện tại.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[1020px]">
                  <thead>
                    <tr className="bg-canvas border-b border-borderLine text-textMuted font-semibold">
                      <th className="py-3 pl-6 pr-3 w-12">
                        <input
                          type="checkbox"
                          checked={isAllOnPageSelected}
                          onChange={toggleSelectAllOnPage}
                          className="accent-admin cursor-pointer"
                          aria-label="Chọn tất cả tài khoản trên trang"
                        />
                      </th>
                      <th className="py-3 pr-3 w-12 text-center">STT</th>
                      <th className="py-3 pr-3">{isStudentTab ? 'MSSV' : 'MÃ GV'}</th>
                      <th className="py-3 pr-3">HỌ VÀ TÊN</th>
                      <th className="py-3 pr-3">EMAIL</th>
                      {isStudentTab ? (
                        <>
                          <th className="py-3 pr-3">LỚP SINH HOẠT</th>
                          <th className="py-3 pr-3">NGÀNH HỌC</th>
                        </>
                      ) : (
                        <>
                          <th className="py-3 pr-3">BỘ MÔN</th>
                          <th className="py-3 pr-3">KHOA</th>
                        </>
                      )}
                      <th className="py-3 pr-3">TRẠNG THÁI</th>
                      <th className="py-3 pr-6 text-right">THAO TÁC</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-borderLine text-textMain">
                    {paginatedList.map((user, index) => {
                      const isSelected = selectedIds.includes(user.id);
                      const isLocked = user.status === 'LOCKED';
                      const stt = (safePage - 1) * USERS_PAGE_SIZE + index + 1;

                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-admin-light/60' : 'hover:bg-canvas/70'
                          }`}
                        >
                          <td className="py-3.5 pl-6 pr-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelected(user.id)}
                              className="accent-admin cursor-pointer"
                              aria-label={`Chọn tài khoản ${user.name}`}
                            />
                          </td>

                          <td className="py-3.5 pr-3 text-center text-textSub font-medium">{stt}</td>

                          <td className="py-3.5 pr-3 font-semibold text-textMain">
                            {codeOf(user)}
                          </td>

                          <td className="py-3.5 pr-3 font-medium text-textMain">{user.name}</td>

                          <td className="py-3.5 pr-3 text-textSub">{user.email}</td>

                          {isStudentTab ? (
                            <>
                              <td className="py-3.5 pr-3 text-textSub">{user.class}</td>
                              <td className="py-3.5 pr-3 text-textSub">{user.major}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-3.5 pr-3 text-textSub">{user.department}</td>
                              <td className="py-3.5 pr-3 text-textSub">{user.faculty}</td>
                            </>
                          )}

                          <td className="py-3.5 pr-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                                isLocked
                                  ? 'bg-danger-light text-danger border-danger-border'
                                  : 'bg-success-light text-success border-success-border'
                              }`}
                            >
                              {USER_STATUS_LABELS[user.status] ?? user.status}
                            </span>
                          </td>

                          <td className="py-3.5 pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="Chỉnh sửa thông tin"
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsFormOpen(true);
                                }}
                                className="p-2 text-textSub hover:text-admin hover:bg-admin-light rounded-btn transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                onClick={() => requestToggleLock(user)}
                                className={`p-2 rounded-btn transition-colors cursor-pointer ${
                                  isLocked
                                    ? 'text-success hover:bg-success-light'
                                    : 'text-textMuted hover:text-danger hover:bg-danger-light'
                                }`}
                              >
                                {isLocked ? (
                                  <Unlock className="w-3.5 h-3.5" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                title="Đặt lại mật khẩu mặc định"
                                onClick={() => requestResetPassword(user)}
                                className="p-2 text-textSub hover:text-warning hover:bg-warning-light rounded-btn transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filteredList.length > 0 && (
              <div className="px-6 py-4 border-t border-borderLine">
                <Pagination
                  page={safePage}
                  pageSize={USERS_PAGE_SIZE}
                  totalItems={filteredList.length}
                  onPageChange={setCurrentPage}
                  itemLabel="tài khoản"
                  tone="admin"
                />
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modal M.13 / M.14 - Thêm mới & chỉnh sửa tài khoản (vai trò khóa theo tab) */}
      {isFormOpen && (
        <UserFormModal
          isOpen={isFormOpen}
          initialRole={activeTab}
          initialData={editingUser}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {/* Modal M.15 / M.19 - Xác nhận khóa, mở khóa, đặt lại mật khẩu */}
      <ConfirmDialog
        isOpen={Boolean(confirmConfig)}
        onClose={() => setConfirmConfig(null)}
        onConfirm={() => confirmConfig?.onConfirm?.()}
        tone={confirmConfig?.tone ?? 'warning'}
        title={confirmConfig?.title ?? ''}
        description={confirmConfig?.description ?? ''}
        confirmLabel={confirmConfig?.confirmLabel ?? 'Xác nhận'}
      />
    </div>
  );
}
