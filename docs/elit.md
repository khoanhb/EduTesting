# ĐỀ TÀI MÔN DỰ ÁN CNTT

---

Tiếng Việt: Xây dựng nền tảng khảo thí online cho phép tự động sinh đề và đáp án, xáo trộn câu hỏi/đáp án, chấm điểm tự động theo thời gian thực và thống kê – phân tích kết quả. Hệ thống có thể ứng dụng AI để sinh câu hỏi từ ngân hàng kiến thức, đánh giá độ khó câu hỏi, phát hiện gian lận và hỗ trợ cải tiến chất lượng đề thi.

Tiếng Anh: Implement an online testing platform is designed to automatically generate questions and answers, shuffle questions/answers, automatically grade in real time, and provide statistical analysis of results. The system can utilize AI to generate questions from a knowledge bank, assess question difficulty, detect cheating, and support improvements in test quality.

---

Phần đã nộp, phần này đã nhập trên hệ thống nên ko sửa đc.

**1. Giới thiệu đề tài**

Trong bối cảnh chuyển đổi số trong giáo dục, việc tổ chức kiểm tra và đánh giá trực tuyến ngày càng trở nên phổ biến. Tuy nhiên, việc xây dựng đề thi, quản lý ngân hàng câu hỏi, tổ chức kỳ thi, chấm điểm và tổng hợp kết quả vẫn còn nhiều công việc được thực hiện thủ công. Điều này gây tốn thời gian cho giảng viên, giảng viên và người quản lý, đồng thời có thể phát sinh sai sót trong quá trình tạo đề và chấm thi.

Đề tài “Xây dựng nền tảng khảo thí online tích hợp AI” hướng đến việc xây dựng một hệ thống khảo thí trực tuyến hỗ trợ toàn bộ quy trình từ quản lý ngân hàng câu hỏi, tạo đề thi, tổ chức thi, chấm điểm đến thống kê và phân tích kết quả.

Bên cạnh các chức năng khảo thí truyền thống, hệ thống có thể ứng dụng trí tuệ nhân tạo (AI) để hỗ trợ sinh câu hỏi từ nội dung kiến thức, đánh giá độ khó của câu hỏi, phân tích chất lượng câu hỏi và hỗ trợ phát hiện các dấu hiệu bất thường trong quá trình làm bài.

Mục tiêu của đề tài là xây dựng một nền tảng có giao diện dễ sử dụng, quy trình quản lý rõ ràng, khả năng tự động hóa cao và có thể hỗ trợ người ra đề nâng cao chất lượng các kỳ kiểm tra.

**2. Lý do chọn đề tài**

**2.1. Nhu cầu kiểm tra trực tuyến ngày càng tăng**

Các hình thức học tập trực tuyến và kết hợp trực tuyến – trực tiếp ngày càng phổ biến. Vì vậy, nhu cầu tổ chức các bài kiểm tra, bài thi trên nền tảng trực tuyến cũng tăng theo.

Một hệ thống khảo thí trực tuyến giúp giảm sự phụ thuộc vào giấy tờ, hỗ trợ tổ chức thi ở nhiều địa điểm và cho phép người học thực hiện bài kiểm tra thuận tiện hơn.

**2.2. Giảm công việc thủ công cho người ra đề**

Trong phương pháp truyền thống, giảng viên phải tự lựa chọn câu hỏi, tạo đề, tạo đáp án, xáo trộn câu hỏi và đáp án, sau đó thực hiện chấm điểm và tổng hợp kết quả.

Nếu số lượng câu hỏi và thí sinh lớn, quá trình này mất nhiều thời gian và dễ xảy ra sai sót.

Hệ thống được đề xuất sẽ tự động hóa phần lớn các công việc trên.

**2.3. Tăng tính khách quan trong kiểm tra**

Hệ thống có thể tự động chấm điểm đối với các dạng câu hỏi phù hợp, hạn chế sai sót do chấm thủ công.

Việc tạo nhiều mã đề bằng cách xáo trộn câu hỏi và đáp án cũng góp phần hạn chế tình trạng thí sinh sao chép đáp án của nhau.

**2.4. Ứng dụng AI trong giáo dục**

AI có khả năng hỗ trợ giảng viên trong việc tạo và phân tích câu hỏi. Thay vì chỉ quản lý các câu hỏi có sẵn, hệ thống có thể hỗ trợ sinh câu hỏi dựa trên nội dung kiến thức được cung cấp.

