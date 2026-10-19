# Đặc tả Use Case EduTesting

Ngày đối chiếu: 09/10/2026. Mã UC01–UC12 tương ứng FR-01–FR-12 trong [yêu cầu chức năng](../../functional-requirements.md).

Đây là **đặc tả hệ thống mục tiêu khi tích hợp**, không phải xác nhận mọi chức năng đã chạy trên FE. FE hiện dùng React/JavaScript, Vite, Tailwind và mock/state. [Tài liệu đề tài](../../elit.md) chọn BE Python/FastAPI; source hiện chưa có API server hoặc DB. Endpoint, mô hình dữ liệu và quyền truy cập cần được thống nhất khi tích hợp; xem [hướng dẫn frontend](../../../source_code/README.md) để chạy và kiểm tra source hiện có.

## UC01 — Xác thực và tài khoản

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | SV, GV, Admin |
| Kích hoạt | Mở trang đăng nhập hoặc chức năng tài khoản |
| Tiền điều kiện | Có tài khoản; với thao tác hồ sơ/đổi mật khẩu cần phiên hợp lệ |
| Luồng chính | 1. Nhập mã và mật khẩu. 2. BE xác thực trạng thái tài khoản, tạo phiên và trả vai trò/quyền. 3. FE điều hướng theo vai trò. |
| Luồng liên quan | Quên mật khẩu qua mã xác minh; SV/GV sửa trường hồ sơ được phép; cả ba vai trò đổi mật khẩu và đăng xuất sau xác nhận. Admin hiện không có giao diện sửa hồ sơ. |
| Ngoại lệ | Thiếu dữ liệu, sai thông tin, tài khoản khóa, hết phiên; BE quyết định quyền, không tin vai trò suy từ tiền tố mã ở client. |
| Hậu điều kiện | Phiên được tạo/kết thúc hoặc dữ liệu tài khoản được cập nhật theo thao tác |
| Hiện trạng FE | So tài khoản mẫu và navigate; OTP, hồ sơ và đổi mật khẩu đang mô phỏng, chưa có phiên/route guard server. |

## UC02 — Tổng quan quản trị

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | Admin |
| Kích hoạt | Mở tổng quan hoặc thay học kỳ/làm mới |
| Tiền điều kiện | Phiên Admin hợp lệ |
| Luồng chính | 1. Chọn học kỳ. 2. Đọc KPI, tổng theo tháng/đơn vị và phòng thi đang diễn ra. 3. Làm mới dữ liệu. 4. Mở giám sát của đúng đề/phòng khi cần. |
| Ngoại lệ | Lỗi tải hoặc không có dữ liệu: báo rõ và cho thử lại; các tổng phải dùng cùng phạm vi lọc. |
| Hậu điều kiện | Hiển thị thống nhất tổng và danh sách, không tự tạo dữ liệu khi API lỗi |
| Hiện trạng FE | Dữ liệu suy ra từ mock; trạng thái đang diễn ra là kịch bản mẫu, chưa phải realtime. |

## UC03 — Người dùng và phân quyền

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | Admin |
| Kích hoạt | Mở quản lý người dùng |
| Tiền điều kiện | Phiên và quyền Admin hợp lệ |
| Luồng chính | 1. Chọn tab SV/GV, tìm/lọc/phân trang. 2. Thêm/sửa tài khoản. 3. Kiểm tra mã duy nhất, email và danh mục tổ chức. 4. Lưu thành công rồi đọc lại danh sách. |
| Luồng thay thế | Khóa/mở hoặc reset mật khẩu một/nhiều tài khoản sau xác nhận; phân công phạm vi GV; nhập/xuất danh sách theo mẫu đã chốt. |
| Ngoại lệ | Trùng mã, dữ liệu sai hoặc thao tác không có quyền. Import báo lỗi từng dòng; chính sách bỏ qua/ghi đè cần BE chốt, không mặc định tự bỏ qua. |
| Hậu điều kiện | Tài khoản/phạm vi được cập nhật trên server; thao tác lỗi không báo thành công |
| Hiện trạng FE | CRUD bằng state; nút nhập/xuất chỉ mô phỏng thông báo, chưa đọc/tạo Excel thật. |

