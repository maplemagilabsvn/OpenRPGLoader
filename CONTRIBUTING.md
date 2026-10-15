# 🤝 Hướng Dẫn Đóng Góp (Contributing to OpenRPGLoader)

Cảm ơn bạn đã quan tâm và muốn đóng góp cho dự án mã nguồn mở **OpenRPGLoader**! Dưới đây là các quy tắc và hướng dẫn để giúp quá trình đóng góp diễn ra thuận lợi và hiệu quả.

---

## 🛠️ 1. Quy Trình Làm Việc (Workflow)

1. **Fork** repository này về tài khoản GitHub của bạn.
2. **Clone** bản fork về máy cá nhân:
   ```bash
   git clone https://github.com/maplemagilabsvn/OpenRPGLoader
   ```
3. Tạo một nhánh mới (Branch) mang tính mô tả cao:
   ```bash
   git checkout -b feature/awesome-feature
   # hoặc: git checkout -b fix/issue-description
   ```
4. Thực hiện các chỉnh sửa, cập nhật tài liệu tương ứng trong `Dev Docs/`.
5. Chạy bộ kiểm thử tự động để đảm bảo không làm sập code cũ:
   ```bash
   node test/test_runner.js
   ```
6. Commit thay đổi theo quy chuẩn Conventional Commits:
   ```bash
   git commit -m "feat: add support for dynamic resource relocation"
   ```
7. Push nhánh lên fork của bạn và tạo một **Pull Request (PR)** vào nhánh `main` của repository gốc.

---

## 📐 2. Quy Chuẩn Mã Nguồn

* **Tính trung lập**: Tuyệt đối không gắn chết các tên game cụ thể hay phụ thuộc vào dự án đóng kín nào. Lõi `OpenRPGEngine` và `OpenRPGLoaderCore` phải luôn giữ tính trung lập và mở rộng qua kế thừa/extensions.
* **Phòng vệ tối đa (Defensive Programming)**:
  - Mọi thao tác I/O phải được bao bọc an toàn qua `try/catch`.
  - Luôn kiểm tra sự tồn tại của các đối tượng toàn cục trước khi gọi (`typeof SceneManager !== "undefined"`).
  - Không ném exception trực tiếp làm văng game trong gameplay loop (hãy để `Circuit Breaker` hoặc `RecoveryDialog` xử lý).
* **Tuân thủ RFC 6902**: Các thao tác chèn, sửa, xóa Database phải tuân thủ chuẩn JSON-Patch quốc tế.

---

## 🧪 3. Kiểm Thử

Mọi Pull Request bổ sung tính năng hoặc vá lỗi bắt buộc phải vượt qua toàn bộ 7 test suite trong:
```bash
node test/test_runner.js
```
Nếu bạn bổ sung API mới, vui lòng viết thêm test case tương ứng vào `test/test_runner.js`.

---

## 📜 4. Giấy Phép & Bản Quyền

Bằng việc gửi Pull Request, bạn đồng ý rằng toàn bộ đóng góp của bạn sẽ được phát hành theo giấy phép [MIT License](LICENSE) của dự án.
