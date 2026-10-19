# Sơ đồ phân tích và thiết kế EduTesting

Ngày đối chiếu: 09/10/2026. Thư mục chứa Use Case, Activity, Sequence, Class và ERD cho phạm vi FR-01–FR-12.

## Phạm vi và công nghệ

Các sơ đồ mô tả **hệ thống mục tiêu khi tích hợp**, dựa trên các màn hình/nghiệp vụ hiện có. FE trong [source_code](../../source_code/) dùng React 19, JavaScript/JSX, React Router 7, Vite 8, Tailwind CSS 3.4 và Lucide. [Tài liệu đề tài, mục 9](../elit.md) chọn BE Python/FastAPI; kiến trúc BE tham chiếu gồm PostgreSQL + Redis. Source hiện chưa có BE, API server, ORM, schema hay cấu hình DB để xác nhận triển khai thực tế. Phiên bản FE đối chiếu package.json và package-lock.json.

Các bước gọi API, lưu DB, AI, WebSocket, autosave và chấm/nộp trên server trong sơ đồ là thiết kế dự kiến. Không đọc chúng thành xác nhận FE đã tích hợp. FE hiện dùng mock/state, chưa lưu bài thi hoặc xác thực trên server; xem [hướng dẫn frontend](../../source_code/README.md). API và quyền truy cập cần BE chốt khi tích hợp. Yêu cầu nghiệp vụ gốc ở [functional-requirements.md](../functional-requirements.md).

## Danh mục sơ đồ

| Nhóm | File | Nội dung |
|---|---|---|
| Use Case | [UC-Overview](usecase/UC-Overview.puml) | Tổng quan 12 nhóm UC |
| Use Case | [UC-SystemAdministration](usecase/UC-SystemAdministration.puml) | UC02–UC04, quản trị |
| Use Case | [UC-QuestionBankExam](usecase/UC-QuestionBankExam.puml) | UC05–UC07, câu hỏi và đề |
| Use Case | [UC-ExamMonitoringGrading](usecase/UC-ExamMonitoringGrading.puml) | UC08, UC10–UC12, thi/chấm/giám sát/kết quả |
| Đặc tả | [UC-SpecificationTable](usecase/UC-SpecificationTable.md) | Tiền điều kiện, luồng, lỗi, hậu điều kiện và hiện trạng FE |
| Activity / Sequence | [Act-UC04](activity/Act-UC04-SubjectManagement.puml) / [Seq-UC04](sequence/Seq-UC04-SubjectManagement.puml) | Môn, chương, thứ tự và kiểm tra xóa |
| Activity / Sequence | [Act-UC06](activity/Act-UC06-AIQuestionGeneration.puml) / [Seq-UC06](sequence/Seq-UC06-AIQuestionGeneration.puml) | Gợi ý AI, duyệt và lưu câu |
| Activity / Sequence | [Act-UC07](activity/Act-UC07-ExamMatrixConfiguration.puml) / [Seq-UC07](sequence/Seq-UC07-ExamMatrixConfiguration.puml) | Ma trận, lưu nháp, xuất bản và cờ công bố |
| Activity / Sequence | [Act-UC08](activity/Act-UC08-Auto-Manual-Grading.puml) / [Seq-UC08](sequence/Seq-UC08-Auto-Manual-Grading.puml) | Chấm/đối soát; tách chốt và công bố điểm |
| Activity / Sequence | [Act-UC10](activity/Act-UC10-ExamMonitoring.puml) / [Seq-UC10](sequence/Seq-UC10-ExamMonitoring.puml) | Sự kiện, đình chỉ, biên bản và xử lý theo lượt |
| Activity / Sequence | [Act-UC11](activity/Act-UC11-OnlineExam.puml) / [Seq-UC11](sequence/Seq-UC11-OnlineExam.puml) | Tạo/khôi phục lượt, lưu bài, hết giờ và nộp một lần |
| Activity / Sequence | [Act-UC12](activity/Act-UC12-ResultReview.puml) / [Seq-UC12](sequence/Seq-UC12-ResultReview.puml) | Điểm, xem bài trung tính, đáp án và xử lý vi phạm |
| Class | [class.mmd](class.mmd) | Lớp nghiệp vụ và dịch vụ dự kiến cho BE |
| ERD | [erd.mmd](erd.mmd) | Quan hệ dữ liệu khái niệm, chưa phải schema/migration cuối |

## Quy ước nghiệp vụ chung

