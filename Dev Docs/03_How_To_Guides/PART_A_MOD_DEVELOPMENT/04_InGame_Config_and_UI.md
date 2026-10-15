# Hướng Dẫn A4: Đăng Ký Menu Cấu Hình In-Game & Hiển Thị Thông Báo Toast

> **Bài toán**: Bạn muốn người chơi có thể bật/tắt các tùy chọn của bản mod (ví dụ: "Bật chế độ khó", "Chỉnh tỉ lệ rơi đồ x2", "Bật phụ đề tiếng Việt") trực tiếp trong giao diện game mà **không cần chỉnh sửa file text bên ngoài**.

---

## 1. Đăng Ký Cấu Hình Qua `Forge.registerConfig`

OpenRPGLoader hỗ trợ tự động tạo giao diện cấu hình tương tác (`Scene_ModConfig`) trong menu F8.

Bên trong `index.js` của mod, bạn đăng ký một bảng định nghĩa cấu hình:

```javascript
(() => {
    "use strict";

    // 1. Đăng ký các tùy chọn cấu hình
    Forge.registerConfig("my_custom_mod", {
        name: "Cấu Hình Mod Tùy Biến",
        options: [
            {
                key: "enableHardMode",
                name: "Chế Độ Siêu Khó",
                type: "boolean",
                default: false,
                desc: "Tăng gấp đôi máu và công của toàn bộ quái vật."
            },
            {
                key: "dropRateMultiplier",
                name: "Hệ Số Rơi Tiền",
                type: "select",
                options: [1, 2, 5, 10],
                default: 1,
                desc: "Nhân số tiền vàng nhận được sau mỗi trận đấu."
            },
            {
                key: "customTitle",
                name: "Tiêu Đề Tùy Chỉnh",
                type: "string",
                default: "Chiến Binh Huyền Thoại",
                desc: "Danh hiệu hiển thị trên thanh trạng thái."
            }
        ]
    });

    // 2. Đọc giá trị cấu hình mà người chơi đã lưu
    function applyCurrentConfig() {
        const config = Forge.loadModConfigValues("my_custom_mod");
        
        if (config.enableHardMode) {
            Forge.log("⚔️ [Mod] Chế độ siêu khó đang BẬT!");
        }
        Forge.log(`💰 [Mod] Hệ số rơi tiền: x${config.dropRateMultiplier}`);
    }

    // 1. Áp dụng ngay khi người chơi bấm Lưu cấu hình trong Menu F8
    Forge.on("config:changed", (data) => {
        if (data.modId === "my_custom_mod") {
            Forge.log("⚡ Cấu hình mod vừa được cập nhật thời gian thực!");
            applyCurrentConfig();
        }
    });

    // 2. Lắng nghe khi vào bản đồ để áp dụng
    Forge.on("mapLoaded", () => {
        applyCurrentConfig();
    });
})();
```

---

## 2. Hiển Thị Thông Báo Nổi (In-Game Toast Notifications)

Thay vì dùng lệnh `alert()` gây đóng băng game, OpenRPGLoader cung cấp cơ chế Toast thông báo mượt mà hiển thị ở góc trên màn hình:

```javascript
// Cú pháp:
// Forge.showInGameToast(message, type, durationMs)

// 1. Thông báo thông tin thông thường (Màu xanh biển, hiển thị 3 giây)
Forge.showInGameToast("Đã nhặt được vật phẩm sự kiện!", "info", 3000);

// 2. Thông báo thành công (Màu xanh lá)
Forge.showInGameToast("Nhiệm vụ mod đã hoàn thành!", "success", 4000);

// 3. Thông báo cảnh báo (Màu vàng cam)
Forge.showInGameToast("Khu vực nguy hiểm! Hãy cẩn thận!", "warning", 5000);

// 4. Thông báo lỗi (Màu đỏ)
Forge.showInGameToast("Không đủ năng lượng ma thuật!", "error", 4000);
```

---

## 3. Trải Nghiệm Của Người Chơi

1. Người chơi nhấn **`F8`** để mở danh sách Mod.
2. Chọn bản mod của bạn và bấm nút **"Cấu hình" (Config)** ở thanh công cụ dưới đáy màn hình.
3. Cửa sổ `Scene_ModConfig` sẽ tự động hiển thị danh sách các mục:
   * Chế độ siêu khó: `[BẬT / TẮT]` (Bấm Enter để đổi).
   * Hệ số rơi tiền: `[1 / 2 / 5 / 10]` (Bấm mũi tên trái/phải để chọn).
   * Tiêu đề: Nhấp để nhập chuỗi ký tự trực tiếp.
4. Bấm ESC để lưu và quay lại game. Các giá trị cấu hình được tự động lưu vào tệp `mods/<mod_id>/config.json`.

---

👉 Xem tiếp:  
[**A5. Giao Tiếp Giữa Các Bản Mod & Khai Báo Phụ Thuộc**](05_Inter_Mod_Communication.md)
