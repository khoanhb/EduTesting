import React, { useState, useRef } from 'react';
import { Camera, Edit2, Eye, EyeOff } from 'lucide-react';
import StudentHeader from '../../components/common/StudentHeader';
import ToastNotification from '../../components/common/ToastNotification';
import { DEFAULT_STUDENT_ID } from '../../data/shared/authAccounts';
import { getStudentByCode } from '../../data/shared/organization';

/**
 * Hồ sơ sinh viên lấy từ danh sách canonical, nên "Ngành" hiển thị ở đây luôn
 * là đúng đơn vị mà Quản lý người dùng và Quản lý môn học đang dùng, Ngành học
 * và Bộ môn là hai nhãn của cùng một đơn vị.
 */
const canonicalStudent = getStudentByCode(DEFAULT_STUDENT_ID);

export default function StudentProfilePage() {
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [phone, setPhone] = useState('0901234567');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      showToast('Cập nhật thành công!');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <StudentHeader avatar={avatar} />

      <ToastNotification 
        type="success"
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Thông tin cá nhân</h1>
          <p className="text-xs text-[#475569] mt-1">Quản lý thông tin định danh, liên hệ và cập nhật mật khẩu.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Thông tin tài khoản</h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 shrink-0">
                <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-[#E2E8F0]" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white rounded-full shadow-md transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Nguyễn Văn A</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#E0F2FE] text-[#06B6D4] text-[11px] font-semibold rounded">
                  Sinh viên chính quy
                </span>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setIsEditingPhone(false); showToast('Cập nhật thành công!'); }} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Mã số sinh viên</label>
                <input type="text" disabled value="52000000" className="w-full px-3.5 py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-[8px] border border-[#E2E8F0] cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Lớp sinh hoạt</label>
                <input type="text" disabled value="21050301" className="w-full px-3.5 py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-[8px] border border-[#E2E8F0] cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Họ và tên</label>
                <input type="text" disabled value="Nguyễn Văn A" className="w-full px-3.5 py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-[8px] border border-[#E2E8F0] cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Email trường</label>
                <input type="text" disabled value="52000000@student.tdtu.edu.vn" className="w-full px-3.5 py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-[8px] border border-[#E2E8F0] cursor-not-allowed" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#475569]">Số điện thoại</label>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingPhone(!isEditingPhone)}
                    className="text-[#06B6D4] hover:underline flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Chỉnh sửa
                  </button>
                </div>
                <input 
                  type="text" 
                  disabled={!isEditingPhone}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-[8px] border transition-colors ${
                    isEditingPhone ? 'border-[#06B6D4] bg-white focus:outline-none' : 'border-[#E2E8F0] bg-white text-[#0F172A]'
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Khoa</label>
                <input type="text" disabled value="Công nghệ thông tin" className="w-full px-3.5 py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-[8px] border border-[#E2E8F0] cursor-not-allowed" />
              </div>
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Ngành</label>
                <input
                  type="text"
                  disabled
                  value={canonicalStudent?.majorName ?? ''}
                  className="w-full px-3.5 py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-[8px] border border-[#E2E8F0] cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
              >
                Lưu thông tin cá nhân
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A] mb-4">Đổi mật khẩu</h2>

              <form onSubmit={(e) => { e.preventDefault(); setCurrentPw(''); setNewPw(''); setConfirmPw(''); showToast('Cập nhật thành công!'); }} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPw ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-9 border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8]">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Mật khẩu mới (tối thiểu 8 ký tự)</label>
                  <div className="relative">
                    <input 
                      type={showNewPw ? "text" : "password"}
                      placeholder="Tối thiểu 8 ký tự"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-9 border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8]">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPw ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-9 border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#06B6D4]"
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8]">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#94A3B8]">
                  ⓘ Mật khẩu gồm ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}
                    className="px-5 py-2.5 border border-[#E2E8F0] text-[#475569] font-semibold rounded-[8px] hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold rounded-[8px] transition-colors shadow-sm cursor-pointer"
                  >
                    Cập nhật mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#94A3B8] py-4 border-t border-[#E2E8F0]">
        © 2026 EduTesting - Nền tảng khảo thí trực tuyến thông minh
      </footer>
    </div>
  );
}