## UC04 — Môn học và chương

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | Admin |
| Kích hoạt | Mở môn học, thêm/sửa/xóa môn hoặc chương |
| Tiền điều kiện | Có quyền quản trị danh mục |
| Luồng chính | 1. Nhập mã/tên/tín chỉ/bộ môn/trạng thái. 2. Chọn GV. 3. Thêm, đổi tên và sắp xếp chương. 4. BE kiểm tra và lưu môn, chương, phân công trong cùng giao dịch. |
| Luồng thay thế | Xóa môn/chương sau xác nhận và kiểm tra tham chiếu |
| Ngoại lệ | Mã trùng, danh mục sai; chặn xóa chương có câu hỏi hoặc môn còn câu hỏi/đề thi. BE kiểm tra lại dù FE đã kiểm tra trước. |
| Hậu điều kiện | Danh mục và thứ tự chương nhất quán |
| Hiện trạng FE | Form/CRUD cục bộ, sửa tên và đổi thứ tự chương; chưa lưu DB. |

## UC05 — Ngân hàng câu hỏi

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | GV |
| Kích hoạt | Mở ngân hàng câu hỏi của môn được giao |
| Tiền điều kiện | GV có quyền trong phạm vi môn/chương liên quan |
| Luồng chính | 1. Tìm/lọc/phân trang. 2. Tạo/sửa/xem trước câu. 3. Nhập phương án, đáp án hoặc từ khóa, điểm, độ khó và lời giải theo loại. 4. Kiểm tra và lưu. |
| Luồng thay thế | Thao tác hàng loạt, đưa câu vào đề, nhập theo mẫu, chuyển sang UC06 |
| Ngoại lệ | Thiếu đáp án/nội dung, sai kiểu; câu đã sử dụng phải tuân theo quy tắc xóa/sửa và snapshot bài đã thi. |
| Hậu điều kiện | Ngân hàng cập nhật; bài đã thi không bị thay đổi bởi câu nguồn |
| Hiện trạng FE | Mock và handler cục bộ; một số thao tác chỉ thông báo thành công, chưa lưu server. |

## UC06 — Gợi ý câu hỏi AI

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | GV |
| Kích hoạt | Yêu cầu sinh câu hỏi từ cấu hình và tài liệu |
| Tiền điều kiện | Có quyền môn/chương, ngữ cảnh và cấu hình hợp lệ |
| Luồng chính | 1. Nhập ngữ cảnh, loại, độ khó, số lượng. 2. BE gọi dịch vụ AI và kiểm tra schema. 3. GV xem/sửa/bỏ/sinh lại câu. 4. GV xác nhận các câu đạt yêu cầu trước khi lưu ngân hàng. |
| Ngoại lệ | Timeout, ngữ cảnh thiếu, câu sai schema hoặc lưu thất bại; giữ cấu hình và báo lỗi rõ ràng. |
| Hậu điều kiện | Chỉ câu được duyệt và server xác nhận mới được lưu; phân biệt kết quả gợi ý với câu chính thức |
| Hiện trạng FE | Kết quả mô phỏng, chưa có dịch vụ AI hay lưu câu trên server. |

## UC07 — Đề thi và ma trận

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | GV |
| Kích hoạt | Tạo/sửa đề hoặc xuất bản nháp |
| Tiền điều kiện | Có quyền môn; trạng thái đề cho phép thao tác |
| Luồng chính | 1. Nhập mã, tên, loại, học kỳ, phòng, lịch, thời lượng và số lượt. 2. Chọn câu thủ công hoặc ma trận. 3. Cấu hình mã đề/xáo trộn, antiCheat, showScoreImmediately và allowReview. 4. Lưu nháp. 5. Xuất bản khi đủ câu/điểm và cấu hình hợp lệ. |
| Quy tắc | Form hiện yêu cầu một lượt và bật antiCheat với Giữa kỳ/Cuối kỳ. maxAttempts=0 được quy ước là không giới hạn trong hợp đồng đề xuất; BE kiểm tra mọi giới hạn. |
| Ngoại lệ | Thiếu câu, tỷ lệ ma trận sai, lịch không hợp lệ, mã trùng hoặc đề không còn được sửa; nháp đã lưu được giữ nếu bước xuất bản thất bại. |
| Hậu điều kiện | Đề xuất bản có snapshot/mã đề; trạng thái theo lịch và server, không mặc định luôn đang diễn ra |
| Hiện trạng FE | Chọn câu và dựng payload tại client; chưa có lưu/xuất bản thật trên BE. |

