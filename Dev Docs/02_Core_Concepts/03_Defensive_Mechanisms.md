# Bộ Ba Cơ Chế Phòng Vệ Chủ Động (Defensive Systems)

> **Mục tiêu**: Phân tích kỹ thuật chi tiết 3 lớp phòng vệ cốt lõi của OpenRPGEngine: Cầu dao tự ngắt Circuit Breaker, Hộp cát Safe-FS chống Path Traversal và Khiên bảo vệ dữ liệu lưu Save Shield.

---

## 1. Cầu Dao Tự Ngắt Lỗi (Circuit Breaker)

### Bài toán thực tế:
Trong RPG Maker MZ, các phương thức chiến đấu (`Game_Action.prototype.apply`, `BattleManager.update`) được gọi lặp lại hàng chục lần mỗi giây. Nếu một bản mod viết ẩu ném ngoại lệ (`TypeError`, `undefined`), game sẽ crash ngay lập tức và văng người chơi ra ngoài desktop.

### Cơ chế hoạt động:
Mỗi hook đăng ký qua `Forge.hook(...)` hoặc `engine.hook(...)` đều được bọc bên trong một pipeline chịu lỗi:

```text
Lượt gọi hook -> Thử thực thi fn() 
                    ├── Thành công: Chuyển tiếp next()
                    └── Thất bại (catch error):
                         ├── Tăng errorCount++ của hook
                         ├── Ghi log cảnh báo an toàn
                         └── Kiểm tra ngưỡng lỗi (Mặc định trong Core: 2 lần; tùy biến qua circuitBreakerLimit)
                              ├── Chưa chạm ngưỡng: Gọi hàm gốc để game chạy tiếp
                              └── Chạm ngưỡng: ĐÁNH SẬP CẦU DAO (hook.active = false)
                                   └── Các lượt sau BỎ QUA HOÀN TOÀN hook này!
```

```javascript
// Minh họa mã nguồn xử lý trong OpenRPGEngine:
if (currentHook.errorCount >= maxErrors) {
    currentHook.active = false; // Tự ngắt vĩnh viễn hook lỗi
    engineRef.warn(`[Circuit Breaker] Tự ngắt hook [${pipelineKey}] của mod [${currentHook.modId}].`);
    engineRef.notify(`Đã ngắt hook lỗi của mod [${currentHook.modId}].`, "error");
}
return next(currentArgs); // Game vẫn tiếp tục vận hành trơn tru!
```

---

## 2. Hộp Cát Hệ Thống Tệp (Safe-FS Sandbox)

### Bài toán thực tế:
RPG Maker MZ chạy trên NW.js, vốn có toàn quyền truy cập Node.js `fs`. Một bản mod độc hại hoặc lập trình sơ suất có thể dùng đường dẫn lùi `../../../../windows/system32` hoặc xóa sạch thư mục gốc của game.

### Cơ chế hoạt động & Đánh chặn `require('fs')`:
Để chống lại việc mod lách luật bằng cách gọi trực tiếp `require('fs')` trong môi trường NW.js, OpenRPGEngine triển khai cơ chế **Two-Phase Require Interception**:
1. **Đánh chặn cục bộ (`createRequire`)**: Khi mã mod thực thi trong Sandbox, hàm `require()` cục bộ đã bị thay thế. Mọi lệnh `require("fs")` đều bị ép buộc trả về đối tượng `safeFs` thay vì `fs` gốc của Node.js (trừ khi mod được cấp cờ đặc quyền `"filesystem:unrestricted"`).
2. **Prototype Wrapping**: `safeFs` được tạo qua `Object.create(fs)` và bọc toàn bộ các hàm ghi/xóa để kiểm tra Path Traversal:

```text
    Mod gọi require("fs").writeFileSync(path)
                      │
                      ▼
             Bị ép nhận safeFs
                      │
                      ▼
          Kiểm tra isAllowed(path)?
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[NẰM TRONG THƯ MỤC MOD]     [NẰM NGOÀI THƯ MỤC MOD]
Hoặc thư mục data được cấp   Thư mục Windows, ổ C, thư mục game
        │                           │
        ▼                           ▼
Thực thi ghi file bình thường   NÉM LỖI: [Safe-FS] BỊ CHẶN: Path Traversal!
```

### Danh sách các phương thức được bảo vệ:
* **Ghi/Xóa đồng bộ & bất đồng bộ**: `writeFileSync`, `writeFile`, `appendFileSync`, `appendFile`, `unlinkSync`, `unlink`, `rmSync`, `rm`, `rmdirSync`, `rmdir`, `renameSync`, `rename`, `copyFileSync`, `copyFile`.
* **Luồng & Mở tệp**: `createWriteStream`, `openSync`, `open` (tự động phát hiện cờ ghi `"w"`, `"a"`, `"+"`, `O_WRONLY`, `O_RDWR`).
* **Hỗ trợ `fs.promises`**: Bọc toàn bộ các API Promise (`fs.promises.writeFile`, `mkdir`...) thông qua `Object.defineProperty`.
* **Khả năng cắm chốt tùy biến (Pluggable Policy)**: Studio game có thể dùng `engine.setPolicy("fs", (modObj, targetPath, op) => ...)` để cấp thêm quyền ghi vào thư mục cụ thể (ví dụ `save/` hoặc `custom_data/`).

---

## 3. Khiên Bảo Vệ Dữ Liệu Lưu (Save Shield)

### Bài toán thực tế:
Người chơi cài đặt một bản mod thêm 10 thanh kiếm mới (ID từ 500 đến 510). Người chơi lưu game. Sau đó, họ xóa mod. Khi nạp lại file save, RPG Maker MZ cố gắng đọc dữ liệu trang bị của ID 500 nhưng trong database `$dataWeapons[500]` không còn tồn tại -> **Crash màn hình trắng hoặc kẹt tải file save vĩnh viễn**.

### Cơ chế hoạt động:
OpenRPGLoader hook vào phương thức `DataManager.extractSaveContents` và kích hoạt `sanitizeSaveContents()` ngay khi file save vừa được nạp vào bộ nhớ:

1. **Khử trùng vật phẩm, vũ khí, áo giáp mồ côi**:
   ```javascript
   // Quét sạch các ID không còn tồn tại trong cơ sở dữ liệu hiện tại
   for (const id in party._weapons) {
       if (!globalObj.$dataWeapons || !globalObj.$dataWeapons[id]) {
           delete party._weapons[id];
           removed.weapons++;
       }
   }
   ```
2. **Khử trùng đội hình nhân vật (Party Actors)**:
   * Lọc bỏ những nhân vật thuộc về mod đã bị gỡ.
   * **Cơ chế Fallback cứu nguy**: Nếu toàn bộ đội hình đều là nhân vật của mod bị xóa, hệ thống sẽ tự động khôi phục nhân vật mặc định đầu tiên từ `$dataSystem.partyMembers[0]`, giúp người chơi không bị rơi vào trạng thái "đội hình rỗng" gây treo game.
3. **Phát sự kiện minh bạch**: Phát tín hiệu `save:sanitized` và ghi log thống kê số lượng định danh đã được giải cứu an toàn.

---

👉 Xem hướng dẫn áp dụng thực tế:  
[**A2. Hook An Toàn Vào Lớp Logic Game**](../03_How_To_Guides/PART_A_MOD_DEVELOPMENT/02_Hook_Game_Methods_Safely.md)  
[**B2. Tùy Biến Chính Sách Bảo Mật (Pluggable Policy APIs)**](../03_How_To_Guides/PART_B_DERIVATIVE_LOADERS/02_Customizing_Security_Policies.md)
