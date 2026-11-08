# Changelog

Tất cả các thay đổi đáng chú ý của dự án **OpenRPGLoader** sẽ được ghi chép lại tại tài liệu này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/vi/1.0.0/), và dự án tuân thủ [Semantic Versioning](https://semver.org/lang/vi/).

---

## [1.1.1] - 2026-11-08

### 🐛 Sửa lỗi (Fixed)
- **Sửa lỗi phạm vi biến Circuit Breaker (Scope Resolution Fix)**: Khắc phục lỗi tiềm ẩn `ReferenceError: culprit is not defined` khi nhà phát triển đăng ký Master Security Policy (`engine.setSecurityPolicy`) và một Safe Hook ném ngoại lệ trong quá trình chạy. Khai báo biến `culprit` đã được đưa lên ngay đầu khối kiểm tra Circuit Breaker trong cả `OpenRPGEngine.js` và `OpenRPGLoader.js`, đảm bảo đối tượng mod gây lỗi luôn được truyền hợp lệ vào chính sách bảo mật.  
  *(Cảm ơn đóng góp xuất sắc từ contributor [@PhongOfficial5](https://github.com/PhongOfficial5) qua Pull Request [#1](https://github.com/maplemagilabsvn/OpenRPGLoader/pull/1))*.

### 🧪 Kiểm thử (Testing)
- **Kịch bản kiểm thử hồi quy (Regression Test #240)**: Bổ sung bài kiểm tra tự động xác nhận Circuit Breaker phối hợp chuẩn xác với Master Security Policy khi xử lý lỗi Safe Hook, nâng tổng số kiểm thử tự động của dự án lên **240/240 kịch bản PASS (100.0%)**.

---

## [1.1.0] - 2026-11-06

### 🛡️ Bảo mật (Security)
- **Hỏi xác nhận quyền nguy hiểm (Dangerous Permission Prompts)**: Tự động cảnh báo và hỏi người dùng (`window.confirm` trên UI hoặc hook chính sách `policies.permissionPrompt`) khi mod yêu cầu các quyền rủi ro cao (`child_process:exec`, `filesystem:unrestricted`, `system:control`, `network:outbound` hoặc wildcard `*`).
- **Chặn vượt rào Sandbox qua Node Protocol Prefix**: Chặn triệt để việc mod gọi `require("node:child_process")`, `require("node:fs")` để lách luật sandbox.
- **Bảo vệ thao tác đọc trong Safe-FS (Read Interception)**: Khóa toàn diện cả các hàm đọc (`readFileSync`, `readFile`, `createReadStream`, `readdir`, `readlink`, `open/openSync` và `fs.promises`) để ngăn mod đọc trộm mã nguồn, token hoặc file save của người chơi.
- **Khóa phạm vi toàn cục (Global Scope Escape Defense)**: Triệt tiêu nguy cơ mod gọi lén `window.require`, `globalThis.require` hoặc `global.require` bên trong mã nguồn mod.
- **Chống ô nhiễm nguyên mẫu (Prototype Pollution Defense)**: Loại bỏ nguy cơ khai thác `__proto__`, `constructor`, `prototype` trong bộ phân giải đường dẫn RFC 6902 `JsonPatch`.
- **Khóa Native C++ Addon & V8 Bindings**: Khóa hoàn toàn `process.dlopen`, `process.binding` và `process._linkedBinding` trong sandbox.
- **Chống tấn công Null-Byte Poison**: Tự động phát hiện và từ chối các đường dẫn tệp chứa ký tự null `\0` trong Safe-FS.
- **Cách ly mod thiếu phụ thuộc**: Tự động cách ly (`missing_dependency`) nếu thiếu mod nền tảng, kể cả khi tắt chế độ Strict Quarantine.

### ⚙️ Tính năng mới & Tùy biến (Added)
- **Kiểm tra cú pháp nghiêm ngặt (Strict Syntax Enforcement)**: Bỏ cơ chế tha thứ lỗi cú pháp. Bất kỳ lỗi JSON trong `mod.json` hoặc lỗi cú pháp JS đều bị báo lỗi lập tức (`status: "error"`) và từ chối nạp để đảm bảo an toàn tuyệt đối cho trò chơi.
- **Master Security Policy**: Hàm `setSecurityPolicy(fn)` cho phép dev thiết lập một chốt chặn bảo mật trung tâm, ghi đè toàn quyền mọi quyết định an ninh (`permission`, `fs`, `audit`, `prompt`).
- **Bộ cờ ưu tiên mở rộng (Priority System)**: Hỗ trợ các cờ `CRITICAL (10000)`, `HIGHEST (1000)`, `HIGH (500)`, `NORMAL (0)`, `LOW (-500)`, `LOWEST (-1000)`, `MINIMAL (-10000)` cùng các hàm `setPriorityFlags(flags)` và `resolvePriority(val)`.
- **Tùy biến thuật toán ưu tiên (Custom Priority Comparator)**: Hàm `setPriorityComparator(fn)` cho phép lập trình viên viết lại 100% thuật toán so sánh độ ưu tiên cho candidate mods, hook pipeline và event bus.
- **API quản lý quyền hạn động**: Cung cấp `grantPermission(modId, perm)` và `revokePermission(modId, perm)`.
- **EventBus `.once()` & `.off()`**: Bổ sung hàm đăng ký lắng nghe sự kiện một lần và hàm hủy đăng ký sự kiện cho `OpenRPGEngine` và `OpenRPGLoader`.
- **Bộ kiểm thử 239 kịch bản**: Bổ sung Test Suite 11 & Suite 12 nâng tổng số test lên 239 kịch bản tự động, đạt tỷ lệ vượt qua **100.0%**.

### 🐛 Sửa lỗi (Fixed)
- **Ngăn ngừa Double Patching**: Khắc phục lỗi dữ liệu bị vá 2 lần (làm nhân đôi vật phẩm/kỹ năng khi dùng pointer `/-`) thông qua cờ bảo vệ `_dataPatchesApplied`.
- **Chuẩn hóa RFC 6901 Root Pointer**: Phân biệt chuẩn xác giữa Root Document (chuỗi rỗng `""`) và thuộc tính có tên là chuỗi rỗng (`"/"`).

---

## [1.0.0] - 2026-10-15

### 🚀 Khởi tạo dự án
- Kiến trúc 2 tầng chuẩn mực: **OpenRPGEngine** (Lõi độc lập) và **OpenRPGLoader** (Bản phân phối tích hợp cho RPG Maker MZ).
- Hệ thống Hook Pipeline với bảo vệ ngắt mạch (Circuit Breaker).
- Hệ thống kiểm định bảo mật 9 tầng (9-Layer Security Audit Pipeline) xếp hạng S/A/B/C/F.
- Tương thích RFC 6902 JSON-Patch cho Database Game.
- Bộ nạp phụ thuộc Topo Sort với SemVer và kiểm tra xung đột (Conflicts).
- Khung UI Adapter và Extension Registry chuẩn hóa.
