# 🎖️ Danh Sách Ghi Nhận Đóng Góp (Credits & Contributors)

Dự án **OpenRPGLoader** được phát triển và duy trì bởi cộng đồng mã nguồn mở. Mọi đóng góp về kiến trúc, logic, sửa lỗi và kiểm thử đều được trân trọng ghi nhận theo danh mục dưới đây (chỉ sử dụng biệt danh/nickname và tài khoản GitHub):

---

## 🏛️ Kiến Trúc & Logic Cốt Lõi (Architecture & Core Logic)

* **Thiết kế nền tảng & Kiến trúc 2 tầng (OpenRPGEngine & OpenRPGLoaderCore)**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Xây dựng mô hình Chromium-style phân tách độc lập giữa core engine và UI adapter; thiết lập hệ thống Lifecycle Hooks hai pha (Staged Sandbox).

* **Bộ nạp dữ liệu không phá hủy RFC 6902 JSON-Patch**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Triển khai đầy đủ 6 thao tác RFC 6902 (`add`, `remove`, `replace`, `move`, `copy`, `test`), hỗ trợ pointer escaping RFC 6901, atomic revert và cơ chế chống double-patching.

* **Bộ phân giải phụ thuộc Topo Sort & Quản lý SemVer**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Thuật toán Kahn sắp xếp thứ tự nạp mod, kiểm tra vòng lặp phụ thuộc (Cycle Detection) và khớp dải phiên bản SemVer (Caret `^`, Tilde `~`, Range).

* **Ma trận kiểm định an toàn 9 lớp (9-Layer Security Audit Pipeline)**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Phân tích tĩnh cú pháp, chấm điểm độ an toàn S/A/B/C/F, bộ nhớ đệm SHA-256 tăng tốc thời gian mở game.

* **Hệ thống bảo vệ Save Game (Save Shield)**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Nhận diện và thanh lọc dữ liệu mồ côi khi tháo gỡ mod, giảm thiểu tối đa nguy cơ corrupted save.

* **Hệ thống phân quyền & Sandbox bảo vệ**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Cảnh báo quyền nguy hiểm (Dangerous Permission Prompts), Safe-FS chặn truy cập ngoài thư mục game, Safe-Process khóa native C++ addon.

---

## 💡 Ý Tưởng & Đề Xuất Giải Pháp (Ideas & Proposals)

* **Phương án Tương thích Tài nguyên Mã hóa & Bỏ qua Giải mã Mod (Encrypted Asset Mapping & Decryption Bypass)**:
  - **Đề xuất & đóng góp ý tưởng bởi:** **`@PhongOfficial5`** (đóng góp qua Discord)
  - **Chi tiết:** Đề xuất phương án xử lý xung đột tài nguyên khi game RPG Maker (MZ/MV) kích hoạt tính năng mã hóa file (`hasEncryptedImages`, `hasEncryptedAudio`). Thay vì buộc modder phải giải mã game hay can thiệp thủ công vào hệ thống, giải pháp đề xuất cơ chế tự động ánh xạ đuôi mã hóa (`.png_`, `.rpgmvp`, `.ogg_`, `.rpgmvo`, `.rpgmvm`) sang asset sạch (`.png`, `.ogg`, `.m4a`) của mod trong `VirtualAssetResolver`, kết hợp nhận diện magic bytes nhị phân (PNG, OGG, JPEG, M4A, RIFF) để tự động bỏ qua khâu XOR decryption của game đối với tài nguyên mod sạch, ngăn chặn triệt để lỗi hỏng hình ảnh/âm thanh và crash game.

---

## 🐛 Sửa Lỗi (Bug Fixes)

* **Sửa lỗi phạm vi biến Circuit Breaker (Scope Resolution Fix - PR #1)**:
  - **Đóng góp bởi:** **`@PhongOfficial5`** ([Pull Request #1](https://github.com/maplemagilabsvn/OpenRPGLoader/pull/1))
  - **Chi tiết:** Phát hiện và khắc phục lỗi phạm vi biến tiềm ẩn (Temporal Dead Zone / Scope Resolution) tại cơ chế Safe Hook Circuit Breaker. Đưa khai báo biến `culprit` lên đầu khối kiểm tra, ngăn chặn triệt để nguy cơ văng lỗi `ReferenceError: culprit is not defined` khi nhà phát triển kích hoạt Master Security Policy (`engine.setSecurityPolicy`) trên cả hai tệp `src/OpenRPGEngine.js` và `src/OpenRPGLoader.js`.

* **Vá lỗi bỏ lọt tiền tố Node (`node:child_process`, `node:fs`) & Global Escape**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Chặn triệt để tiền tố `node:` và vô hiệu hóa con trỏ `window.require` / `globalThis.require` trong sandbox mod.

* **Chặn lỗ hổng Prototype Pollution & Null-Byte Poison**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Khóa các thuộc tính nguy hiểm `__proto__`, `constructor`, `prototype` trong JSON-Patch và chặn ký tự null `\0` trong Safe-FS.

---

## 🧪 Kiểm Thử & Tự Động Hóa (Testing & Verification)

* **Bộ siêu kiểm thử tự động 255 kịch bản (Test Suite 1 - 13)**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs** & **Google Antigravity**
  - **Chi tiết:** Xây dựng test runner độc lập kiểm thử toàn diện RFC 6902, Topo Sort, Circuit Breaker, Save Shield, Safe-FS, Master Security Policy, và Bộ tương thích tài nguyên mã hóa (Encrypted Asset Mapping & Decryption Bypass) với tỷ lệ 100% PASS (255/255).

* **Kịch bản kiểm thử hồi quy Circuit Breaker (Test #240)**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs** (xác thực giải pháp từ PR #1 của **`@PhongOfficial5`**)
  - **Chi tiết:** Bổ sung bài kiểm tra tự động khóa cứng lỗi phạm vi biến của `culprit` trong Safe Hook Circuit Breaker.

---

## 📜 Giấy Phép & Quy Định Ghi Nhận

* Mã nguồn **OpenRPGLoader** được phát hành theo giấy phép **MIT License**.
* Mọi đóng góp từ cộng đồng đều được ghi nhận công khai và minh bạch qua hệ thống GitHub Pull Requests và tệp `CREDITS.md`.