Ngoài ra, AI có thể được nghiên cứu để đánh giá độ khó, phân loại câu hỏi và hỗ trợ phân tích chất lượng đề thi.

**2.5. Có giá trị thực tiễn và khả năng mở rộng**

Đề tài có thể được ứng dụng trong trường học, trung tâm đào tạo, doanh nghiệp hoặc các tổ chức có nhu cầu kiểm tra, đánh giá kiến thức trực tuyến.

Hệ thống cũng có khả năng mở rộng thêm nhiều loại câu hỏi, nhiều phương pháp đánh giá và các tính năng AI trong tương lai.

**3. Mô tả đề tài**

**3.1. Mục tiêu của hệ thống**

Hệ thống được xây dựng nhằm cung cấp một nền tảng khảo thí trực tuyến cho phép:

· Quản lý người dùng và phân quyền.

· Quản lý môn học, chủ đề và ngân hàng câu hỏi.

· Tạo câu hỏi và đáp án thủ công.

· Hỗ trợ AI sinh câu hỏi từ nội dung kiến thức.

· Đánh giá và quản lý độ khó của câu hỏi.

· Tự động sinh đề thi từ ngân hàng câu hỏi.

· Tự động xáo trộn câu hỏi và đáp án.

· Tổ chức các kỳ thi trực tuyến.

· Tự động chấm điểm.

· Hiển thị kết quả sau khi hoàn thành bài thi.

· Thống kê và phân tích kết quả.

· Hỗ trợ phát hiện các dấu hiệu bất thường/gian lận trong quá trình thi.

**3.2. Đối tượng sử dụng**

Hệ thống dự kiến có ba nhóm người dùng chính.

Người quản trị

· Có quyền quản lý toàn bộ hệ thống:

· Quản lý tài khoản.

· Phân quyền người dùng.

· Quản lý môn học/chủ đề.

· Quản lý kỳ thi.

· Theo dõi hoạt động của hệ thống.

· Xem các báo cáo tổng quan.

Giảng viên: Là người trực tiếp xây dựng và tổ chức bài kiểm tra:

· Tạo và quản lý ngân hàng câu hỏi.

· Tạo câu hỏi thủ công hoặc bằng AI.

· Tạo đề thi.

· Thiết lập thời gian và cấu hình kỳ thi.

· Xem kết quả của thí sinh.

· Thống kê và phân tích kết quả.

· Theo dõi chất lượng câu hỏi.

Thí sinh/sinh viên: Là người tham gia kỳ thi:

· Xem danh sách kỳ thi được phép tham gia.

· Làm bài trực tuyến.

· Theo dõi thời gian còn lại.

· Nộp bài.

· Xem điểm và kết quả nếu được cho phép.

· Xem lại đáp án/giải thích nếu kỳ thi cho phép.

**4. Phân tích đề tài**

**4.1. Quy trình hoạt động tổng quát**

Quy trình của hệ thống có thể được mô tả như sau:

Quản lý kiến thức → Xây dựng ngân hàng câu hỏi → Tạo đề → Cấu hình kỳ thi → Thí sinh làm bài → Chấm điểm → Trả kết quả → Thống kê và phân tích

Trong đó, AI được tích hợp vào một số bước như:

Nội dung kiến thức → AI sinh câu hỏi → Giảng viên kiểm duyệt → Đưa vào ngân hàng câu hỏi

và:

Kết quả làm bài → Phân tích dữ liệu → Đánh giá độ khó/chất lượng câu hỏi → Hỗ trợ cải tiến đề thi

**4.2. Các chức năng chính**

**Chức năng 1: Đăng nhập và quản lý tài khoản**

Hệ thống cho phép người dùng đăng nhập theo tài khoản đã được trường cung cấp và sử dụng các chức năng tương ứng với vai trò. Các chức năng:

· Đăng nhập.

· Đăng xuất.

· Quản lý thông tin cá nhân.

· Đổi mật khẩu.

· Quản lý vai trò và quyền hạn.

· Khóa/mở khóa tài khoản.

**Chức năng 2: Quản lý môn học và chủ đề kiến thức**

Giảng viên hoặc quản trị viên có thể tổ chức nội dung thành các môn học và chủ đề.

Ví dụ:

Môn: Lập trình → Chủ đề: Java → Bài: OOP → Nội dung: Tính kế thừa

