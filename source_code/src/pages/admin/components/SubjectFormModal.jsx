import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  Pencil,
  X,
  Info,
  Layers,
  Users,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  ListOrdered,
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import {
  SUBJECT_STATUS_LABELS,
  buildDepartmentFilterOptions,
  mockTeachersList,
} from '../../../data/admin';

/** Tab của Modal M.17 (FR-04.5). */
const FORM_TABS = [
  { value: 'INFO', label: '1. Thông tin chung', icon: Info },
  { value: 'CHAPTERS', label: '2. Chương kiến thức & Giảng viên', icon: Layers },
];

/** Số tiết mặc định cho một chương mới. */
const DEFAULT_CHAPTER_HOURS = 6;

/** Bộ môn phụ trách môn học (bỏ lựa chọn "Tất cả" của bộ lọc). */
const DEPARTMENT_OPTIONS = buildDepartmentFilterOptions()
  .filter((option) => option.value !== 'ALL')
  .map((option) => ({ value: option.value, label: option.label }));

/** Tiền tố số thứ tự trong tên chương, ví dụ 'Chương 3:' hoặc 'Chương 3 -'. */
const CHAPTER_PREFIX_PATTERN = /^\s*Chương\s*\d+\s*[:.-]\s*/i;

/** Bỏ tiền tố 'Chương N:' khỏi tên chương để đánh số lại theo vị trí mới. */
const stripChapterPrefix = (chapterName) =>
  String(chapterName ?? '').replace(CHAPTER_PREFIX_PATTERN, '').trim();

/** Đánh số lại thứ tự của mảng chương theo đúng vị trí hiển thị. */
const withNormalizedOrder = (chapterList) =>
  chapterList.map((chapter, index) => ({ ...chapter, order: index + 1 }));

/**
 * Modal M.17: Thêm / Sửa môn học & cấu trúc chương (FR-04.5).
 *
 * Tuân theo Quy chuẩn Thiết kế §2.5: modal đã có icon dấu X ở góc trên phải nên
 * chân modal KHÔNG có nút "Đóng"; ở chế độ chỉ đọc, chân modal chỉ còn nút
 * "Chỉnh sửa" để mở khoá biểu mẫu (FR-04.5).
 *
 * BẢNG CHƯƠNG SỬA TRỰC TIẾP: mỗi dòng là ô nhập liệu thật, nên Quản trị viên
 *  - đổi tên chương / số tiết ngay tại chỗ, và
 *  - đổi thứ tự chương bằng nút lên/xuống,
 * mà không phải xoá hết rồi nhập lại để sắp xếp lại cấu trúc môn học.
 *
 * Các trường chọn dùng `Dropdown` của Design System thay cho thẻ <select> mặc
 * định của trình duyệt; ô nhập liệu dùng `Input`. Vì `Dropdown` không phải phần
 * tử form gốc nên trạng thái chỉ đọc được truyền xuống từng trường.
 *
 * Props:
 *   isOpen, initialData (null khi thêm mới), onClose, onSave(payload)
 */
