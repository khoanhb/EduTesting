# EduTesting Frontend

Giao diện khảo thí trực tuyến gồm sinh viên, giảng viên và quản trị. Hiện dùng dữ liệu mock; chưa có API server hoặc phiên đăng nhập thật.

## Cài đặt và chạy

Mở terminal tại thư mục này (`source_code/`) sau khi giải nén. Môi trường kiểm tra dùng Node.js 24; dependency được khóa trong package-lock.json.

```powershell
npm ci
npm run dev
```

## Kiểm tra và build

```powershell
npm run lint
npx --no-install jiti audit-crossphase.mjs
node --test tests/examAccess.test.mjs
npm run build
npm run preview
```

Nếu môi trường hạn chế tạo tiến trình, dùng `node --test --test-isolation=none tests/examAccess.test.mjs`.

Build tạo `dist/` và tải các page theo nhu cầu. Khi triển khai, phát hành toàn bộ dist và cấu hình máy chủ trả index.html cho route ứng dụng; không mở index.html trực tiếp bằng file://.

## Tài liệu

- [Yêu cầu chức năng](../docs/functional-requirements.md).
- [Sơ đồ](../docs/diagrams/README.md).

Không cần kèm node_modules hoặc dist khi bàn giao source. Người nhận dùng npm ci để cài thư viện và npm run build để tạo bản triển khai.
