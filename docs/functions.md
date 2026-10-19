# CHỨC NĂNG NHÓM TRIỂN KHAI

Tài liệu mô tả chức năng mục tiêu. FE hiện dùng mock và state trong trình duyệt, chưa tích hợp API hoặc database; xem [hướng dẫn frontend](../source_code/README.md). Quy tắc chi tiết theo [yêu cầu chức năng](functional-requirements.md).

---

Admin/Giảng viên: Quản lý ngân hàng câu hỏi, tạo đề thi, xem thống kê toàn lớp, theo dõi gian lận.

Sinh viên: Xem danh sách bài thi được giao, làm bài, xem điểm và giải thích cá nhân.

Chung: Cả hai vai trò đều có quyền truy cập.

---

**1\. Quản lý Tài khoản (Phân quyền: Tất cả)**

* Đăng nhập: Xác thực người dùng bằng MSSV/MSGV và Mật khẩu.  
* Quên mật khẩu: Gửi mã xác thực/liên kết đặt lại mật khẩu về email.  
* Đăng xuất: Hủy phiên làm việc hiện tại và điều hướng về trang đăng nhập.  
* Quản lý thông tin cá nhân: Xem/cập nhật họ tên, thông tin liên hệ và đổi mật khẩu.

**2\. Ngân hàng câu hỏi (Phân quyền: Giảng viên)**

* Xem danh sách câu hỏi: Bảng hiển thị toàn bộ câu hỏi hiện có trong kho dữ liệu.  
* Tìm kiếm câu hỏi: Tra cứu nhanh nội dung câu hỏi theo từ khóa.  
* Lọc câu hỏi theo môn/chủ đề: Gom nhóm câu hỏi theo từng môn học hoặc chương/bài học cụ thể.  
* Phân loại dạng câu hỏi: Hỗ trợ câu hỏi Chọn 1 đáp án, Chọn nhiều đáp án, Đúng/Sai, và Tự luận ngắn / Điền từ khuyết (nhập từ/cụm từ hoặc giá trị số).  
  * Cấu hình đáp án tự luận ngắn: Cho phép giảng viên nhập danh sách các từ khóa/đáp án chấp nhận được (chính xác hoặc không phân biệt hoa/thường) để hệ thống tự động so khớp.  
* Thêm câu hỏi: Tạo mới câu hỏi trắc nghiệm thủ công (nhập đề bài, các phương án, chọn đáp án đúng).  
* Chỉnh sửa câu hỏi: Cập nhật lại nội dung đề bài, các phương án lựa chọn hoặc độ khó.  
* Xóa câu hỏi: Xóa câu hỏi đơn lẻ hoặc xóa hàng loạt khỏi ngân hàng.  
* Phân loại độ khó (Dễ / Trung bình / Khó): Gắn nhãn độ khó để phục vụ tạo đề thi theo ma trận chuẩn.  
* Xem đáp án và lời giải: Hiển thị chi tiết đáp án đúng kèm giải thích giải pháp từng bước.

**3\. Tạo câu hỏi bằng AI (Phân quyền: Giảng viên)**

* Chọn môn/chủ đề: Định hướng ngữ cảnh kiến thức cần AI tập trung sinh nội dung.  
* Nhập nội dung kiến thức: Dán đoạn văn bản tài liệu, bài giảng hoặc tài liệu tóm tắt vào prompt.  
* Chọn số lượng & loại câu hỏi: Cấu hình số lượng câu và dạng câu hỏi cần sinh (Chọn 1, Nhiều đáp án, Đúng/Sai).  
* Chọn độ khó: Yêu cầu AI sinh câu hỏi theo mức độ nhận thức mong muốn (Dễ, Trung bình, Khó).  
* AI tự động sinh câu hỏi: Mô hình AI phân tích dữ liệu đầu vào và tạo ra nội dung câu hỏi hoàn chỉnh.  
* AI tự động sinh đáp án: AI tự trích xuất đáp án đúng kèm các phương án nhiễu (distractors) hợp lý.  
* Xem trước câu hỏi: Giao diện xem trước danh sách câu hỏi AI vừa tạo dưới dạng thẻ card trực quan.  
* Chỉnh sửa câu hỏi do AI tạo: Cho phép giảng viên sửa lại câu chữ, thay đổi đáp án đúng nếu AI sinh chưa chuẩn.  
* Sinh lại câu hỏi: Bấm tạo lại lượt mới nếu chưa ưng ý với kết quả hiện tại.  
* Thêm câu hỏi vào ngân hàng: Lưu các câu hỏi AI đã duyệt vào ngân hàng dữ liệu chính thức.

**4\. Quản lý đề thi (Phân quyền: Giảng viên)**

