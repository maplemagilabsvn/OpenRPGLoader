# Hướng Dẫn A5: Giao Tiếp Giữa Các Bản Mod & Khai Báo Phụ Thuộc (Inter-Mod API)

> **Bài toán**: Bạn đang phát triển một bản mod lớn (như Hệ thống Nhiệm Vụ) và muốn cung cấp API cho các modder khác sử dụng; hoặc mod của bạn cần gọi tính năng từ một mod thư viện chung (Core Library).

---

## 1. Khai Báo Phụ Thuộc Trong `mod.json`

OpenRPGLoader hỗ trợ giải quyết phụ thuộc theo chuẩn quốc tế **SemVer 2.0.0**:

```json
{
  "id": "my_quest_expansion",
  "name": "Gói Nhiệm Vụ Mở Rộng",
  "version": "1.0.0",
  "dependencies": [
    "core_library >= 1.2.0",
    "custom_audio_pack ^2.0.0"
  ]
}
```

* **`core_library >= 1.2.0`**: Yêu cầu mod `core_library` phải được cài đặt với phiên bản từ 1.2.0 trở lên.
* **Thứ tự nạp tự động**: Nhờ thuật toán Topo Sort, OpenRPGLoader đảm bảo `core_library` luôn được nạp và khởi chạy trước `my_quest_expansion`.

---

## 2. Xuất Dữ Liệu & Hàm Dùng Chung (`module.exports`)

Trong mod thư viện (ví dụ `core_library/index.js`), bạn xuất các hàm thông qua `module.exports`:

```javascript
// core_library/index.js:
(() => {
    "use strict";

    const QuestRegistry = {
        quests: new Map(),
        
        registerQuest(id, questData) {
            Forge.log(`📜 [CoreLibrary] Đã đăng ký nhiệm vụ: [${id}] - ${questData.title}`);
            this.quests.set(id, questData);
        },
        
        getQuest(id) {
            return this.quests.get(id);
        }
    };

    // Xuất ra ngoài cho các mod khác gọi
    if (typeof module !== "undefined" && module.exports) {
        module.exports = QuestRegistry;
    }
})();
```

---

## 3. Gọi API Của Mod Khác Từ Mod Của Bạn

Trong mod mở rộng (`my_quest_expansion/index.js`), bạn lấy đối tượng đã xuất của mod thư viện thông qua `Forge.getMod(modId)`:

```javascript
// my_quest_expansion/index.js:
(() => {
    "use strict";

    // 1. Lấy thông tin mod thư viện
    const coreMod = Forge.getMod("core_library");

    if (coreMod && coreMod.status === "active" && coreMod.exports) {
        const QuestSystem = coreMod.exports;

        // 2. Gọi hàm do mod thư viện cung cấp!
        QuestSystem.registerQuest("quest_dragon_slayer", {
            title: "Tiêu Diệt Rồng Lửa",
            rewardGold: 5000,
            requiredLevel: 25
        });

        Forge.showInGameToast("Đã nạp gói nhiệm vụ Diệt Rồng!", "success");
    } else {
        Forge.warn("[MyQuest] Không tìm thấy hoặc core_library chưa được kích hoạt!");
    }
})();
```

---

## 4. Giao Tiếp Bằng Sự Kiện (Event Bus)

Nếu hai mod không muốn phụ thuộc cứng vào nhau, bạn có thể truyền nhận thông điệp lỏng lẻo (loose coupling) qua hệ thống Event Bus của Forge:

```javascript
// Mod A (Phát sự kiện khi người chơi mở hòm báu):
Forge.emit("custom:chestOpened", { chestId: 102, reward: "Bình Siêu Máu" });

// Mod B (Lắng nghe sự kiện từ Mod A):
Forge.on("custom:chestOpened", (data) => {
    Forge.showInGameToast(`Mod B ghi nhận: Hòm #${data.chestId} vừa mở!`, "info");
});
```

---

👉 Chuyển sang phần dành cho nhà phát triển biến thể Loader:  
[**B1. Kế Thừa & Tạo Bản Phân Phối Loader Mới**](../PART_B_DERIVATIVE_LOADERS/01_Subclassing_OpenRPGLoaderCore.md)
