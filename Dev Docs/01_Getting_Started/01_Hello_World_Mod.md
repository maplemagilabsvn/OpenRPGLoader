# Hướng Dẫn 01: Tạo Bản Mod Đầu Tiên Trong 5 Phút (Hello World Mod)

> **Mục tiêu**: Xây dựng một bản mod hoàn chỉnh chạy được trên OpenRPGLoader, làm quen với tệp `mod.json` và hiển thị thông báo Toast chào mừng khi người chơi bước vào bản đồ.  
> **Thời gian ước tính**: 5–10 phút.  
> **Yêu cầu**: Trình soạn thảo văn bản (VS Code, Notepad++...). Không cần cài đặt Node.js hay npm.

---

## Bước 1: Khởi Tạo Thư Mục Mod

Mọi bản mod dành cho OpenRPGLoader đều là một thư mục nằm bên trong thư mục `mods/` của trò chơi.

1. Điều hướng đến thư mục trò chơi của bạn: `<Thư Mục Game>/mods/`.
2. Tạo một thư mục mới có tên: `hello_world`.

```text
📁 Thư mục trò chơi
 └── 📁 mods/
       └── 📁 hello_world/       <── Thư mục mod bạn vừa tạo
```

> [!NOTE]
> Tên thư mục phải viết liền, không dấu, sử dụng chữ thường, số hoặc dấu gạch dưới (ví dụ: `my_mod`, `hello_world`, `quest_pack_1`). Tên này nên trùng với trường `id` trong tệp cấu hình ở Bước 2.

---

## Bước 2: Tạo Tệp Kê Khai Siêu Dữ Liệu `mod.json`

Tệp `mod.json` đóng vai trò là "chứng minh nhân dân" của bản mod (tương tự như `manifest.json` trong tiện ích mở rộng Chrome). Bộ nạp sẽ đọc tệp này để biết tên tác giả, phiên bản, quyền hạn và điểm vào của mod.

Bên trong thư mục `hello_world/`, tạo tệp `mod.json` với nội dung sau:

```json
{
  "id": "hello_world",
  "name": "Bản Mod Đầu Tiên (Hello World)",
  "version": "1.0.0",
  "author": "Bạn (Modder Tiên Phong)",
  "description": "Bản mod chào mừng người chơi và minh họa cách sử dụng OpenRPGLoader API.",
  "main": "index.js",
  "dependencies": [],
  "permissions": []
}
```

### Giải thích các trường:
* **`id`**: Định danh duy nhất của mod (dùng để quản lý cấu hình và phát hiện xung đột).
* **`name`**: Tên hiển thị của mod trên giao diện Menu trong game.
* **`version`**: Phiên bản theo chuẩn SemVer 2.0.0 (`major.minor.patch`).
* **`main`**: Tệp mã nguồn chính sẽ được nạp khi khởi động game (mặc định là `index.js`).
* **`permissions`**: Mảng các quyền đặc quyền cần cấp (để trống nếu mod chỉ dùng API chuẩn).

---

## Bước 3: Viết Mã Nguồn `index.js`

Tạo tệp `index.js` cùng cấp với `mod.json` với nội dung sau:

```javascript
/**
 * index.js - Hello World Mod
 * Được nạp an toàn bên trong Two-Phase Sandbox của OpenRPGLoader.
 */
(() => {
    "use strict";

    // 1. In thông báo vào bảng điều khiển Console của game (F12)
    OpenRPGLoader.log("[HelloWorld] Đang khởi động bản mod đầu tiên!");

    // 2. Lắng nghe sự kiện người chơi bước vào bản đồ
    OpenRPGLoader.on("mapLoaded", (mapId) => {
        // Hiển thị thông báo nổi (Toast) góc trên màn hình
        OpenRPGLoader.showInGameToast("🎉 Chào mừng bạn! OpenRPGLoader đang hoạt động!", "info", 4000);
    });

    OpenRPGLoader.log("✔ [HelloWorld] Nạp mod thành công!");
})();
```

> [!TIP]
> Trong môi trường kịch bản mod, bạn có thể gọi trực tiếp biến toàn cục `OpenRPGLoader` hoặc `Forge` (cả hai đều trỏ về cùng một instance của bộ nạp).

---

## Bước 4: Khởi Động Game & Kiểm Tra Kết Quả

1. Chạy trò chơi (`Game.exe`).
2. Quan sát trên màn hình chính (Title Screen), bạn sẽ thấy huy hiệu phiên bản OpenRPGLoader và số lượng mod đã nạp.
3. Chọn mục **"Bản Mod (Mods)"** trên menu hoặc nhấn phím **`F8`**:
   * Bạn sẽ thấy bản mod **"Bản Mod Đầu Tiên (Hello World)"** xuất hiện với trạng thái 🟢 **Đang hoạt động (Active)**.
   * Huy hiệu kiểm định tĩnh hiển thị hạng **`[S]`** (Chuẩn tối ưu).
4. Bấm "Bắt đầu mới" (New Game) hoặc nạp một file Save game:
   * Khi nhân vật xuất hiện trên bản đồ, thông báo Toast màu xanh biển dịu mắt sẽ trượt ra ở góc trên màn hình:
   * `🎉 Chào mừng bạn! OpenRPGLoader đang hoạt động!`

---

## 🎯 Tổng Kết & Bước Tiếp Theo

Chúc mừng bạn! Bạn đã hoàn thành bản mod đầu tiên tuân thủ 100% chuẩn OpenRPGLoader trong chưa đầy 5 phút.

Để học cách thêm trang bị, kỹ năng mới hoặc chỉnh sửa chỉ số nhân vật, hãy tiếp tục đọc:
👉 [**A1. Hướng Dẫn Vá Cơ Sở Dữ Liệu MZ Chuẩn RFC 6902**](../03_How_To_Guides/PART_A_MOD_DEVELOPMENT/01_Patch_Database_RFC6902.md)
