# Tra Cứu Kỹ Thuật: API Tầng Lõi `OpenRPGEngine`

> **Lớp cơ sở**: `OpenRPGEngine`  
> **Tệp mã nguồn**: `src/OpenRPGEngine.js`  
> **Phạm vi**: Lõi vô hình (Headless), độc lập engine game, chứa toàn bộ thuật toán, hệ thống Registry, Capability, Tag, IMC và cơ chế phòng vệ.

---

## 1. Cấu Trúc Khởi Tạo (Constructor)

```typescript
new OpenRPGEngine(options?: OpenRPGEngineOptions)
```

### `OpenRPGEngineOptions`:
```typescript
interface OpenRPGEngineOptions {
    gameId?: string;               // Định danh tựa game (Mặc định: "generic_rpg")
    gameVersion?: string;          // Phiên bản trò chơi (Mặc định: "1.0.0")
    gameRoot?: string;             // Đường dẫn gốc thư mục game (Mặc định: ".")
    modsDir?: string;              // Đường dẫn thư mục mod (Mặc định: "mods")
    configFileName?: string;       // Tên file cấu hình tổng (Mặc định: "mods_config.json")
    circuitBreakerLimit?: number;  // Số lần lỗi trước khi ngắt hook (Mặc định: 2, chế độ mở rộng: 5)
    features?: FeatureToggles;     // Bảng cờ tính năng (audit, strictQuarantine, safeFs, circuitBreaker, saveShield...)
    security?: SecurityOptions;    // Cấu hình bảo mật nâng cao
}
```

---

## 2. Quản Lý Vòng Đời & Khởi Động (Lifecycle & Boot)

### `boot(): void`
Khởi động toàn bộ pipeline 7 giai đoạn của OpenRPGEngine (quét thư mục, phân tích tĩnh, sắp xếp Topo sort, nạp tài nguyên ảo, khởi tạo sandbox, tiêm hook và vá cơ sở dữ liệu).

### `discover(): Array<ModObject>`
Quét thư mục `mods/`, phân tích cú pháp các tệp `mod.json` và trả về danh sách đối tượng mod đã được phát hiện.

### `onDatabaseLoaded(callback: Function): void`
Đăng ký hàm callback thực thi ngay sau khi cơ sở dữ liệu 14 bảng MZ được nạp và vá xong bằng RFC 6902 JSON-Patch.
* Nếu database đã sẵn sàng, callback sẽ được gọi ngay lập tức.
* Nếu database chưa sẵn sàng, callback sẽ được xếp vào hàng đợi và thực thi theo thứ tự FIFO.

### `isolateFaultyMod(modId: string, reason?: string): void`
Chủ động đưa một bản mod vào diện cách ly an toàn, tháo gỡ toàn bộ các hook đã đăng ký và chuyển trạng thái sang `disabled` hoặc `error`.

---

## 3. Quản Lý Chính Sách & Tính Năng (Policies & Toggles)

### `setPolicy(type: string, fn: Function): void`
Đăng ký chính sách bảo mật tùy biến cho bản phái sinh.
* **`type`**: `"fs"` | `"permission"` | `"audit"` | `"circuitBreaker"`
* **Chữ ký hàm `fn`**:
  * `"fs"`: `(modObj, targetPath, op) => boolean | null`
  * `"permission"`: `(modObj, permission) => boolean | null`
  * `"audit"`: `(modObj, report) => report`
  * `"circuitBreaker"`: `(hook, error, errorCount, key) => boolean | null`

### `getPolicy(type: string): Function | null`
Lấy hàm chính sách hiện tại đã đăng ký.

### `toggleFeature(name: string, enabled: boolean): void`
Bật hoặc tắt một cờ tính năng tại runtime.

### `isFeatureEnabled(name: string): boolean`
Kiểm tra xem một cờ tính năng có đang được kích hoạt hay không.

---

## 4. Đường Ống Dẫn Hook An Toàn (Safe Hook Pipeline)

### `hook(targetClass: Function, methodName: string, hookFn: Function, modId?: string, priority?: number): void`
Đăng ký một hàm can thiệp an toàn vào một lớp JavaScript.
* **`targetClass`**: Constructor hàm/lớp (ví dụ: `Game_Action`, `BattleManager`).
* **`methodName`**: Tên phương thức thuộc prototype của lớp (ví dụ: `"apply"`).
* **`hookFn`**: Hàm can thiệp có chữ ký: `function(next, ...args)`
  * `this`: Context của đối tượng gọi phương thức gốc.
  * `next(...subArgs)`: Hàm chuyển tiếp thực thi hàm gốc hoặc hook kế tiếp. Nếu gọi `next()`, engine tự động chuyển tiếp toàn bộ tham số đầu vào gốc. Nếu muốn sửa đổi tham số, truyền trực tiếp vào `next(newArg1, newArg2)`.
* **`modId`**: Định danh của mod đăng ký (dùng cho Circuit Breaker cách ly khi có lỗi).
* **`priority`**: Thứ tự ưu tiên (mặc định: `0`, số càng cao chạy càng trước).

---

## 5. Quản Lý Mod & Giải Quyết Đồ Thị (Mod Management & Graph)

### `mods: Array<ModObject>`
Mảng thuộc tính chứa toàn bộ các bản mod đã được phát hiện trong hệ thống.

### `getMod(modId: string): ModObject | null`
Lấy đối tượng thông tin bản mod theo định danh `modId`.

### `activeCount(): number`
Trả về số lượng các bản mod đang ở trạng thái `active`.