Việc phân loại giúp hệ thống dễ dàng lựa chọn câu hỏi khi sinh đề và hỗ trợ AI sinh câu hỏi theo từng môn học.

Các chức năng:

· Thêm/sửa/xóa môn học.

· Phân loại câu hỏi theo môn học.

· Tìm kiếm và lọc nội dung.

**Chức năng 3: Quản lý ngân hàng câu hỏi**

Ngân hàng câu hỏi là thành phần trung tâm của hệ thống.

Mỗi câu hỏi có thể bao gồm:

· Nội dung câu hỏi.

· Các phương án trả lời.

· Đáp án đúng.

· Giải thích đáp án.

· Môn học/chủ đề.

· Loại câu hỏi.

· Mức độ khó.

· Điểm số.

· Người tạo.

· Trạng thái sử dụng.

· Thống kê lịch sử sử dụng.

Các dạng câu hỏi có thể hỗ trợ trong phạm vi đề tài:

· Trắc nghiệm một đáp án.

· Trắc nghiệm nhiều đáp án.

· Đúng/Sai.

· Điền đáp án.

· Câu hỏi tự luận

**Chức năng 4: Tạo câu hỏi bằng AI**

Đây là một chức năng nổi bật của đề tài.

Người dùng cung cấp nội dung kiến thức, tài liệu hoặc đoạn văn bản. Hệ thống sử dụng AI để phân tích nội dung và đề xuất các câu hỏi.

Ví dụ:

Nội dung: Khái niệm về lập trình hướng đối tượng.

AI có thể sinh:

· Câu hỏi trắc nghiệm.

· Các phương án trả lời.

· Đáp án đúng.

· Giải thích đáp án.

· Chủ đề.

· Mức độ khó dự kiến.

· Giảng viên có thể xem lại, chỉnh sửa và phê duyệt câu hỏi trước khi đưa vào ngân hàng.

Lưu ý: AI chỉ đóng vai trò hỗ trợ. Câu hỏi do AI sinh ra nên được giảng viên kiểm duyệt trước khi sử dụng chính thức.

**Chức năng 5: Đánh giá độ khó câu hỏi**

Hệ thống lưu lại dữ liệu làm bài của thí sinh để hỗ trợ đánh giá độ khó của câu hỏi.

Ở mức nâng cao, có thể nghiên cứu thêm các chỉ số phân tích câu hỏi như độ phân biệt để đánh giá khả năng phân loại thí sinh của câu hỏi.

**Chức năng 6: Tạo và sinh đề thi tự động**

Giảng viên có thể tạo đề thi bằng cách lựa chọn các tiêu chí:

· Môn học.

· Chủ đề.

· Số lượng câu hỏi.

· Tổng điểm.

· Thời gian làm bài.

· Mức độ khó.

· Loại câu hỏi.

**Chức năng 7: Xáo trộn câu hỏi và đáp án**

Để hạn chế việc thí sinh nhìn bài của nhau, hệ thống hỗ trợ:

l Xáo trộn thứ tự câu hỏi.

l Xáo trộn thứ tự các phương án.

l Tạo nhiều mã đề.

l Đảm bảo đáp án đúng vẫn được xác định chính xác sau khi xáo trộn.

**Chức năng 8: Quản lý kỳ thi**

Giảng viên có thể tạo và cấu hình một kỳ thi.

Các thông tin gồm:

· Tên kỳ thi.

· Môn học.

· Thời gian bắt đầu.

· Thời gian kết thúc.

· Thời lượng làm bài.

· Số lần được thi.

· Số lượng câu hỏi.

· Tổng điểm.

· Đối tượng được phép tham gia.

· Quy định xem kết quả/đáp án.

Hệ thống tự động kiểm soát thời gian mở và đóng kỳ thi.

**Chức năng 9: Làm bài thi trực tuyến**

Thí sinh truy cập kỳ thi và thực hiện bài kiểm tra.

Giao diện làm bài có thể bao gồm:

· Danh sách câu hỏi.

· Nội dung câu hỏi.

· Các phương án trả lời.

· Đồng hồ đếm ngược.

· Trạng thái câu đã/chưa trả lời.

· Chức năng đánh dấu câu hỏi.

· Chức năng chuyển câu.

· Chức năng nộp bài.

· Khi hết thời gian, hệ thống có thể tự động nộp bài.

**Chức năng 10: Chấm điểm tự động theo thời gian thực**