1. Phân biệt examId/examCode (đề/kỳ thi), testCode (mã đề), attemptId/attemptNumber (lượt). Log, biên bản, câu trả lời và kết quả phải gắn đúng lượt.
2. maxAttempts=0 được đề xuất là không giới hạn. Quyền vào thi, lịch và hết giờ phải do server kiểm tra; các trạng thái ACTIVE/UPCOMING trên FE hiện là mock.
3. antiCheat tắt thì không thu sự kiện giám sát. Cảnh báo lần 1–2, đình chỉ ở ngưỡng 3 theo quy tắc đang dùng; gợi ý rủi ro AI không tự tạo thêm điều kiện đình chỉ.
4. Có biên bản chưa đồng nghĩa đã xử lý xong hoặc đã công bố điểm. Mô hình xử lý NONE/PENDING/RESOLVED/CANCELLED cần BE xác nhận; FE hiện còn suy trạng thái chờ từ isSuspended/report.
5. Lưu/chốt điểm khác công bố. PENDING giữ điểm và chặn review; RESOLVED xét quyền riêng; CANCELLED chặn review. Nếu chỉ cho xem bài mà chưa công bố điểm thì response không kèm đáp án chuẩn, điểm từng câu, lời giải hoặc nhãn đúng/sai.
6. Các endpoint trong sơ đồ là đề xuất; base URL/prefix, schema và mã lỗi cần BE chốt. Mô hình dữ liệu khái niệm chưa dùng kiểu vật lý/ORM cụ thể; PostgreSQL + Redis là kiến trúc tham chiếu, chưa phải cấu hình đã triển khai.

## Cách đọc Class và ERD

Class là mô hình miền nghiệp vụ, **không phải React class component hay các lớp Python đã có**. Dịch vụ thể hiện trách nhiệm dự kiến của BE. ResultAccess là object quyền trong response, không bắt buộc lưu thành bảng.

ERD giữ các quan hệ ngân hàng câu hỏi, đề, phân công và lượt; bổ sung học kỳ, mã đề, phòng theo đề và biên bản. Đây là phần dữ liệu khảo thí cốt lõi; danh mục tổ chức/hồ sơ chi tiết phải đối chiếu source_code/src/data/shared/organization.js khi BE thiết kế schema đầy đủ.

Các ràng buộc cần chốt khi triển khai:

- Duy nhất theo cặp (examId, testCode), (examId, roomCode), (examId, studentId) cho phân công và theo (examId, studentId, attemptNumber) cho lượt.
- Chống trùng (attemptId, eventId); mỗi AttemptQuestion có tối đa một StudentAnswer; mỗi lượt có tối đa một ExamResult và một biên bản trong mô hình hiện tại.
- Mã đề và phòng của lượt phải thuộc cùng đề thi. TeachingAssignment áp dụng cho tài khoản GV; ExamAssignment/ExamAttempt áp dụng cho tài khoản SV; quyền do BE kiểm tra.
- AttemptQuestion giữ snapshot nội dung và dữ liệu chấm ở BE. Thay đổi câu nguồn không được làm đổi bài đã thi; không xóa dây chuyền đáp án nguồn làm mất câu trả lời lịch sử.
- score có thể chưa có; không dùng 0 để biểu diễn chưa chấm/chưa công bố. rawScore là điểm trước xử lý, score là điểm sau xử lý; dữ liệu trả cho SV phải được lọc theo quyền.
- Tên bảng, kiểu vật lý, khóa, cách lưu thứ tự/mã đề, giao dịch và lịch sử sửa điểm/biên bản cuối cùng do BE thiết kế. Các trường JSON trong ERD chỉ minh họa cấu trúc snapshot, không bắt buộc chọn cách lưu đó.

## Loại sơ đồ cần bổ sung

Cặp Activity/Sequence UC12 đã bổ sung cho chức năng kết quả hiện có. Bộ Use Case, Activity, Sequence, Class và ERD đáp ứng phần phân tích nghiệp vụ/dữ liệu chính.

Có thể bổ sung **Component Diagram** để mô tả React ↔ FastAPI ↔ AI/PostgreSQL/Redis và **Deployment Diagram** để mô tả nơi chạy FE, API, DB nếu báo cáo yêu cầu kiến trúc/triển khai. Hai loại này chưa được tạo vì chưa có cấu hình triển khai thực tế và cần phân biệt kiến trúc tham chiếu với hệ thống đã chạy. Không cần vẽ thêm mọi loại UML chỉ để tăng số lượng.
