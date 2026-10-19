# Đặc tả yêu cầu chức năng EduTesting

**Phiên bản:** 1.0 · **Ngày đối chiếu:** 09/10/2026 · **Phạm vi:** hệ thống khảo thí trực tuyến cho sinh viên, giảng viên và quản trị viên.

## 1. Mục đích và cách đọc

Tài liệu này chuẩn hóa các yêu cầu FR-01 đến FR-12 theo 12 nhóm ca sử dụng UC01–UC12 của đề tài. Mỗi yêu cầu mô tả hành vi cần có khi hệ thống hoàn chỉnh; **không mặc nhiên có nghĩa là FE hiện đã kết nối BE**. FE hiện dùng dữ liệu mock và state trong trình duyệt, chưa có API server, database hoặc xác thực thật. Xem [hướng dẫn frontend](../source_code/README.md) để chạy và kiểm tra source; URL và cấu trúc API cần được thống nhất khi tích hợp BE.

**Tác nhân:** sinh viên (SV), giảng viên/giám thị (GV), quản trị viên (Admin). BE phải kiểm tra quyền trên từng request; việc ẩn nút ở FE chỉ phục vụ hiển thị.

**Thuật ngữ:** *đề thi* là cấu hình kỳ thi; *mã đề* là biến thể câu hỏi của đề; *lượt thi* là một lần SV bắt đầu làm đề; *biên bản* là quyết định xử lý vi phạm gắn với một lượt thi. Mã sinh viên, mã giảng viên, mã môn, mã kỳ thi và mã lượt thi cần nhất quán giữa ba phân hệ.

## 2. Yêu cầu chức năng

### FR-01 — Xác thực và tài khoản (UC01)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-01.1 | SV, GV, Admin | Đăng nhập bằng mã định danh và mật khẩu; hệ thống xác định vai trò từ tài khoản đã xác thực và chuyển đến phân hệ tương ứng. Không tin vai trò chỉ suy ra từ tiền tố mã ở client. |
| FR-01.2 | SV, GV, Admin | Quên mật khẩu: gửi mã xác minh tới email đã đăng ký, kiểm tra mã và cho đặt mật khẩu mới khi mã còn hiệu lực. |
| FR-01.3 | SV, GV | Xem và sửa các trường hồ sơ được phép (ví dụ số điện thoại, ảnh đại diện); đổi mật khẩu sau khi kiểm tra mật khẩu hiện tại. |
| FR-01.4 | Admin | Đổi mật khẩu và đăng xuất; giao diện hiện không cung cấp chỉnh sửa hồ sơ Admin. |
| FR-01.5 | SV, GV, Admin | Đăng xuất sau hộp thoại xác nhận và kết thúc phiên trên server. |

### FR-02 — Tổng quan quản trị (UC02)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-02.1 | Admin | Hiển thị KPI tài khoản, môn học, kỳ thi và thí sinh theo học kỳ/phạm vi được chọn; số tổng phải thống nhất với danh sách chi tiết. |
| FR-02.2 | Admin | Liệt kê các phòng của kỳ thi đang diễn ra, gồm đề, môn, phòng, số thí sinh, khung giờ và lối vào màn hình giám sát. |
| FR-02.3 | Admin | Làm mới dữ liệu tổng quan mà không tải lại toàn trang; trạng thái tải và lỗi phải được báo rõ. |

### FR-03 — Quản lý người dùng và phân quyền (UC03)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-03.1 | Admin | Xem riêng danh sách SV và GV; tìm theo mã, họ tên hoặc email; lọc theo dữ liệu tổ chức liên quan và trạng thái; phân trang kết quả. |
| FR-03.2 | Admin | Tạo và sửa tài khoản với mã, họ tên, email, đơn vị/lớp hoặc bộ môn; kiểm tra trường bắt buộc, mã duy nhất và quan hệ danh mục trước khi lưu. |
| FR-03.3 | Admin | Khóa/mở khóa, đặt lại mật khẩu cho một hoặc nhiều tài khoản sau xác nhận; trả kết quả từng thao tác. |
| FR-03.4 | Admin | Phân công môn/lớp và quyền của GV đối với đề thi, giám sát và chấm bài trong phạm vi được giao. |
| FR-03.5 | Admin | Nhập/xuất danh sách tài khoản theo mẫu tệp được hai bên thống nhất; báo dòng hợp lệ và dòng lỗi khi nhập. |