export default function SubjectFormModal({ isOpen, initialData, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('INFO');

  const [code, setCode] = useState(initialData?.code ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [credits, setCredits] = useState(initialData?.credits ?? 3);
  const [departmentId, setDepartmentId] = useState(
    initialData?.departmentId ?? DEPARTMENT_OPTIONS[0]?.value ?? ''
  );
  const [status, setStatus] = useState(initialData?.status ?? 'ACTIVE');

  const [teachers, setTeachers] = useState(initialData?.teachers ? [...initialData.teachers] : []);
  const [chapters, setChapters] = useState(
    initialData?.chapters ? withNormalizedOrder([...initialData.chapters]) : []
  );

  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterHours, setNewChapterHours] = useState(DEFAULT_CHAPTER_HOURS);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(!initialData);
  const isReadOnly = Boolean(initialData) && !isEditing;

  const totalHours = chapters.reduce((sum, chapter) => sum + (Number(chapter.hours) || 0), 0);

  /** Giảng viên chưa được gán cho môn này (không cho gán trùng). */
  const assignableTeacherOptions = useMemo(
    () =>
      mockTeachersList
        .filter((teacher) => !teachers.some((item) => item.teacherId === teacher.teacherId))
        .map((teacher) => ({
          value: teacher.id,
          label: `${teacher.degree} ${teacher.name} (${teacher.teacherId})`,
          description: teacher.department,
        })),
    [teachers]
  );

  const handleAddTeacher = () => {
    const found = mockTeachersList.find((teacher) => teacher.id === selectedTeacherId);
    if (!found) return;

    setTeachers([
      ...teachers,
      {
        teacherId: found.teacherId,
        name: found.name,
        degree: found.degree,
        department: found.department,
      },
    ]);
    setSelectedTeacherId('');
  };

  const handleRemoveTeacher = (teacherId) => {
    setTeachers(teachers.filter((item) => item.teacherId !== teacherId));
  };

  const handleAddChapter = () => {
    const title = newChapterName.trim();
    if (title === '') return;

    setChapters(
      withNormalizedOrder([
        ...chapters,
        {
          id: `CH_${Date.now()}`,
          name: title,
          hours: Number(newChapterHours) || 1,
        },
      ])
    );
    setNewChapterName('');
    setNewChapterHours(DEFAULT_CHAPTER_HOURS);
  };

  /** Sửa TRỰC TIẾP một chương đã có: đổi tên hoặc số tiết ngay tại dòng. */
  const handleChangeChapter = (chapterId, patch) => {
    setChapters((current) =>
      current.map((chapter) => (chapter.id === chapterId ? { ...chapter, ...patch } : chapter))
    );
  };

  /** Đổi thứ tự một chương lên/xuống một bậc, rồi đánh số lại toàn bộ. */
  const handleMoveChapter = (chapterId, direction) => {
    setChapters((current) => {
      const index = current.findIndex((chapter) => chapter.id === chapterId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;

      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return withNormalizedOrder(reordered);
    });
  };

  /** Xoá chương và đánh số lại thứ tự để không bị nhảy số. */
  const handleRemoveChapter = (chapterId) => {
    setChapters((current) =>
      withNormalizedOrder(current.filter((chapter) => chapter.id !== chapterId))
    );
  };

  /**
   * Đánh số lại tiền tố tên chương theo thứ tự hiện tại.
   * Hữu ích sau khi đổi thứ tự: tên chương khớp lại với vị trí mới.
   */
  const handleRenumberChapters = () => {
    setChapters((current) =>
      withNormalizedOrder(current).map((chapter, index) => ({
        ...chapter,
        name: `Chương ${index + 1}: ${stripChapterPrefix(chapter.name)}`.trim(),
      }))
    );
  };

  const handleSubmit = () => {
    const nextErrors = {};
    if (code.trim() === '') nextErrors.code = 'Vui lòng nhập mã môn học';
    if (name.trim() === '') nextErrors.name = 'Vui lòng nhập tên môn học';
    if (!credits || Number(credits) <= 0) nextErrors.credits = 'Số tín chỉ không hợp lệ';
    // Chương sửa trực tiếp nên phải chặn trường hợp xoá trắng tên rồi bấm lưu.
    if (chapters.some((chapter) => chapter.name.trim() === '')) {
      nextErrors.chapters = 'Tên chương không được để trống. Vui lòng nhập lại hoặc xoá chương đó.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setActiveTab(nextErrors.chapters ? 'CHAPTERS' : 'INFO');
      return;
    }

    onSave({
      code: code.trim(),
      name: name.trim(),
      credits: Number(credits),
      departmentId,
      status,
      teachers,
      /**
       * Chuẩn hoá chương trước khi lưu: `hours` phải là SỐ (ô nhập trả về chuỗi),
       * tên đã cắt khoảng trắng, và `order` đánh lại theo đúng thứ tự đang hiển thị
       * để Ma trận đề thi của giảng viên đọc ra cùng một cấu trúc.
       */
      chapters: chapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1,
        name: chapter.name.trim(),
        hours: Number(chapter.hours) || 0,
      })),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={BookMarked}
      tone="admin"
      size="lg"
      title={
        initialData ? `Môn học: ${initialData.name} (${initialData.code})` : 'Thêm mới môn học'
      }
      description={
        isReadOnly
          ? 'Biểu mẫu đang ở chế độ chỉ đọc để tránh sửa nhầm dữ liệu môn học.'
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
            Chỉnh sửa môn học
          </Button>
        ) : (
          <>
            <Button variant="outline" tone="neutral" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button variant="solid" tone="admin" onClick={handleSubmit} className="flex-1">
              {initialData ? 'Lưu thay đổi' : 'Tạo môn học'}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-5 text-xs">
        {/* Tabs chuyển giữa thông tin chung và cấu trúc chương (M.17) */}
        <div className="flex items-center gap-1 border-b border-borderLine">
          {FORM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'border-admin text-admin'
                    : 'border-transparent text-textMuted hover:text-textMain'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.value === 'CHAPTERS' && ` (${chapters.length})`}
              </button>
            );
          })}
        </div>

        {activeTab === 'INFO' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mã môn học *"
                placeholder="VD: 502051"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                error={errors.code}
                disabled={isReadOnly}
              />
              <Input
                label="Số tín chỉ *"
                type="number"
                min={1}
                max={10}
                value={credits}
                onChange={(event) => setCredits(event.target.value)}
                error={errors.credits}
                disabled={isReadOnly}
              />
            </div>

            <Input
              label="Tên môn học *"
              placeholder="VD: Hệ cơ sở dữ liệu"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              disabled={isReadOnly}
            />

            <Dropdown
              label="Bộ môn phụ trách"
              options={DEPARTMENT_OPTIONS}
              value={departmentId}
              onChange={setDepartmentId}
              disabled={isReadOnly}
            />

            <div>
              <span className="block text-xs font-semibold text-textMain mb-2">
                Trạng thái môn học
              </span>
              <div className="flex flex-wrap items-center gap-6">
                {['ACTIVE', 'LOCKED'].map((value) => {
                  const isActive = status === value;

                  return (
                    <label
                      key={value}
                      className={`flex items-center gap-2 ${
                        isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="subjectStatus"
                        value={value}
                        checked={isActive}
                        onChange={() => setStatus(value)}
                        disabled={isReadOnly}
                        className="accent-admin"
                      />
                      <span className="font-medium text-textMain">
                        {SUBJECT_STATUS_LABELS[value]}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-textMuted leading-relaxed">
                Môn ở trạng thái <strong className="text-textMain">Tạm khóa</strong> sẽ không xuất
                hiện khi giảng viên tạo ma trận đề thi mới.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'CHAPTERS' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
                Giảng viên phụ trách môn học
              </h4>

              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-[240px]">
                  <Dropdown
                    options={assignableTeacherOptions}
                    value={selectedTeacherId}
                    onChange={setSelectedTeacherId}
                    placeholder="Chọn giảng viên từ hệ thống để gán"
                    emptyMessage="Tất cả giảng viên đã được gán cho môn này"
                    searchable
                    searchPlaceholder="Tìm theo tên hoặc mã giảng viên..."
                    disabled={isReadOnly || assignableTeacherOptions.length === 0}
                  />
                </div>

                <Button
                  variant="solid"
                  tone="admin"
                  icon={Plus}
                  onClick={handleAddTeacher}
                  disabled={isReadOnly || selectedTeacherId === ''}
                >
                  Gán
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {teachers.length === 0 ? (
                  <span className="italic text-textMuted">Chưa có giảng viên nào được gán.</span>
                ) : (
                  teachers.map((teacher) => (
                    <span
                      key={teacher.teacherId}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-borderLine font-medium text-textMain"
                    >
                      <Users className="w-3.5 h-3.5 text-admin" />
                      {teacher.degree} {teacher.name} ({teacher.teacherId})
                      <button
                        type="button"
                        onClick={() => handleRemoveTeacher(teacher.teacherId)}
                        disabled={isReadOnly}
                        aria-label={`Bỏ gán ${teacher.name}`}
                        className="ml-1 text-textMuted hover:text-danger transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-borderLine">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
                  Cấu trúc chương kiến thức
                </h4>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-textMuted">
                    {chapters.length} chương · {totalHours} tiết
                  </span>
                  <Button
                    variant="outline"
                    tone="neutral"
                    size="xs"
                    icon={ListOrdered}
                    onClick={handleRenumberChapters}
                    disabled={isReadOnly || chapters.length === 0}
                  >
                    Đánh số lại tên chương
                  </Button>
                </div>
              </div>

              {errors.chapters && (
                <p className="text-xs font-medium text-danger">{errors.chapters}</p>
              )}

              <div className="flex flex-wrap items-end gap-3 p-3 bg-canvas border border-borderLine rounded-widget">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    size="sm"
                    placeholder="Tên chương mới (VD: Chương 6: Tối ưu truy vấn)"
                    value={newChapterName}
                    onChange={(event) => setNewChapterName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddChapter();
                      }
                    }}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="w-24">
                  <Input
                    size="sm"
                    type="number"
                    min={1}
                    value={newChapterHours}
                    onChange={(event) => setNewChapterHours(event.target.value)}
                    suffix="tiết"
                    disabled={isReadOnly}
                  />
                </div>

                <Button
                  variant="solid"
                  tone="admin"
                  icon={Plus}
                  onClick={handleAddChapter}
                  disabled={isReadOnly || newChapterName.trim() === ''}
                >
                  Thêm chương
                </Button>
              </div>

              <div className="border border-borderLine rounded-widget overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-canvas text-textMuted font-semibold border-b border-borderLine">
                      <th className="py-2 px-3 w-12 text-center">STT</th>
                      <th className="py-2 px-3 w-20 text-center">THỨ TỰ</th>
                      <th className="py-2 px-3">TÊN CHƯƠNG (sửa trực tiếp)</th>
                      <th className="py-2 px-3 w-32 text-center">SỐ TIẾT</th>
                      <th className="py-2 px-3 w-16 text-right">XÓA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderLine">
                    {chapters.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-textMuted">
                          Chưa có chương nào được tạo. Môn học không có chương sẽ không dùng được
                          cho ma trận đề thi.
                        </td>
                      </tr>
                    ) : (
                      chapters.map((chapter, index) => (
                        <tr key={chapter.id} className="hover:bg-canvas/60">
                          <td className="py-2 px-3 text-center font-bold text-textMuted">
                            {index + 1}
                          </td>

                          {/* Đổi thứ tự chương ngay trên dòng, không cần xoá rồi nhập lại. */}
                          <td className="py-2 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                title="Đưa chương lên trên"
                                onClick={() => handleMoveChapter(chapter.id, -1)}
                                disabled={isReadOnly || index === 0}
                                aria-label={`Đưa ${chapter.name} lên trên`}
                                className="p-1.5 text-textSub hover:text-admin hover:bg-admin-light rounded-btn transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Đưa chương xuống dưới"
                                onClick={() => handleMoveChapter(chapter.id, 1)}
                                disabled={isReadOnly || index === chapters.length - 1}
                                aria-label={`Đưa ${chapter.name} xuống dưới`}
                                className="p-1.5 text-textSub hover:text-admin hover:bg-admin-light rounded-btn transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Ô nhập tại chỗ: đổi tên chương không cần xoá rồi tạo lại. */}
                          <td className="py-2 px-3">
                            <Input
                              size="sm"
                              value={chapter.name}
                              onChange={(event) =>
                                handleChangeChapter(chapter.id, { name: event.target.value })
                              }
                              placeholder="VD: Chương 6: Tối ưu truy vấn"
                              disabled={isReadOnly}
                              aria-label={`Tên chương ${index + 1}`}
                            />
                          </td>

                          <td className="py-2 px-3">
                            <Input
                              size="sm"
                              type="number"
                              min={1}
                              value={chapter.hours}
                              onChange={(event) =>
                                handleChangeChapter(chapter.id, { hours: event.target.value })
                              }
                              suffix="tiết"
                              disabled={isReadOnly}
                              aria-label={`Số tiết chương ${index + 1}`}
                            />
                          </td>

                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveChapter(chapter.id)}
                              disabled={isReadOnly}
                              aria-label={`Xoá ${chapter.name}`}
                              className="p-1.5 text-textMuted hover:text-danger hover:bg-danger-light rounded-btn transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!initialData && (
          <div className="p-3 bg-admin-subtle border border-admin-ring rounded-widget text-[11px] text-admin">
            Sau khi tạo, môn học sẽ xuất hiện trong Ngân hàng câu hỏi và Ma trận đề thi của giảng
            viên được phân công.
          </div>
        )}
      </div>
    </Modal>
  );
}
