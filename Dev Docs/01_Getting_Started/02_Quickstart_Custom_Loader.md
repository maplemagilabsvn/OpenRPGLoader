# Hướng Dẫn 02: Tạo Bản Mod Loader Phái Sinh Trong 10 Phút (Quickstart Custom Loader)

> **Mục tiêu**: Hướng dẫn một studio game hoặc lập trình viên cách kế thừa `OpenRPGLoaderCore` để tạo ra bộ nạp mod riêng biệt (Derivative Loader) mang thương hiệu của tựa game trong ~30–40 dòng mã.  
> **Thời gian ước tính**: 10 phút.  
> **Áp dụng cho**: Nhà phát triển game muốn tích hợp sẵn hệ sinh thái modding vào dự án trò chơi của mình.

---

## 1. Triết Lý Tái Bản: Giống Như Tạo Trình Duyệt Từ Nhân Chromium

Giống như cách **Microsoft Edge**, **Brave**, hay **Opera** được xây dựng bằng cách lấy lõi **Chromium** rồi thêm các dịch vụ, giao diện và chính sách riêng; OpenRPGLoader cho phép bạn tạo ra một bản Mod Loader riêng (ví dụ: `FantasyCombatLoader`, `CyberpunkLoader`, `MyGameLoader`) mà **không cần sửa một byte mã nguồn nào của bộ nạp gốc**.

---

## 2. Các Bước Thực Hiện

### Bước 1: Khởi Tạo Tệp Bộ Nạp Phái Sinh

Tạo tệp JavaScript cho bộ nạp của bạn, ví dụ đặt tại `js/plugins/MyGame_ModLoader.js`:

```javascript
/**
 * MyGame_ModLoader.js - Bản Mod Loader Phái Sinh Cho Tựa Game Của Bạn
 * Kế thừa trực tiếp từ OpenRPGLoaderCore
 */
(() => {
    "use strict";

    // 1. Phục hồi lớp nền tảng OpenRPGLoaderCore
    const BaseLoader = (typeof OpenRPGLoaderCore !== "undefined")
        ? OpenRPGLoaderCore
        : (typeof require !== "undefined" ? require("./OpenRPGLoader").OpenRPGLoaderCore : null);

    if (!BaseLoader) {
        console.error("[MyGameLoader] Không tìm thấy OpenRPGLoaderCore! Hãy đảm bảo OpenRPGLoader.js được nạp trước.");
        return;
    }

    // 2. Kế thừa và định nghĩa Bộ nạp riêng cho trò chơi
    class MyGameLoader extends BaseLoader {
        constructor() {
            // Cấu hình tên, phiên bản, ngưỡng Circuit Breaker và các cờ tính năng (Feature Toggles)
            super({
                gameId: "my_custom_rpg",
                gameVersion: "1.0.0",
                circuitBreakerLimit: 5,  // Tự động ngắt mod nếu lỗi vượt quá 5 lần (mặc định của core là 2)
                features: {
                    audit: true,             // Bật kiểm toán mã độc tĩnh
                    strictQuarantine: false, // Mềm dẻo: Cảnh báo chứ không chặn oan mod
                    safeFs: true,            // Bật Safe-FS chống path traversal
                    circuitBreaker: true,    // Bật cầu dao tự động ngắt mod lỗi
                    saveShield: true         // Bảo vệ file save khi người chơi gỡ mod
                }
            });

            // 3. Tùy biến chính sách bảo mật (Pluggable Policy)
            // Chữ ký hàm chuẩn 3 tham số: (modObj, targetPath, op)
            this.setPolicy("fs", (modObj, targetPath, op) => {
                if (op === "write" || op === "writeFileSync") {
                    const norm = targetPath.replace(/\\/g, "/");
                    return norm.includes("/custom/") || norm.includes("/save/");
                }
                return true;
            });

            // 4. Nhúng Domain API đặc thù của game vào Loader thông qua registerExtension
            this.CustomSystem = {
                registeredPerks: new Map(),
                registerPerk(id, perkData) {
                    console.log(`✨ [CustomSystem] Mod [${modObj ? modObj.id : "Game"}] vừa đăng ký Perk: [${id}] ${perkData.name}`);
                    this.registeredPerks.set(id, perkData);
                }
            };
            this.registerExtension("CustomSystem", this.CustomSystem);
        }

        // 5. Mở rộng vòng đời khởi động (boot) nếu cần
        boot() {
            super.boot();
            console.log("🎮 [MyGameLoader] Bộ nạp mod của trò chơi đã khởi động thành công!");
        }
    }

    // 6. Khởi tạo instance và đồng bộ vào namespace toàn cục
    const loaderInstance = new MyGameLoader();
    if (typeof window !== "undefined") {
        window.MyGameModLoader = MyGameLoader;
        // Gắn đè vào OpenRPGLoader và Forge để các hook giao diện nhận diện instance lớp con
        window.OpenRPGLoader = loaderInstance;
        window.Forge = loaderInstance;
    }
})();
```

---

## 3. Cách Sử Dụng Trong Trò Chơi

Sau khi đăng ký `MyGame_ModLoader.js` vào file `index.html` hoặc nạp qua `js/plugins.js`:

1. **Người dùng thông thường**: Vẫn trải nghiệm giao diện nạp mod tự động với toàn bộ các hàng rào phòng vệ (*Save Shield*, *Circuit Breaker*, *Safe-FS*).
2. **Các modder viết mod cho game của bạn**: Giờ đây có thể gọi trực tiếp API đặc thù qua namespace chuẩn `Forge.ext` hoặc `OpenRPGLoader`:
   ```javascript
   // Trong index.js của một bản mod:
   (() => {
       "use strict";

       const customSystem = Forge.getExtension("CustomSystem") || (window.OpenRPGLoader && window.OpenRPGLoader.CustomSystem);
       if (customSystem) {
           customSystem.registerPerk("vampire_fangs", {
               name: "Nanh Ma Cà Rồng",
               lifesteal: 0.2
           });
       }
   })();
   ```

---

## 4. Tóm Tắt Lợi Ích Của Kiến Trúc Kế Thừa

| Tiêu Chí | Cách Làm Cũ (Sửa Trực Tiếp Core) | Cách Làm Chuẩn (Kế Thừa OpenRPGLoaderCore) |
| :--- | :--- | :--- |
| **Cập nhật lõi upstream** | Cực kỳ đau đầu khi merge code, dễ xung đột | Cập nhật file `OpenRPGLoader.js` gốc là xong |
| **Độ dài mã nguồn** | Phải sao chép hàng ngàn dòng code | Chỉ cần ~35 dòng code kế thừa |
| **Bảo mật & Ổn định** | Dễ vô tình làm hỏng các chốt chặn | Được kế thừa 100% các lớp kiểm thử tự động |

👉 Tiếp tục tìm hiểu sâu hơn về kiến trúc tại:  
[**01. Kiến Trúc Hai Tầng Phong Cách Chromium**](../02_Core_Concepts/01_Two_Tier_Chromium_Architecture.md)
