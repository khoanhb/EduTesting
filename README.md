# EduTesting

Frontend hệ thống khảo thí trực tuyến dành cho sinh viên, giảng viên và quản trị viên.

Ứng dụng hiện dùng dữ liệu mock và state trong trình duyệt; chưa tích hợp backend, database hoặc xác thực thật. Nhập/xuất Excel và CSV xử lý file thật trên frontend, chưa lưu dữ liệu vào database.

## Cấu trúc

- `source_code/`: frontend React, cấu hình và tests.
- `docs/`: yêu cầu chức năng và sơ đồ hệ thống.

## Chạy frontend

Cài Node.js (môi trường trước đây đã kiểm tra với Node.js 24), mở terminal tại thư mục repo rồi chạy:

```powershell
cd source_code
npm ci
npm run dev
```

Giữ `package.json` và `package-lock.json` trong Git. `node_modules/` và `dist/` được tạo lại trên từng máy.

## Tài liệu

- [Hướng dẫn frontend](source_code/README.md)
- [Yêu cầu chức năng](docs/functional-requirements.md)
- [Sơ đồ](docs/diagrams/README.md)