## UC08 — Chấm và đối soát

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | GV; hệ thống chấm theo quy tắc |
| Kích hoạt | Lượt đã nộp hoặc GV mở bài cần đối soát |
| Tiền điều kiện | Có snapshot đáp án/câu trả lời và quyền chấm |
| Luồng chính | 1. Chấm các câu có đáp án xác định. 2. So khớp từ khóa theo cấu hình. 3. GV lọc bài và xem lý do/điểm gợi ý. 4. Chấm/sửa trong giới hạn, lưu nhận xét. 5. Tính lại tổng và áp dụng quyết định vi phạm đã hoàn tất. |
| Ngoại lệ | Điểm sai/vượt giới hạn, xung đột trạng thái, chưa đủ câu được chấm hoặc vi phạm PENDING; giữ kết quả chưa công bố. |
| Hậu điều kiện | Điểm thành phần và tổng đã lưu; **chốt điểm không đồng nghĩa công bố điểm**. Quyền công bố được xét riêng. |
| Hiện trạng FE | So khớp từ khóa trên mock, chấm bằng state; chưa đồng bộ sang SV. Đây không phải AI chấm tự luận. |

## UC09 — Phân tích kết quả

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | GV |
| Kích hoạt | Mở thống kê trong phạm vi phụ trách |
| Tiền điều kiện | Đủ quyền đọc đề/kết quả; có dữ liệu để tính chỉ số |
| Luồng chính | 1. Lọc học kỳ/môn/đề. 2. Xem số bài, điểm trung bình/trung vị/cao nhất/thấp nhất và tỷ lệ đạt. 3. Xem phổ điểm, phân tích câu và bảng điểm. 4. Mở bài/biên bản đúng SV, đề và lượt. |
| Luồng thay thế | Xuất tập dữ liệu được phép đọc; xem gợi ý phân tích AI khi dịch vụ có kết quả |
| Ngoại lệ | Thiếu dữ liệu hoặc không có biên bản thì báo rõ; không dựng biên bản/hình phạt giả. Khoảng phổ điểm phải thống nhất với dữ liệu biểu đồ, không cố định các nhóm cũ 0–4/5–6/7–8/9–10. |
| Hậu điều kiện | Chỉ số và bảng dùng cùng tập lọc; phân biệt thí sinh với số lượt/bài |
| Hiện trạng FE | Analytics mock; một số preview chỉ có 10 câu đầu, không phải toàn bộ bài. |

## UC10 — Giám sát và vi phạm

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | SV, GV/giám thị; Admin được quyền giám sát |
| Kích hoạt | Sự kiện trình duyệt khi đang làm bài hoặc mở màn hình giám sát |
| Tiền điều kiện | antiCheat bật để thu sự kiện; người giám sát có quyền môn/phòng |
| Luồng chính | 1. Nhận sự kiện chuyển tab/blur/thu nhỏ kèm attemptId và eventId. 2. BE kiểm tra và chống trùng. 3. Cảnh báo lần 1–2; đình chỉ và thu bài đúng một lần khi chạm ngưỡng 3. 4. GV xem log, lập biên bản đúng lượt. |
| Luồng xử lý | Vi phạm PENDING giữ điểm và chặn xem lại. Có biên bản chưa mặc nhiên hoàn tất; khi quyết định RESOLVED/CANCELLED được xác nhận, cập nhật điểm và quyền theo UC12. |
| Ngoại lệ | antiCheat tắt, sự kiện trùng hoặc lượt đã kết thúc không tăng bộ đếm. AI rủi ro chỉ hỗ trợ, không tự bổ sung quy tắc đình chỉ bằng điểm HIGH. |
| Hậu điều kiện | Log/biên bản gắn đúng lượt; timer dừng khi đình chỉ và không đồng thời mở modal hết giờ |
| Hiện trạng FE | Bộ đếm cục bộ; monitor, AI risk và log là mock. API, WebSocket và đồng bộ xử lý chưa triển khai. |

