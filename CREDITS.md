# 🎖️ Danh Sách Ghi Nhận Đóng Góp (Credits & Contributors)

Dự án **OpenRPGLoader** được phát triển và duy trì bởi cộng đồng mã nguồn mở. Mọi đóng góp về kiến trúc, logic, sửa lỗi và kiểm thử đều được trân trọng ghi nhận theo danh mục dưới đây (chỉ sử dụng biệt danh/nickname và tài khoản GitHub):

---

## 🏛️ Kiến Trúc & Logic Cốt Lõi (Architecture & Core Logic)

* **Thiết kế nền tảng & Kiến trúc 2 tầng (OpenRPGEngine & OpenRPGLoaderCore)**:
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Xây dựng mô hình Chromium-style phân tách độc lập giữa core engine và UI adapter; thiết lập hệ thống Lifecycle Hooks hai pha (Staged Sandbox).
  - Toàn bộ tính năng cốt lõi (RFC 6902 JSON-Patch, Topo Sort SemVer, Circuit Breaker, Save Shield, Safe-FS, Virtual Asset Resolver, Encrypted Asset Mapping & Decryption Bypass) đều thuộc quyền sở hữu kiến trúc và phát triển của **M.A.P.L.E MAGI Labs**.

---

## 💡 Ý Tưởng & Đề Xuất Giải Pháp (Ideas & Proposals)

* **Phương án Tương thích Tài nguyên Mã hóa & Bỏ qua Giải mã Mod (Encrypted Asset Mapping & Decryption Bypass)**:
  - **Đề xuất & đóng góp ý tưởng bởi:** **`@PhongOfficial5`** (đóng góp qua Discord)
  - **Chi tiết:** Đề xuất phương án xử lý xung đột tài nguyên khi game RPG Maker (MZ/MV) kích hoạt tính năng mã hóa file (`hasEncryptedImages`, `hasEncryptedAudio`).

---

## 👥 Người Đóng Góp Cộng Đồng (Community Contributors)

* **Sửa lỗi phạm vi biến Circuit Breaker (Scope Resolution Fix - PR #1)**:
  - **Đóng góp bởi:** **`@PhongOfficial5`** ([Pull Request #1](https://github.com/maplemagilabsvn/OpenRPGLoader/pull/1))
  - **Chi tiết:** Đóng góp bản vá nhỏ (Contributor Patch) đưa biến `culprit` lên đầu khối kiểm tra Circuit Breaker.

---

## 🛡️ Bảo Vệ & An Toàn Hệ Thống (Defensive Systems)

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
  - **Đóng góp bởi:** **M.A.P.L.E MAGI Labs**
  - **Chi tiết:** Bổ sung bài kiểm tra tự động khóa cứng lỗi phạm vi biến của `culprit` trong Safe Hook Circuit Breaker.

---

## 📜 Giấy Phép & Quy Định Ghi Nhận

* Mã nguồn **OpenRPGLoader** được phát hành theo giấy phép **MIT License**.
* Mọi đóng góp từ cộng đồng đều được ghi nhận công khai và minh bạch qua hệ thống GitHub Pull Requests và tệp `CREDITS.md`.