### `_sortModsByDependencies(modsList: Array<ModObject>): Array<ModObject>`
Thực thi thuật toán sắp xếp Topo (DFS) trên danh sách mod, phân giải dải phiên bản SemVer và tự động gán trạng thái `error` nếu phát hiện chu trình lặp (Cycle Detection).

---

## 6. Hệ Thống Mở Rộng & Giao Diện (Extensions & UI Adapter)

### `registerExtension(name: string, extObj: Object): void`
Đăng ký một hệ thống nghiệp vụ riêng (Extension) vào engine. Engine sẽ tự động tiêm đối tượng này vào Sandbox của mọi mod dưới tên tương ứng (ví dụ: `sandbox[name] = extObj`).

### `getExtension(name: string): Object | null`
Lấy đối tượng Extension đã đăng ký theo tên.

### `setUIAdapter(adapter: Object): void`
Thiết lập UI Adapter tùy biến để hiển thị thông báo, hộp thoại cảnh báo sự cố thay thế giao diện mặc định.

---

## 7. Hệ Thống Định Danh & Sổ Bộ Đăng Ký (ResourceLocation & Registries)

Hệ sinh thái API chuẩn mực giúp tránh xung đột ID giữa các bản mod:

### `ResourceLocation(modId: string, pathStr: string): string`
Tạo chuỗi định danh namespace chuẩn: `"<modId>:<pathStr>"`.

### `registerItem(itemData: Object, modId?: string): Object`
Đăng ký vật phẩm mới vào `$dataItems`. Tự động cấp phát ID động tiếp theo trong mảng để không đè vào vật phẩm của game gốc hoặc mod khác.

### `registerActor(actorData: Object, modId?: string): Object`
Đăng ký nhân vật mới vào `$dataActors` với ID tự động cấp phát an toàn.

### `getItem(resLocOrId: string | number): Object | null`
Tra cứu dữ liệu vật phẩm theo ID số nguyên hoặc chuỗi `ResourceLocation`.

### `getActor(resLocOrId: string | number): Object | null`
Tra cứu dữ liệu nhân vật theo ID số nguyên hoặc chuỗi `ResourceLocation`.

---

## 8. Hệ Thống Khả Năng & Thẻ Phân Loại (Capability & Tag System)

### `attachCapability(targetObject: Object, capabilityId: string, data: any): void`
Gắn thêm một gói dữ liệu hoặc hành vi động (Capability) vào bất kỳ đối tượng nào trong game (như một vật phẩm, nhân vật hoặc bản đồ).

### `getCapability(targetObject: Object, capabilityId: string): any`
Truy xuất gói dữ liệu Capability đã được gắn vào đối tượng.

### `registerTag(type: string, tagName: string, idOrResLoc: string | number): void`
Đăng ký một định danh vào thẻ phân loại (ví dụ: gán thẻ `"fire_weapons"` cho kiếm lửa).

### `hasTag(type: string, tagName: string, idOrResLoc: string | number): boolean`
Kiểm tra xem một đối tượng hoặc ID có thuộc thẻ phân loại được chỉ định hay không.

---

## 9. Giao Tiếp Giữa Các Bản Mod (Inter-Mod Communication - IMC)

### `sendIMC(targetModId: string, method: string, message: any): boolean`
Gửi thông điệp trực tiếp đến một bản mod đích cụ thể.

### `getIMC(myModId: string, method?: string): Array<Object>`
Lấy danh sách các thông điệp được các mod khác gửi đến cho bản mod hiện tại.

---

## 10. Phòng Vệ & Dữ Liệu Lưu (Security & Save Shield)

### `createSafeFs(modObj: ModObject): SafeFsWrapper`
Khởi tạo đối tượng giả lập `fs` (dựa trên `Object.create(fs)`) được trang bị kiểm tra Path Traversal và ủy quyền qua `fs policy`.

### `auditMod(modObj: ModObject): AuditReport`
Thực thi phân tích tĩnh mã nguồn của mod qua 9 lớp tiêu chuẩn và trả về báo cáo điểm số (`score`: 0–100, `grade`: S/A/B/C/F, `passed`: boolean).

### `sanitizeSaveContents(): void`
Được gọi khi file save vừa nạp vào bộ nhớ. Quét sạch các ID vật phẩm, vũ khí, áo giáp, nhân vật mồ côi trong `$gameParty`, kích hoạt fallback khi đội hình rỗng và phát sự kiện `save:sanitized`.

---

## 11. Sự Kiện Toàn Cục (Event Bus)

`OpenRPGEngine` kế thừa EventEmitter tiêu chuẩn:

| Tên sự kiện | Dữ liệu trả về | Thời điểm phát |
| :--- | :--- | :--- |
| `"mod:discovered"` | `{ mod }` | Khi phát hiện một mod mới trong thư mục |
| `"mod:constructed"` | `{ mod }` | Khi một mod nạp thành công sandbox và chuyển sang `active` |
| `"mod:error"` | `{ mod, error, stage }` | Khi mod bị lỗi tại pha phân tích, biên dịch hoặc thực thi |
| `"config:changed"` | `{ modId, config }` | Khi người chơi bấm Lưu cấu hình trong giao diện tùy chỉnh |
| `"save:sanitized"` | `{ items, weapons, armors, actors }` | Khi Save Shield vừa dọn dẹp dữ liệu mồ côi khi nạp file save |
| `"feature:toggled"` | `{ feature, enabled }` | Khi một cờ tính năng thay đổi trạng thái |

---

👉 Xem tiếp:  
[**03. Tra Cứu API Tầng Mở Rộng MZ OpenRPGLoaderCore & Forge**](03_OpenRPGLoader_Forge_API.md)
