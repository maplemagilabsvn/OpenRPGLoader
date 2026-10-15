# Hướng Dẫn B4: Nhúng Hệ Thống Nghiệp Vụ Riêng Của Tựa Game Vào Loader

> **Dành cho**: Studio game muốn cung cấp các API đặc thù của dự án (như Hệ thống Thế Khiên, Hệ thống Nấu ăn, Hệ thống Danh tiếng Livestream, Hệ thống Hacking Cyberpunk) trực tiếp vào môi trường modding.

---

## 1. Tại Sao Lại Nhúng Vào Loader Thay Vì Viết Plugin Rời?

Khi nhúng API vào lớp Loader phái sinh:
* Toàn bộ các mod nạp vào game đều có thể truy cập các hệ thống này qua `window.MyLoader.<TênHệThống>` hoặc đối tượng Sandbox.
* Các hệ thống nghiệp vụ của game được kế thừa cơ chế kiểm soát lỗi và quản lý vòng đời từ `OpenRPGEngine`.

---

## 2. Ví Dụ Cụ Thể: Tựa Game RPG Chiến Thuật Giả Tưởng

Giả sử trong tựa game RPG của bạn, người chơi có hệ thống Trang bị Thần khí và Hệ thống Nguyên tố (ElementalSystem). Ta nhúng hai hệ thống này trực tiếp vào `FantasyCombatLoader`:

```javascript
class FantasyCombatLoader extends BaseLoader {
    constructor() {
        super({ name: "FantasyCombatLoader", version: "2.1.0" });

        // 1. Nhúng Hệ thống Quản lý Thần Khí Tùy Chỉnh (ArtifactSystem)
        this.ArtifactSystem = {
            _artifacts: new Map(),

            registerArtifact(id, config) {
                console.log(`🗡️ [ArtifactSystem] Đã đăng ký thần khí mới: [${id}] ${config.name}`);
                this._artifacts.set(id, {
                    id,
                    name: config.name || id,
                    power: config.power || 10,
                    element: config.element || "Fire",
                    specialEffect: config.specialEffect || null
                });
            },

            getArtifact(id) {
                return this._artifacts.get(id);
            },

            getAllArtifacts() {
                return Array.from(this._artifacts.values());
            }
        };

        // 2. Nhúng Hệ thống Nguyên Tố Chiến Đấu (ElementalSystem)
        this.ElementalSystem = {
            activeAffinity: "Fire",
            elements: ["Fire", "Ice", "Lightning", "Wind", "Dark", "Holy"],

            setAffinity(newElement) {
                if (this.elements.includes(newElement)) {
                    this.activeAffinity = newElement;
                    console.log(`✨ [ElementalSystem] Chuyển nguyên tố chủ đạo sang: ${newElement}`);
                }
            }
        };
    }
}
```

---

## 3. Cách Modder Sử Dụng API Nghiệp Vụ Này

Bất kỳ modder nào viết mod cho tựa game này chỉ cần gọi trực tiếp:

```javascript
// Trong index.js của một bản mod vũ khí:
(() => {
    "use strict";

    if (window.MyGameLoader && window.MyGameLoader.ArtifactSystem) {
        // Đăng ký Thần Kiếm Rồng Lửa vào hệ thống của game!
        window.MyGameLoader.ArtifactSystem.registerArtifact("dragon_fire_blade", {
            name: "Hắc Long Diệt Ma Kiếm",
            power: 85,
            element: "Fire",
            specialEffect: "BurnAttacker"
        });

        console.log("Đã kích hoạt Thần Kiếm Dung Nham!");
    }
})();
```

---

## 4. Tự Động Truyền Vào Sandbox Khi Khởi Chạy Mod

Để các mod có thể gọi trực tiếp biến (như `Artifacts.registerArtifact(...)`) bên trong Sandbox mà không cần thông qua `window`, bạn có 2 cách thực hiện:

### Cách 1: Sử Dụng `registerExtension` (Khuyên Dùng - Chuẩn Mực Nhất)

Trong hàm khởi tạo `constructor()` của bộ nạp phái sinh, bạn chỉ cần gọi `registerExtension`:

```javascript
class FantasyCombatLoader extends BaseLoader {
    constructor() {
        super({ gameId: "fantasy_rpg", gameVersion: "1.0.0" });

        // Khởi tạo các hệ thống nghiệp vụ
        this.ArtifactSystem = { /* ... */ };
        this.ElementalSystem = { /* ... */ };

        // Đăng ký Extension vào Engine:
        // Engine sẽ tự động nhúng vào sandbox của mọi mod dưới tên tương ứng!
        this.registerExtension("Artifacts", this.ArtifactSystem);
        this.registerExtension("Elements", this.ElementalSystem);
    }
}
```

### Cách 2: Ghi Đè (Override) Phương Thức `createSandbox`

Nếu bạn muốn tùy biến sâu hơn theo từng mod cụ thể, lưu ý rằng `createSandbox(modObj)` trong `OpenRPGEngine` trả về một đối tượng gồm hai thành phần `{ sandbox, staged }`. Bạn bắt buộc phải bóc tách (destructuring) và trả về đầy đủ cả hai:

```javascript
class FantasyCombatLoader extends BaseLoader {
    createSandbox(modObj) {
        // 1. Lấy cả sandbox và staged từ lớp cha
        const { sandbox, staged } = super.createSandbox(modObj);

        // 2. Gắn thêm các hệ thống nghiệp vụ vào sandbox của mod
        sandbox.Artifacts = this.ArtifactSystem;
        sandbox.Elements = this.ElementalSystem;

        // 3. BẮT BUỘC trả về đầy đủ đối tượng { sandbox, staged }
        return { sandbox, staged };
    }
}
```
*Giờ đây, bên trong `index.js`, modder chỉ cần viết: `Artifacts.registerArtifact(...)` cực kỳ ngắn gọn và an toàn!*

---

👉 Bước tiếp theo:  
[**B5. Xây Dựng Trình Cài Đặt Bộ Nạp Tự Động (Installer / Setup Wizard)**](05_Building_Installer_And_Setup.md)
