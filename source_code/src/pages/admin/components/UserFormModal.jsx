import React, { useMemo, useState } from 'react';
import { UserCog, Pencil, Info, Lock, AlertCircle } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import {
  FILTER_ALL,
  USER_ROLE_LABELS,
  buildClassFilterOptions,
  buildDepartmentFilterOptions,
  buildMajorFilterOptions,
  mockAdminClasses,
  mockAdminDepartments,
  mockAdminFaculties,
  mockAdminMajors,
} from '../../../data/admin';
import { DEFAULT_PASSWORD_SUFFIX } from '../../../data/shared/authAccounts';

/** Học vị hợp lệ của giảng viên. */
const DEGREE_OPTIONS = ['ThS.', 'TS.', 'PGS.TS.', 'GS.TS.'].map((value) => ({
  value,
  label: value,
}));

/** Chức danh hợp lệ của giảng viên. */
const POSITION_OPTIONS = [
  'Giảng viên',
  'Giảng viên chính',
  'Trưởng bộ môn',
  'Phó trưởng bộ môn',
].map((value) => ({ value, label: value }));

const FACULTY_NAME = mockAdminFaculties[0]?.name ?? '';

/** Bỏ lựa chọn "Tất cả" của bộ lọc để dùng lại làm danh sách chọn trong biểu mẫu. */
const toPickList = (options) => options.filter((option) => option.value !== FILTER_ALL);

/** Thông báo lỗi dưới một trường chưa dùng `Input` của Design System. */
function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

/**
 * Modal M.13 / M.14: Thêm mới & chỉnh sửa tài khoản người dùng (FR-03.3, FR-03.4).
 *
 * Tuân theo Quy chuẩn Thiết kế §2.5: modal đã có icon dấu X ở góc trên phải thì
 * chân modal KHÔNG có nút "Đóng", chỉ còn các nút thao tác chính.
 *
 * Ràng buộc nghiệp vụ:
 *  - Vai trò KHOÁ theo tab đang mở ở màn hình Quản lý người dùng.
 *  - Ngành học (Sinh viên) và Bộ môn (Giảng viên) là HAI NHÃN của CÙNG một đơn vị.
 *  - Lớp sinh hoạt chỉ liệt kê các lớp thuộc ngành đang chọn (bộ lọc phụ thuộc).
 *
 * Props:
 *   isOpen, initialRole ('STUDENT' | 'TEACHER'), initialData (null khi thêm mới),
 *   onClose, onSave(payload)
 */
