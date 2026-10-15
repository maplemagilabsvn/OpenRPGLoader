# Hướng Dẫn B1: Kế Thừa & Tạo Bản Phân Phối Loader Mới (Subclassing Guide)

> **Dành cho**: Studio game hoặc lập trình viên muốn tạo ra một phiên bản Mod Loader mang thương hiệu riêng của trò chơi (Derivative Mod Loader) mà **không làm xáo trộn hay sửa đổi mã nguồn gốc của OpenRPGLoader**.

---

## 1. Mô Hình Kế Thừa Hướng Đối Tượng

Trong kiến trúc của OpenRPGLoader, lớp `OpenRPGLoaderCore` được thiết kế dưới dạng lớp cơ sở (Base Class) mở. Bất kỳ tựa game nào cũng có thể tạo ra bản phái sinh bằng cú pháp kế thừa ES6 chuẩn:

```javascript
class MyGameModLoader extends OpenRPGLoaderCore {
    // Tùy biến constructor, chính sách, và API riêng
}
```

---

## 2. Các Bước Xây Dựng Bản Phái Sinh Chuẩn

### Bước 1: Khởi Tạo Tệp Bộ Nạp Của Game

Tạo tệp `js/plugins/MyGame_ModLoader.js` (hoặc đặt tên phù hợp với game của bạn):

```javascript
(() => {
    "use strict";

    // 1. Lấy Base Class từ global scope
    const BaseLoader = (typeof OpenRPGLoaderCore !== "undefined")
        ? OpenRPGLoaderCore
        : (typeof require !== "undefined" ? require("./OpenRPGLoader").OpenRPGLoaderCore : null);

    if (!BaseLoader) {
        console.error("Không tìm thấy OpenRPGLoaderCore!");
        return;
    }

    // 2. Kế thừa lớp
    class MyGameModLoader extends BaseLoader {
        constructor() {
            // Truyền cấu hình siêu dữ liệu của tựa game
            super({
                name: "MyGameModLoader",
                version: "1.0.0",
                features: {
                    audit: true,
                    strictQuarantine: false, // Không chặn mod oan
                    circuitBreaker: true,    // Chống crash vòng lặp trận đánh
                    safeFs: true,            // Chống path traversal
                    saveShield: true         // Bảo vệ savegame
                }
            });

            // Tùy biến thêm logic tại đây...
        }

        // 3. Override vòng đời nếu cần
        init() {
            super.init();
            console.log("🎮 [MyGameModLoader] Khởi tạo thành công bản phái sinh!");
        }
    }

    // 4. Khởi tạo instance và xuất ra window
    const instance = new MyGameModLoader();
    if (typeof window !== "undefined") {
        window.MyGameModLoader = MyGameModLoader;
        window.MyGameLoader = instance;
    }
})();
```

---

## 3. Các Phương Thức Bạn Có Thể Override Sạch Sẽ

Nếu tựa game của bạn có những đòi hỏi đặc biệt, bạn có thể ghi đè các hàm sau:

| Phương thức | Chức năng mặc định | Kịch bản nên Override |
| :--- | :--- | :--- |
| `init()` | Khởi động các hook cơ bản của game | Khi cần nạp thêm resource riêng của game trước khi load mod |
| `setupInGameUI()` | Chèn menu "Bản Mod" vào Title/Menu | Khi game của bạn có giao diện UI tùy biến hoàn toàn (không dùng RPG Maker Window_Base) |
| `loadModConfigValues()` | Đọc file cấu hình từ ổ cứng cục bộ | Khi bạn muốn lưu cấu hình mod lên Cloud/Server thay vì máy cục bộ |
| `applyDataPatches()` | Tự động vá 14 bảng dữ liệu MZ | Khi bạn có bảng dữ liệu riêng độc quyền (ví dụ `$dataCyberware`) |

---

👉 Xem tiếp:  
[**B2. Tùy Biến Chính Sách Bảo Mật (Pluggable Policy APIs)**](02_Customizing_Security_Policies.md)