* Tạo đề thi: Tạo mới một kỳ thi với tên đề, môn học và mã phòng thi.  
* Chọn câu hỏi từ ngân hàng: Chọn thủ công từng câu hỏi cụ thể đưa vào đề.  
* Tự động tạo đề: Hệ thống tự bốc câu hỏi ngẫu nhiên từ ngân hàng theo số lượng và tỷ lệ độ khó định trước.  
* Chọn số lượng câu hỏi: Cấu hình tổng số câu trong bài thi (VD: 40 câu).  
* Xáo trộn thứ tự câu hỏi: Tự động đảo vị trí các câu hỏi để mỗi thí sinh có một mã đề/thứ tự khác nhau.  
* Xáo trộn thứ tự đáp án: Đảo vị trí các phương án A, B, C, D của từng câu hỏi.  
* Cài đặt thời gian làm bài: Thiết lập thời lượng thi (VD: 45 phút, 60 phút) và khung giờ mở đề thi.  
* Cài đặt điểm số: Quy định thang điểm tổng (thang 10\) hoặc trọng số điểm cho từng câu.  
* Cấu hình quyền xem lại bài: Bật/tắt tùy chọn cho phép sinh viên xem đáp án chi tiết sau khi nộp.  
* Xuất bản đề thi: Chuyển trạng thái đề từ Bản nháp sang Hoạt động để sinh viên có thể thấy và làm bài.  
* Chỉnh sửa đề thi: Cập nhật thông tin, cấu hình hoặc cơ cấu câu hỏi (chỉ khi đề chưa bắt đầu diễn ra).  
* Xóa đề thi: Hủy bỏ đề thi khỏi danh sách quản trị.  
* Cấu hình số lượt thi: Cho phép giảng viên thiết lập số lần làm bài (1 lần duy nhất hoặc nhiều lần đối với các đề luyện tập, trắc nghiệm ôn tập).

**5\. Làm bài thi (Phân quyền: Sinh viên)**

* Xem danh sách bài thi: Danh sách các kỳ thi đang mở hoặc sắp diễn ra mà sinh viên được phân quyền tham gia.  
* Xem thông tin đề thi: Hiển thị quy chế thi, thời gian làm bài, số lượng câu hỏi trước khi bấm bắt đầu.  
* Bắt đầu làm bài: Khởi động phòng thi, áp dụng giám sát theo cấu hình và bật bộ đếm giờ. FE hiện theo dõi chuyển tab/mất tiêu điểm/thu nhỏ cửa sổ, không tự kích hoạt toàn màn hình.  
* Hiển thị câu hỏi và đáp án: Giao diện trình bày linh hoạt theo loại câu hỏi: Nút chọn Radio/Checkbox đối với trắc nghiệm, hoặc Ô nhập văn bản (Input/Textarea ngắn) đối với câu hỏi điền từ/tự luận ngắn..  
* Chọn đáp án: Thao tác click chọn phương án trả lời.  
* Chuyển câu trước/sau: Nút điều hướng tuần tự ("Câu trước", "Câu tiếp theo").  
* Chọn nhanh câu hỏi (Question Palette): Bảng lưới các số câu (1, 2, 3...) cho phép nhảy thẳng đến câu bất kỳ.  
* Đánh dấu câu hỏi cần xem lại: Gắn cờ (Flag) vào những câu chưa chắc chắn để quay lại kiểm tra trước khi nộp.  
* Đồng hồ đếm ngược: Hiển thị thời gian còn lại theo thời gian thực (đổi màu cảnh báo khi còn dưới 5 phút).  
* Tự động lưu đáp án: Hệ thống ngầm lưu câu trả lời sau mỗi lần chọn, tránh mất dữ liệu khi mất kết nối mạng.  
* Nộp bài: Nút chủ động nộp bài khi thí sinh đã hoàn thành trước thời hạn.  
* Tự động nộp khi hết giờ: Hệ thống tự động khóa giao diện và nộp kết quả ngay khi đồng hồ về 00:00.  
* Theo dõi lượt thi cá nhân: Hiển thị số lượt làm bài còn lại của sinh viên trước khi bấm bắt đầu.

**6\. Chấm điểm & Kết quả (Phân quyền: Sinh viên & Giảng viên)**

* Tự động chấm điểm kết hợp:  
  * Đối với trắc nghiệm: Chấm tự động 100%.  
  * Đối với tự luận ngắn: Hệ thống tự động so khớp từ khóa (Exact Match / Keyword Match) do giảng viên thiết lập trước.  
  * Cho phép giảng viên can thiệp chấm tay (chấm bổ sung/điều chỉnh điểm) đối với các câu trả lời tự luận mà code không nhận diện được.  
* Trạng thái chờ chấm điểm: Nếu đề có câu tự luận dài/phức tạp chưa cấu hình từ khóa, hệ thống hiển thị trạng thái 'Chờ giảng viên chấm' trước khi công bố điểm chính thức.  
* Hiển thị điểm sau khi nộp: Chỉ hiển thị khi điểm đã được công bố và bài không đang chờ xử lý vi phạm; cấu hình kỳ thi quyết định quyền công bố.  
* Hiển thị số câu đúng/sai: Chỉ hiển thị chi tiết khi đồng thời được xem điểm và xem lại bài; không lộ đúng/sai khi điểm chưa được công bố.  
* Hiển thị tỷ lệ chính xác: Chỉ hiển thị khi được phép xem chi tiết chấm điểm.  
* Hiển thị thời gian làm bài: Thống kê tổng số phút/giây thí sinh đã dùng để hoàn thành bài thi.  
* Xem lại bài làm: Cho phép sinh viên xem bài đã làm theo cấu hình allowReview và trạng thái xử lý. Nếu chưa được công bố điểm, chỉ hiển thị bài làm bằng nhãn trung tính, không kèm đáp án chuẩn/điểm/lời giải.  
* Xem đáp án đúng/sai: Hiển thị rõ câu nào đúng (highlight xanh), câu nào sai (highlight đỏ) kèm lời giải (nếu giảng viên cho phép).