## UC11 — Làm bài thi

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | SV |
| Kích hoạt | Đồng ý quy chế và bắt đầu đề |
| Tiền điều kiện | Đề tồn tại, được giao, đang mở theo server và còn lượt hợp lệ |
| Luồng chính | 1. BE tạo/khôi phục lượt, trả attemptId/serverNow/expiresAt và câu hỏi không kèm đáp án chuẩn. 2. SV trả lời/đánh dấu/điều hướng. 3. Lưu đáp án theo questionId và hiển thị trạng thái theo xác nhận server. 4. Nộp sau xác nhận hoặc tự thu khi hết hạn. |
| Luồng thay thế | Đình chỉ theo UC10, dừng timer, thu bài một lần và mở kết quả chờ xử lý |
| Ngoại lệ | ID sai, đề chưa mở, hết lượt, hết phiên hoặc lỗi lưu: báo rõ. Không xác nhận đã lưu nếu server chưa xác nhận; tải lại phải khôi phục từ lượt trên server. |
| Hậu điều kiện | Một trạng thái nộp cuối cùng cho mỗi lượt; kết quả hiển thị theo UC12 |
| Hiện trạng FE | Câu trả lời ở state; autosave chỉ mô phỏng; nộp điều hướng. Chưa có requestFullscreen, server lưu bài hay khôi phục offline. |

## UC12 — Kết quả, xem lại và lịch sử

| Thuộc tính | Đặc tả |
|---|---|
| Tác nhân | SV |
| Kích hoạt | Xem kết quả sau nộp hoặc chọn lượt trong lịch sử |
| Tiền điều kiện | Có quyền đọc đúng lượt thi; BE kiểm tra cả URL trực tiếp |
| Luồng chính | 1. Đọc trạng thái/lượt/thời gian. 2. Chỉ trả/hiện điểm đã công bố, kể cả 0. 3. Xét allowReview, quyền lượt và xử lý vi phạm. 4. Nếu cho xem lại nhưng chưa công bố điểm, chỉ trả bài làm với nhãn trung tính. 5. Chỉ trả đáp án/lời giải/đúng sai khi được phép xem chi tiết. |
| Luồng vi phạm | PENDING: ẩn điểm, số câu/đáp án, chặn review. RESOLVED: xét công bố điểm và review riêng. CANCELLED: chặn review. Biên bản đọc theo đúng attemptId và chỉ khi thực sự tồn tại. |
| Luồng lịch sử | Lọc theo học kỳ/loại/môn có trong dữ liệu SV; đọc từng lượt; làm lại khi BE cho phép và còn lượt. |
| Ngoại lệ | Không có quyền/không tồn tại thì không trả dữ liệu; allowReview tắt không đồng nghĩa điểm đã công bố. |
| Hậu điều kiện | Không lộ dữ liệu bị giữ lại; điểm, bài làm và biên bản thuộc đúng lượt |
| Hiện trạng FE | examAccess áp dụng trên mock; đang chờ xử lý được suy từ isSuspended và chưa có report. Trạng thái xử lý chính thức cần BE chốt. |

## Quy tắc chung

- Các enum NONE/PENDING/RESOLVED/CANCELLED, kiểu ID, quyền và endpoint là đề xuất tích hợp; chưa phải DB/API đã triển khai.
- API phải loại dữ liệu chưa được phép xem; không chỉ ẩn nút hoặc JSX ở FE.
- Mỗi Activity/Sequence cùng mã UC mô tả cùng mục tiêu. Chi tiết hiện trạng FE phải đọc từ source và tài liệu bàn giao, không suy từ mô hình thiết kế.

