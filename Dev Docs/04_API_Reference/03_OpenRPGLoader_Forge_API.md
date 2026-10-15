# Tra Cứu Kỹ Thuật: API Tầng Mở Rộng MZ `OpenRPGLoaderCore` & `Forge`

> **Lớp mở rộng**: `OpenRPGLoaderCore extends OpenRPGEngine`  
> **Instance toàn cục**: `window.OpenRPGLoader` / `window.Forge`  
> **Tệp mã nguồn**: `src/OpenRPGLoader.js`  
> **Phạm vi**: Toàn bộ giao diện tương tác RPG Maker MZ, hệ thống tài nguyên ảo, vá cơ sở dữ liệu và quản lý cấu hình in-game.

---

## 1. Định Tuyến Tài Nguyên Ảo (Virtual Assets)

### `resolveAsset(relativeUrl: string): string | null`
Được gọi tự động bởi các hook của `ImageManager` và `AudioManager`.
* **Tham số**: `relativeUrl` (ví dụ: `"img/characters/Actor1.png"`).
* **Trả về**: Đường dẫn tuyệt đối tới tệp tài nguyên của mod nếu tồn tại, hoặc `null` để game tiếp tục nạp tệp gốc.

---

## 2. Vá Dữ Liệu Tự Động (RFC 6902 JSON-Patch)

### `applyDataPatches(): void`
Tự động kích hoạt khi `DataManager.isDatabaseLoaded()` hoàn tất.
* Quét toàn bộ thư mục `data/*.patch.json` của tất cả mod đang ở trạng thái `active`.
* Áp dụng các phép biến đổi trực tiếp vào 14 bảng dữ liệu MZ toàn cục:
  * `$dataItems`, `$dataWeapons`, `$dataArmors`, `$dataSkills`, `$dataActors`
  * `$dataClasses`, `$dataEnemies`, `$dataTroops`, `$dataStates`, `$dataAnimations`
  * `$dataTilesets`, `$dataCommonEvents`, `$dataSystem`, `$dataMapInfos` / `$dataMap`

---

## 3. Hệ Thống Cấu Hình In-Game (Mod Configuration)

### `registerConfig(modId: string, configDef: ModConfigDefinition): void`
Đăng ký bảng định nghĩa các tùy chọn cấu hình cho bản mod để hiển thị trên `Scene_ModConfig`.

```typescript
interface ModConfigDefinition {
    name: string;
    options: Array<ModConfigOption>;
}

interface ModConfigOption {
    key: string;                                          // Khóa định danh trường
    name: string;                                         // Tên hiển thị tiếng Việt
    type: "boolean" | "number" | "string" | "select";     // Kiểu dữ liệu nhập liệu
    default: any;                                         // Giá trị mặc định
    desc?: string;                                        // Đoạn văn bản chú thích
    options?: Array<any>;                                 // Mảng lựa chọn nếu type = "select"
    min?: number;                                         // Giá trị tối thiểu nếu type = "number"
    max?: number;                                         // Giá trị tối đa nếu type = "number"
}
```

### `loadModConfigValues(modId: string): Record<string, any>`
Đọc các giá trị cấu hình hiện tại của mod từ bộ nhớ hoặc tệp lưu `mods/<mod_id>/config.json`.

### `saveModConfigValues(modId: string, values: Record<string, any>): void`
Lưu đĩa các giá trị cấu hình mới của bản mod.

---

## 4. Giao Diện Thông Báo Nổi (In-Game Toast Notifications)

### `showInGameToast(message: string, type?: ToastType, durationMs?: number): void`
Hiển thị một khung thông báo nổi dạng slide-in ở góc trên màn hình trò chơi.
* **`message`**: Nội dung thông báo hiển thị (hỗ trợ tiếng Việt UTF-8).
* **`type`**: `"info"` (mặc định - xanh biển) | `"success"` (xanh lá) | `"warning"` (vàng cam) | `"error"` (đỏ).
* **`durationMs`**: Thời gian hiển thị tính bằng mili-giây (mặc định: `3500ms`).

---

## 5. Các Lớp Cửa Sổ & Màn Hình RPG Maker MZ (Scene & Window Classes)

Khi cần can thiệp hoặc kế thừa giao diện của OpenRPGLoader:

| Tên Lớp | Kế Thừa Từ | Mục Đích |
| :--- | :--- | :--- |
| `Scene_Mods` | `Scene_MenuBase` | Màn hình chính quản lý danh sách mod (mở bằng F8 hoặc menu chính) |
| `Scene_ModConfig` | `Scene_MenuBase` | Màn hình điều chỉnh các tùy chọn cấu hình của một bản mod cụ thể |
| `Window_OpenRpgModList` | `Window_Selectable` | Cửa sổ danh sách mod (hiển thị trạng thái, tên, phiên bản và huy hiệu kiểm định) |
| `Window_OpenRpgModDetails` | `Window_Base` | Cửa sổ hiển thị thông tin chi tiết, tác giả, mô tả, quyền hạn của mod được chọn |
| `Window_OpenRpgBottomBar` | `Window_HorzCommand` | Thanh công cụ dưới đáy (nút Bật/Tắt, Cấu hình, Đóng) |
| `Window_OpenRpgModConfigList`| `Window_Command` | Cửa sổ danh sách các mục thiết lập cấu hình tương tác |

---

<p align="center">
  <b>M.A.P.L.E MAGI Labs</b> • <i>OpenRPGLoader Technical Reference</i>
</p>