**7\. Thống kê & Phân tích (Phân quyền: Giảng viên)**

* Xem kết quả của sinh viên: Bảng tổng hợp điểm số và thời gian nộp bài của toàn bộ danh sách lớp thi.  
* Điểm trung bình: Giá trị điểm trung bình cộng của cả phòng thi/lớp học.  
* Điểm cao nhất/thấp nhất: Xác định mức điểm trần (Max) và điểm sàn (Min) của kỳ thi.  
* Tỷ lệ đạt: Tỷ lệ % sinh viên vượt qua ngưỡng điểm chuẩn (VD: điểm \>= 5.0).  
* Phân bố điểm (Phổ điểm): Biểu đồ cột thể hiện số lượng sinh viên rơi vào từng khoảng điểm (0-4, 5-6, 7-8, 9-10).  
* Tỷ lệ trả lời đúng của từng câu: Thống kê % thí sinh làm đúng từng câu hỏi cụ thể.  
* Phân tích độ khó câu hỏi: Đánh giá lại độ khó thực tế của câu hỏi dựa trên kết quả thi (tỷ lệ làm đúng).

**8\. Phát hiện gian lận (Phân quyền: Sinh viên \- nhận cảnh báo / Giảng viên \- xem báo cáo)**

* Theo dõi hành vi khi làm bài: Hệ thống theo dõi trạng thái tương tác của trình duyệt trong suốt buổi thi.  
* Phát hiện chuyển tab/thoát khỏi màn hình thi: Kích hoạt sự kiện khi thí sinh chuyển sang tab khác, thu nhỏ trình duyệt hoặc mở cửa sổ mới.  
* Ghi nhận hành vi bất thường: Lưu lại mốc thời gian (timestamp) và loại hành vi vi phạm vào hệ thống log.  
* Cảnh báo gian lận: Hiển thị popup cảnh báo tức thì trên màn hình thí sinh.  
* Thống kê số lần vi phạm: Bộ đếm số lần thí sinh rời tab (VD: lần thứ 3 đình chỉ và kết thúc lượt thi khi bật giám sát).  
* Đánh giá mức độ nghi ngờ: Gắn nhãn mức độ rủi ro (Bình thường / Đáng ngờ / Gian lận cao) bên cạnh tên thí sinh trên bảng điều khiển của Giảng viên.

**9\. Thống kê tổng quan hệ thống (Phân quyền: Quản trị viên)**

* Thống kê số liệu: Đếm tổng số tài khoản (Giảng viên, Sinh viên), tổng số môn học hiện có và tổng số kỳ thi đã/đang tổ chức trong học kỳ.  
* Theo dõi ca thi trực tiếp: Xem danh sách các đề thi đang trong khung giờ mở làm bài và số lượng thí sinh đang trực tuyến làm bài.

#### **10\. Quản lý người dùng & Tài khoản (Phân quyền: Quản trị viên)**

* Xem danh sách tài khoản: Bảng hiển thị danh sách người dùng, chuyển đổi nhanh qua 2 tab Giảng viên và Sinh viên.  
* Tìm kiếm & Lọc: Tìm theo MSSV, MSGV, Họ tên, Email hoặc lọc theo trạng thái tài khoản.  
* Thêm tài khoản thủ công: Form tạo tài khoản đơn lẻ (Mã số, Họ tên, Email, Vai trò ban đầu).  
* Nhập danh sách hàng loạt (Import Excel): Tải lên file .xlsx danh sách sinh viên/giảng viên theo định dạng mẫu.  
* Khóa / Mở khóa tài khoản: Vô hiệu hóa hoặc kích hoạt lại quyền đăng nhập của người dùng.  
* Đặt lại mật khẩu mặc định: Hỗ trợ cấp lại mật khẩu mặc định khi người dùng gặp sự cố quên thông tin.

#### **11\. Quản lý Môn học & Chủ đề kiến thức (Phân quyền: Quản trị viên)**

* Xem danh mục môn học: Bảng hiển thị toàn bộ môn học trong hệ thống (Mã môn, Tên môn, Số tín chỉ, Trạng thái hoạt động).  
* Thêm / Sửa / Xóa môn học: Khai báo môn học mới hoặc cập nhật thông tin môn học.  
* Quản lý danh sách chủ đề / chương: Thiết lập các chương kiến thức con thuộc môn học để làm cơ sở cho Giảng viên phân loại câu hỏi và cho AI sinh đề.