Sau khi thí sinh trả lời hoặc nộp bài, hệ thống có thể đối chiếu với đáp án và tính điểm.

Đối với câu hỏi trắc nghiệm:

Điểm \= Tổng điểm của các câu trả lời đúng

Hệ thống có thể cập nhật trạng thái kết quả ngay sau khi thí sinh nộp bài.

Các thông tin có thể hiển thị:

· Tổng số câu.

· Số câu đúng.

· Số câu sai.

· Số câu chưa trả lời.

· Điểm số.

· Thời gian làm bài.

· Xếp loại.

**Chức năng 11: Thống kê và phân tích kết quả**

Hệ thống cung cấp dashboard và báo cáo giúp giảng viên đánh giá kết quả.

Các thống kê có thể bao gồm:

· Điểm trung bình.

· Điểm cao nhất/thấp nhất.

· Tỷ lệ đạt/không đạt.

· Phân bố điểm.

· Số lượng thí sinh.

· Tỷ lệ trả lời đúng của từng câu.

· Thời gian làm bài trung bình.

· Các câu hỏi có tỷ lệ sai cao.

· So sánh kết quả giữa các lớp/nhóm.

**Chức năng 12: Phân tích chất lượng câu hỏi**

Dựa trên dữ liệu từ các kỳ thi, hệ thống có thể hỗ trợ giảo viên xác định:

· Câu hỏi quá dễ.

· Câu hỏi quá khó.

·  Câu hỏi có tỷ lệ trả lời sai bất thường.

·  Câu hỏi có phương án gây nhiễu không hiệu quả.

·  Câu hỏi có khả năng có vấn đề về nội dung.

·  Câu hỏi cần chỉnh sửa hoặc loại bỏ.

Chức năng này giúp ngân hàng câu hỏi được cải thiện liên tục dựa trên dữ liệu thực tế.

**Chức năng 13: Phát hiện dấu hiệu gian lận**

·  Theo dõi hành vi khi làm bài: Hệ thống theo dõi trạng thái tương tác của trình duyệt trong suốt buổi thi.

·  Phát hiện chuyển tab/thoát khỏi màn hình thi: Kích hoạt sự kiện khi thí sinh chuyển sang tab khác, thu nhỏ trình duyệt hoặc mở cửa sổ mới.

·  Ghi nhận hành vi bất thường: Lưu lại mốc thời gian (timestamp) và loại hành vi vi phạm vào hệ thống log.

·  Cảnh báo gian lận: Hiển thị popup cảnh báo tức thì trên màn hình thí sinh.

·  Thống kê số lần vi phạm: Bộ đếm số lần thí sinh rời tab (VD: vượt quá 3 lần sẽ tự động nộp bài).

·  Đánh giá mức độ nghi ngờ: Gắn nhãn mức độ rủi ro (Bình thường / Đáng ngờ / Gian lận cao) bên cạnh tên thí sinh trên bảng điều khiển của Giảng viên

 

**5. Phạm vi của đề tài**

Để đề tài phù hợp với quy mô của một đồ án/khóa luận, phạm vi nên được giới hạn như sau:

**5.1. Phạm vi chức năng**

Hệ thống tập trung vào:

· Quản lý người dùng.

· Quản lý môn học/chủ đề.

· Quản lý ngân hàng câu hỏi.

· Tạo câu hỏi thủ công.

· Sinh câu hỏi bằng AI ở mức hỗ trợ.

· Tạo đề thi tự động.

· Xáo trộn câu hỏi và đáp án.

· Tổ chức kỳ thi trực tuyến.

· Làm bài trực tuyến.

· Chấm điểm tự động.

· Thống kê và phân tích kết quả.

· Phân tích độ khó câu hỏi.

· Phát hiện một số dấu hiệu bất thường trong quá trình thi.

**5.2. Phạm vi đối tượng**

Hệ thống tập trung vào ba nhóm:

Quản trị viên.

Giảng viên.

Sinh viên/thí sinh.

**5.3. Phạm vi loại câu hỏi**

Trong phiên bản đầu tiên, nên tập trung vào các dạng có thể chấm tự động:

· Trắc nghiệm một đáp án.

· Trắc nghiệm nhiều đáp án.

· Đúng/Sai.

· Điền đáp án đơn giản.

· Câu hỏi tự luận có thể được đưa vào phần định hướng phát triển.

**6. Giới hạn của đề tài**