export default function UserFormModal({ isOpen, initialRole, initialData, onClose, onSave }) {
  /** Vai trò bám theo tab đang mở khi thêm mới, và theo tài khoản khi chỉnh sửa. */
  const role = initialData ? (initialData.studentId ? 'STUDENT' : 'TEACHER') : initialRole;
  const isStudentRole = role === 'STUDENT';

  const [identifier, setIdentifier] = useState(
    initialData?.studentId ?? initialData?.teacherId ?? ''
  );
  const [name, setName] = useState(initialData?.name ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');

  const [departmentId, setDepartmentId] = useState(
    initialData?.departmentId ?? mockAdminDepartments[0]?.id ?? ''
  );
  const [classId, setClassId] = useState(initialData?.classId ?? '');

  const [degree, setDegree] = useState(initialData?.degree ?? DEGREE_OPTIONS[0].value);
  const [position, setPosition] = useState(
    initialData?.position ?? POSITION_OPTIONS[0].value
  );

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(!initialData);
  const isReadOnly = Boolean(initialData) && !isEditing;

  /** Danh mục đơn vị: nhãn đổi theo vai trò nhưng cùng một danh sách. */
  const unitOptions = useMemo(
    () =>
      toPickList(
        isStudentRole
          ? buildMajorFilterOptions('-- Chọn ngành học --')
          : buildDepartmentFilterOptions('-- Chọn bộ môn --')
      ),
    [isStudentRole]
  );

  /** Lớp sinh hoạt hợp lệ = các lớp thuộc đơn vị đang chọn. */
  const classOptions = useMemo(
    () => toPickList(buildClassFilterOptions(departmentId, '-- Chọn lớp sinh hoạt --')),
    [departmentId]
  );

  const resolvedClassId =
    classId && classOptions.some((option) => option.value === classId)
      ? classId
      : classOptions[0]?.value ?? '';

  const resolvedUnitName = isStudentRole
    ? mockAdminMajors.find((major) => major.id === departmentId)?.name ?? ''
    : mockAdminDepartments.find((department) => department.id === departmentId)?.name ?? '';
  const resolvedClassName =
    mockAdminClasses.find((classItem) => classItem.id === resolvedClassId)?.name ?? '';

  const codeLabel = isStudentRole ? 'Mã số sinh viên (MSSV)' : 'Mã giảng viên (MSGV)';
  const defaultPassword = `${identifier || '{Mã định danh}'}${DEFAULT_PASSWORD_SUFFIX}`;

  /** Đổi đơn vị thì bỏ lớp đang chọn để không lưu lớp của ngành khác. */
  const handleChangeUnit = (nextDepartmentId) => {
    setDepartmentId(nextDepartmentId);
    setClassId('');
  };

  const handleSubmit = () => {
    const nextErrors = {};
    if (identifier.trim() === '') nextErrors.identifier = 'Vui lòng nhập mã định danh';
    if (name.trim() === '') nextErrors.name = 'Vui lòng nhập họ và tên';
    if (email.trim() === '') nextErrors.email = 'Vui lòng nhập email';
    if (isStudentRole && resolvedClassId === '') {
      nextErrors.classId = 'Vui lòng chọn lớp sinh hoạt';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (isStudentRole) {
      onSave({
        studentId: identifier.trim(),
        name: name.trim(),
        email: email.trim(),
        facultyId: mockAdminFaculties[0]?.id,
        faculty: FACULTY_NAME,
        /**
         * Ngành học (majorId/major) và Bộ môn (departmentId/department) là hai
         * nhãn của CÙNG một đơn vị, nên cả hai đều suy ra từ `departmentId`.
         */
        majorId: departmentId,
        major: resolvedUnitName,
        departmentId,
        department: mockAdminDepartments.find((item) => item.id === departmentId)?.name ?? '',
        classId: resolvedClassId,
        class: resolvedClassName,
      });
      return;
    }

    onSave({
      teacherId: identifier.trim(),
      name: name.trim(),
      email: email.trim(),
      degree,
      position,
      academicTitle: position,
      facultyId: mockAdminFaculties[0]?.id,
      faculty: FACULTY_NAME,
      departmentId,
      department: resolvedUnitName,
      managedSubjectCodes: initialData?.managedSubjectCodes ?? [],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={UserCog}
      tone="admin"
      size="lg"
      title={
        initialData
          ? `Tài khoản: ${initialData.name} (${initialData.studentId ?? initialData.teacherId})`
          : `Thêm mới tài khoản ${USER_ROLE_LABELS[role].toLowerCase()}`
      }
      description={
        isReadOnly
          ? 'Thông tin tài khoản đang ở chế độ chỉ đọc để tránh sửa nhầm.'
          : undefined
      }
      /* §2.5: đã có dấu X ở góc phải nên chân modal chỉ chứa nút thao tác. */
      footer={
        isReadOnly ? (
          <Button
            variant="solid"
            tone="admin"
            icon={Pencil}
            onClick={() => setIsEditing(true)}
            fullWidth
          >
            Chỉnh sửa thông tin
          </Button>
        ) : (
          <>
            <Button variant="outline" tone="neutral" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button variant="solid" tone="admin" onClick={handleSubmit} className="flex-1">
              {initialData ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4 text-xs">
        {/*
          Vai trò khoá theo tab đang mở: hai lựa chọn vẫn hiển thị để người dùng
          biết loại tài khoản đang tạo, nhưng không thể đổi.
        */}
        <div className="p-3.5 bg-canvas border border-borderLine rounded-widget">
          <span className="block text-xs font-semibold text-textMain mb-2">Vai trò tài khoản</span>
          <div className="flex flex-wrap items-center gap-6">
            {['STUDENT', 'TEACHER'].map((value) => {
              const isActive = role === value;

              return (
                <span
                  key={value}
                  className={`flex items-center gap-2 ${isActive ? '' : 'opacity-40'}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isActive ? 'border-admin' : 'border-borderLine'
                    }`}
                  >
                    {isActive && <span className="w-2 h-2 rounded-full bg-admin"></span>}
                  </span>
                  <span className="font-medium text-textMain">{USER_ROLE_LABELS[value]}</span>
                </span>
              );
            })}
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-textMuted">
            <Lock className="w-3 h-3" />
            Vai trò được cố định theo tab đang chọn ở màn hình Quản lý người dùng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`${codeLabel} *`}
            placeholder={isStudentRole ? 'VD: 52000123' : 'VD: GV2026_0982'}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            error={errors.identifier}
            disabled={isReadOnly}
          />
          <Input
            label="Họ và tên *"
            placeholder="VD: Nguyễn Văn A"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            disabled={isReadOnly}
          />
        </div>

        <Input
          label="Địa chỉ Email *"
          type="email"
          placeholder="VD: nguyenvanb@tdtu.edu.vn"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          disabled={isReadOnly}
        />

        <Input label="Khoa" value={FACULTY_NAME} disabled readOnly />

        <Dropdown
          label={isStudentRole ? 'Ngành học *' : 'Bộ môn công tác *'}
          options={unitOptions}
          value={departmentId}
          onChange={handleChangeUnit}
          disabled={isReadOnly}
          searchable={unitOptions.length > 6}
          searchPlaceholder="Tìm theo tên ngành hoặc bộ môn..."
        />
        <p className="text-[11px] text-textMuted leading-relaxed -mt-2">
          {isStudentRole
            ? 'Ngành học của sinh viên chính là Bộ môn của giảng viên, hệ thống dùng chung một danh mục đơn vị.'
            : 'Bộ môn và Ngành học dùng chung một danh mục đơn vị: đây chính là đơn vị mà sinh viên thuộc ngành tương ứng đang theo học.'}
        </p>

        {isStudentRole && (
          <div>
            <Dropdown
              label="Lớp sinh hoạt *"
              options={classOptions}
              value={resolvedClassId}
              onChange={setClassId}
              disabled={isReadOnly || classOptions.length === 0}
              placeholder="Chọn lớp sinh hoạt"
              emptyMessage="Ngành học này chưa có lớp sinh hoạt"
              searchable={classOptions.length > 6}
            />
            {errors.classId ? (
              <FieldError message={errors.classId} />
            ) : (
              <p className="mt-1.5 text-[11px] text-textMuted leading-relaxed">
                Chỉ gồm các lớp thuộc ngành{' '}
                <strong className="text-textMain">{resolvedUnitName || '-'}</strong>. Đổi ngành học
                sẽ nạp lại danh sách lớp tương ứng.
              </p>
            )}
          </div>
        )}

        {!isStudentRole && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              label="Học vị"
              options={DEGREE_OPTIONS}
              value={degree}
              onChange={setDegree}
              disabled={isReadOnly}
            />
            <Dropdown
              label="Chức danh"
              options={POSITION_OPTIONS}
              value={position}
              onChange={setPosition}
              disabled={isReadOnly}
            />
          </div>
        )}

        {!initialData && (
          <div className="flex items-start gap-2 p-3 bg-admin-subtle border border-admin-ring rounded-widget text-[11px] text-admin">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Mật khẩu khởi tạo mặc định của tài khoản là <strong>{defaultPassword}</strong>. Người
              dùng nên đổi mật khẩu ở lần đăng nhập đầu tiên.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