### FR-04 — Môn học và chương (UC04)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-04.1 | Admin | Tìm, lọc và phân trang môn học theo mã/tên, đơn vị quản lý và trạng thái. |
| FR-04.2 | Admin | Tạo/sửa môn với mã, tên, tín chỉ, bộ môn, giảng viên phụ trách và trạng thái; quản lý danh sách chương theo thứ tự. |
| FR-04.3 | Admin | Đổi tên/sắp xếp chương; từ chối xóa chương có câu hỏi và từ chối xóa môn còn dữ liệu tham chiếu. |
| FR-04.4 | Admin | Nhập/xuất môn học theo mẫu được thống nhất; phản hồi lỗi dữ liệu và trùng mã. |

### FR-05 — Ngân hàng câu hỏi (UC05)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-05.1 | GV | Xem/tìm/lọc/phân trang câu hỏi trong các môn được phân công theo chương, loại và độ khó. |
| FR-05.2 | GV | Tạo/sửa/xem trước/xóa câu hỏi; lưu nội dung, phương án, đáp án, điểm, độ khó, chương và lời giải theo loại câu hỏi. |
| FR-05.3 | GV | Chọn nhiều câu để đổi thuộc tính, đưa vào đề hoặc xóa; kiểm tra quyền và ràng buộc câu đã được sử dụng. |
| FR-05.4 | GV | Nhập câu hỏi từ tệp theo mẫu thống nhất, trả kết quả kiểm tra và các dòng lỗi. |

### FR-06 — Gợi ý câu hỏi bằng AI (UC06)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-06.1 | GV | Chọn môn, chương, loại, độ khó, số lượng và tài liệu/nội dung để yêu cầu tạo câu hỏi gợi ý. |
| FR-06.2 | GV | Xem trước, chỉnh sửa, tạo lại hoặc bỏ từng câu; chỉ câu được GV xác nhận mới lưu vào ngân hàng. |
| FR-06.3 | Hệ thống | Trả về nội dung, phương án, đáp án và giải thích theo schema câu hỏi; báo lỗi khi không tạo được dữ liệu hợp lệ. |

### FR-07 — Đề thi và ma trận (UC07)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-07.1 | GV | Tìm/lọc/phân trang đề theo kỳ thi, học kỳ, môn, loại, thời gian và trạng thái; thao tác cho phép phụ thuộc trạng thái đề và phạm vi GV. |
| FR-07.2 | GV | Tạo/sửa đề với mã, tên, loại, môn, phòng/hình thức, lịch mở/đóng, thời lượng, số lượt, quy chế và giám thị. |
| FR-07.3 | GV | Chọn câu thủ công hoặc theo ma trận chương/độ khó; kiểm tra đủ số câu, tổng điểm và nguồn câu hợp lệ trước khi xuất bản. |
| FR-07.4 | GV | Cấu hình mã đề/xáo trộn, giám sát vi phạm, công bố điểm và quyền xem lại; lưu nháp hoặc xuất bản sau kiểm tra hợp lệ. |
| FR-07.5 | Hệ thống | Phân biệt bản nháp, sắp diễn ra, đang diễn ra, chờ chấm và đã kết thúc; không cho sửa/xóa đề trái quy tắc trạng thái. |

### FR-08 — Chấm và đối soát (UC08)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-08.1 | Hệ thống | Chấm các loại câu có đáp án xác định từ snapshot đề và câu trả lời của lượt thi; giữ kết quả chưa công bố theo cấu hình. |
| FR-08.2 | Hệ thống | Đối chiếu từ khóa câu tự luận ngắn theo quy tắc của câu hỏi; đánh dấu bài cần GV duyệt khi không đủ điều kiện chấm tự động. |
| FR-08.3 | GV | Lọc bài theo học kỳ/môn/đề/mã đề/câu/trạng thái; xem câu trả lời, điểm gợi ý và lý do; sửa điểm, nhận xét và lưu đối soát. |
| FR-08.4 | Hệ thống | Tính lại tổng điểm theo điểm từng câu và quyết định xử lý vi phạm; lưu lịch sử thay đổi điểm. |

### FR-09 — Phân tích kết quả (UC09)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-09.1 | GV | Lọc kết quả theo học kỳ, môn và kỳ thi trong phạm vi phụ trách. |
| FR-09.2 | GV | Xem số bài, điểm trung bình/trung vị/cao nhất/thấp nhất, tỷ lệ đạt, phổ điểm và phân tích từng câu theo cùng tập dữ liệu lọc. |
| FR-09.3 | GV | Xem bảng điểm từng SV/lượt, trạng thái hoàn thành/đình chỉ; mở bài làm hoặc biên bản đúng mã SV, kỳ thi và lượt thi. |
| FR-09.4 | GV | Xuất bảng điểm theo tập lọc; nhận gợi ý phân tích AI nếu dịch vụ đã có dữ liệu và trả kết quả. |