Do giới hạn về thời gian, nhân lực và phạm vi của đồ án, hệ thống có một số giới hạn:

**6.1. Giới hạn về AI**

AI chỉ đóng vai trò hỗ trợ sinh và phân tích câu hỏi. Câu hỏi được AI tạo ra có thể vẫn tồn tại sai sót về nội dung, đáp án hoặc mức độ phù hợp.

Do đó, giảng viên vẫn cần kiểm duyệt trước khi đưa câu hỏi vào đề thi chính thức.

**6.2. Giới hạn về chấm điểm**

Hệ thống ưu tiên các loại câu hỏi có đáp án xác định rõ ràng.

Việc chấm tự động các câu tự luận hoặc câu trả lời mở có thể cần các mô hình AI chuyên biệt và chưa nằm trong phạm vi chính của phiên bản đầu tiên.

**6.3. Giới hạn về phát hiện gian lận**

Hệ thống chỉ có thể phát hiện và cảnh báo một số dấu hiệu bất thường dựa trên dữ liệu thu thập được.

Không thể đảm bảo phát hiện 100% hành vi gian lận.

**6.4. Giới hạn về quy mô**

Phiên bản thử nghiệm có thể được triển khai ở quy mô trường/lớp hoặc nhóm người dùng nhất định, chưa hướng đến việc phục vụ đồng thời hàng triệu người dùng như các hệ thống khảo thí quy mô quốc gia.

**6.5. Giới hạn về nội dung**

Hệ thống không tự chịu trách nhiệm xác định tính chính xác tuyệt đối của kiến tức. Người tạo đề vẫn chịu trách nhiệm kiểm tra và phê duyệt nội dung câu hỏi.

**7\. Yêu cầu phi chức năng**

Ngoài các chức năng chính, hệ thống cần đáp ứng một số yêu cầu phi chức năng.

Hiệu năng:

· Thời gian phản hồi của các thao tác thông thường cần nhanh.

· Có khả năng xử lý nhiều thí sinh làm bài đồng thời trong phạm vi triển khai.

· Kết quả bài thi cần được lưu trữ ổn định.

Bảo mật:

· Mật khẩu phải được mã hóa an toàn.

· Phân quyền người dùng.

· Thí sinh chỉ được truy cập các kỳ thi được cấp quyền.

· Không cho phép truy cập trực tiếp vào đáp án từ phía client.

· Bảo vệ dữ liệu bài thi và kết quả.

· Tính tin cậy

· Hạn chế mất dữ liệu khi thí sinh đang làm bài.

· Có cơ chế lưu bài làm định kỳ.

· Tự động xử lý khi hết thời gian.

· Khả năng mở rộng

Kiến trúc hệ thống cần cho phép mở rộng thêm:

· Loại câu hỏi.

· Mô hình AI.

· Phương thức chấm điểm.

· Các báo cáo.

· Các hình thức phát hiện gian lận.

 

**8. Kiến trúc hệ thống dự kiến**

Hệ thống có thể xây dựng theo mô hình:

Frontend → Backend/API → Database

và kết nối thêm:

Backend → AI Service

Trong đó:

**Frontend**

Cung cấp giao diện cho:

· Quản trị viên.

· Giảng viên.

· Thí sinh.

**Backend**

Xử lý:

· Xác thực.

· Phân quyền.

· Quản lý người dùng.

· Quản lý câu hỏi.

· Sinh đề.

· Chấm điểm.

· Quản lý kỳ thi.

· Thống kê.

· Kết nối AI.

· Database

Lưu trữ:

· Người dùng.

· Câu hỏi.

· Đề thi.

· Kỳ thi.

· Bài làm.

· Kết quả.

· Dữ liệu thống kê.

· AI Service

Hỗ trợ:

· Sinh câu hỏi.

· Sinh đáp án.

· Sinh giải thích.

· Ước lượng độ khó.

· Phân tích chất lượng câu hỏi.

· Phân tích hành vi bất thường ở mức hỗ trợ.

**9. Công nghệ và framework sử dụng**

**9.1. Frontend**

Phần giao diện người dùng của hệ thống được xây dựng bằng React, sử dụng ngôn ngữ JavaScript kết hợp với HTML/CSS.

React được lựa chọn vì đây là thư viện phổ biến trong phát triển giao diện web, hỗ trợ xây dựng các thành phần giao diện có khả năng tái sử dụng và phù hợp với các hệ thống có nhiều tương tác theo thời gian thực.