### FR-10 — Giám sát và vi phạm (UC10)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-10.1 | GV, giám thị | Lọc phòng/đề/thí sinh và xem sự kiện giám sát, số lần vi phạm, mức rủi ro, trạng thái khóa và lịch sử thời gian. |
| FR-10.2 | Hệ thống | Chỉ ghi nhận sự kiện theo cấu hình chống gian lận của đề; cảnh báo ở lần 1–2 và đình chỉ/thu bài ở ngưỡng 3 theo quy chế đã cấu hình. |
| FR-10.3 | GV, giám thị | Lập/xem biên bản cho đúng SV, đề và lượt thi; chọn hình thức xử lý, nhập mô tả và lưu người lập/thời gian. |
| FR-10.4 | Hệ thống | Đồng bộ quyết định xử lý tới chấm điểm, phân tích và kết quả SV; chống ghi trùng sự kiện. Phân tích rủi ro AI là phần tích hợp BE/dịch vụ, không suy ra từ giao diện mock. |

### FR-11 — Làm bài thi (UC11)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-11.1 | SV | Chỉ vào đề được giao khi đề đang mở, còn lượt, đúng quyền và thời gian; hệ thống tạo hoặc khôi phục lượt thi theo định danh server. |
| FR-11.2 | SV | Xem câu hỏi, điều hướng, đánh dấu cần xem lại và nhập câu trả lời; hiển thị thời gian còn lại từ hạn nộp do server quyết định. |
| FR-11.3 | Hệ thống | Lưu câu trả lời theo lượt thi, báo trạng thái lưu và khôi phục sau tải lại/mất kết nối; không gửi đáp án chuẩn cho lượt đang làm. |
| FR-11.4 | SV, hệ thống | Nộp chủ động sau xác nhận hoặc tự thu khi hết hạn/đình chỉ; mỗi lượt chỉ có một kết quả nộp cuối cùng. |
| FR-11.5 | Hệ thống | Áp dụng các cảnh báo rời tab/cửa sổ hoặc thu nhỏ khi cấu hình đề bật giám sát; các giới hạn trình duyệt và toàn màn hình cần được kiểm chứng khi tích hợp. |

### FR-12 — Kết quả, xem lại và lịch sử (UC12)

| ID | Tác nhân | Yêu cầu và kết quả mong đợi |
|---|---|---|
| FR-12.1 | SV | Sau nộp, xem thời gian/lượt/trạng thái; chỉ xem điểm khi đã công bố và không chờ xử lý vi phạm. |
| FR-12.2 | SV | Chỉ xem số câu đúng/sai, đáp án, lời giải và bài làm nếu chính sách công bố tương ứng cho phép; URL trực tiếp cũng phải kiểm tra quyền. |
| FR-12.3 | SV | Bài đình chỉ chờ biên bản không lộ điểm/đáp án. Sau khi xử lý, được xem lại nếu cấu hình cho phép và kết quả không bị hủy; điểm chính thức theo trạng thái công bố. |
| FR-12.4 | SV | Tra cứu lịch sử theo học kỳ, loại kỳ thi, môn; xem từng lượt, điểm được phép công bố và biên bản thực sự tồn tại; làm lại khi còn lượt và đề còn cho phép. |

## 3. Quy tắc tích hợp chung

1. BE là nguồn quyết định trạng thái đề, lịch, số lượt, quyền, điểm chính thức và xử lý vi phạm. FE sử dụng cùng một bộ định danh và chính sách ở danh sách, phòng thi, lịch sử, thông báo và phân tích.
2. Dữ liệu bài thi chưa được phép công bố không được gửi kèm trong response cho SV; việc ẩn trên FE không thay cho kiểm soát truy cập.
3. Các thao tác ghi dữ liệu phải trả kết quả thành công/thất bại rõ ràng. Thông báo thành công chỉ hiển thị sau khi server xác nhận.
4. Các tiêu chí thời gian và trạng thái trong mock phục vụ kịch bản trình diễn, không phản ánh thời gian thực. Danh mục/phòng thi/mã đề dùng để tích hợp phải được hai bên chốt qua API.