Frontend chịu trách nhiệm cung cấp giao diện cho các nhóm người dùng như quản trị viên, giảng viên và thí sinh.

Các chức năng chính của Frontend gồm:

· Đăng nhập và quản lý tài khoản.

· Giao diện quản lý ngân hàng câu hỏi.

· Giao diện tạo và chỉnh sửa câu hỏi.

· Giao diện hỗ trợ sinh câu hỏi bằng AI.

· Giao diện tạo và quản lý đề thi.

· Giao diện làm bài thi trực tuyến.

· Đồng hồ đếm ngược thời gian làm bài.

· Hiển thị trạng thái các câu hỏi.

· Hiển thị kết quả sau khi thi.

· Dashboard thống kê và biểu đồ phân tích kết quả.

· Giao diện theo dõi các cảnh báo bất thường trong quá trình thi.

· React sẽ giao tiếp với Backend thông qua các API để trao đổi dữ liệu.

**9.2. Ngôn ngữ JavaScript và HTML/CSS**

· JavaScript được sử dụng để xây dựng logic và xử lý các tương tác trên giao diện.

· Một số chức năng sử dụng JavaScript bao gồm:

· Xử lý sự kiện người dùng.

· Gửi và nhận dữ liệu từ Backend.

· Quản lý trạng thái giao diện.

· Xử lý thời gian làm bài.

· Hiển thị câu hỏi và đáp án.

· Cập nhật kết quả.

· Xử lý các thao tác xáo trộn câu hỏi/đáp án ở phía giao diện khi cần thiết.

· HTML/CSS được sử dụng để xây dựng cấu trúc và thiết kế giao diện hệ thống, đảm bảo giao diện có khả năng thích ứng với nhiều kích thước màn hình.

9.3. Backend

Phần Backend của hệ thống được xây dựng bằng Python. Backend đóng vai trò trung gian giữa Frontend, cơ sở dữ liệu và các dịch vụ AI. Backend chịu trách nhiệm xử lý nghiệp vụ, xác thực người dùng, quản lý dữ liệu và cung cấp API cho Frontend.

Các chức năng chính của Backend:

· Xác thực và phân quyền người dùng.

· Quản lý tài khoản.

· Quản lý môn học và chủ đề.

· Quản lý ngân hàng câu hỏi.

· Quản lý đề thi.

· Sinh đề tự động.

· Xáo trộn câu hỏi và đáp án.

· Quản lý kỳ thi.

· Xử lý bài làm.

· Chấm điểm tự động.

· Lưu trữ kết quả.

· Thống kê và phân tích dữ liệu.

· Giao tiếp với dịch vụ AI.

· Ghi nhận các hành vi bất thường trong quá trình thi.

**9.4. Framework Backend – FastAPI**

Đề tài sử dụng FastAPI làm framework chính cho Backend. FastAPI phù hợp với đề tài vì hệ thống được xây dựng theo mô hình API, trong đó React đảm nhiệm giao diện và Python đảm nhiệm xử lý nghiệp vụ phía máy chủ.

FastAPI được sử dụng để:

· Xây dựng REST API.

· Xử lý request/response giữa Frontend và Backend.

· Xác thực người dùng.

· Phân quyền truy cập API.

· Quản lý các nghiệp vụ của hệ thống.

· Kết nối cơ sở dữ liệu.

· Kết nối các dịch vụ AI.

· Hỗ trợ xử lý các tác vụ bất đồng bộ.

**10. Kết luận**

Đề tài “Xây dựng nền tảng khảo thí online tích hợp AI” tập trung giải quyết bài toán số hóa và tự động hóa quy trình kiểm tra, đánh giá. Hệ thống không chỉ cung cấp các chức năng cơ bản như quản lý ngân hàng câu hỏi, tạo đề, tổ chức thi và chấm điểm mà còn hướng tới việc ứng dụng AI trong sinh câu hỏi, đánh giá độ khó và phân tích chất lượng đề thi.

Điểm nổi bật của đề tài là việc kết hợp giữa hệ thống khảo thí trực tuyến, tự động hóa và phân tích dữ liệu với AI, qua đó giúp giảm công việc thủ công cho người ra đề, hỗ trợ đánh giá người học và tạo cơ sở dữ liệu để liên tục cải thiện chất lượng câu hỏi và đề thi.

