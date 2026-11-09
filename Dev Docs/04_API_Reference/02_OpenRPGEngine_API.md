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

### `setSecurityPolicy(fn: Function): void` ⭐ *(Khuyến nghị - Chuẩn hiện đại v1.1.0+)*
Thiết lập một **Chính Sách Bảo Mật Trung Tâm (Master Security Policy)** duy nhất nhằm kiểm soát và ghi đè toàn quyền mọi quyết định an ninh trên toàn hệ thống.
* **Chữ ký hàm `fn`**: `(action: string, target: any, context?: any, details?: any) => boolean | null`
  * `action === "permission"`: Quyết định cấp hay từ chối quyền của mod (`target` là đối tượng mod, `context` là tên quyền hạn).
  * `action === "fs"`: Quyết định quyền truy cập hệ thống tệp tin (`target` là đối tượng mod, `context` là đường dẫn tệp tin, `details.op` là loại thao tác đọc/ghi).
  * `action === "circuitBreaker"`: Quyết định ngắt hook mod khi có ngoại lệ (`target` là đối tượng mod vi phạm, `context` là pipelineKey, `details` chứa đối tượng hook và số lỗi).
  * `action === "prompt"`: Xử lý hỏi người dùng khi mod đòi quyền nguy hiểm.
  * *Trả về*: `true` (Cho phép/Ngắt), `false` (Chặn/Không ngắt), `null/undefined` (Chuyển quyền cho bộ xử lý mặc định).

### `setPolicy(type: string, fn: Function): void` ⚠️ *[ĐÃ LỖI THỜI / LEGACY - Vẫn hỗ trợ để tương thích ngược]*
Đăng ký chính sách bảo mật lẻ tẻ theo từng loại chốt chặn riêng biệt.
> [!NOTE]
> Cách đăng ký từng policy riêng rẽ này **đã lỗi thời**. Các dự án mới được khuyến nghị chuyển sang sử dụng `setSecurityPolicy(fn)` để tập trung toàn bộ logic an ninh tại một đầu mối duy nhất.
* **`type`**: `"fs"` | `"permission"` | `"audit"` | `"circuitBreaker"` | `"permissionPrompt"`
* **Chữ ký hàm `fn`**:
  * `"fs"`: `(modObj, targetPath, op) => boolean | null`
  * `"permission"`: `(modObj, permission) => boolean | null`
  * `"permissionPrompt"`: `(modObj, permission) => boolean` *(Bật hộp thoại hỏi người dùng khi mod đòi quyền nguy hiểm)*
  * `"audit"`: `(modObj, report) => report`
  * `"circuitBreaker"`: `(hook, error, errorCount, key) => boolean | null`

### `getPolicy(type: string): Function | null`
Lấy hàm chính sách hiện tại đã đăng ký.

### `toggleFeature(name: string, enabled: boolean): void`
Bật hoặc tắt một cờ tính năng tại runtime.

### `isFeatureEnabled(name: string): boolean`
Kiểm tra xem một cờ tính năng có đang được kích hoạt hay không.

---

## 4. Hệ Thống Độ Ưu Tiên (Priority Management)

### `setPriorityFlags(flags: Record<string, number>): void`
Đăng ký hoặc mở rộng bảng ánh xạ cờ hiệu ưu tiên tùy biến cho tựa game.
* Mặc định hỗ trợ:
  * `CRITICAL`: `10000`
  * `HIGHEST`: `1000`
  * `HIGH`: `500`
  * `NORMAL`: `0`
  * `LOW`: `-500`
  * `LOWEST`: `-1000`
  * `MINIMAL`: `-10000`

### `resolvePriority(priorityVal: any): number`
Chuyển đổi một giá trị ưu tiên (số nguyên, chuỗi định danh cờ, hoặc object mang thuộc tính `priority`) thành một số nguyên chính xác.

### `setPriorityComparator(fn: (a: any, b: any, context?: string) => number): void`
Cho phép nhà phát triển viết lại hoàn toàn thuật toán so sánh độ ưu tiên giữa hai đối tượng mod hoặc hook.
* **[ĐÃ LỖI THỜI]**: Thuật toán so sánh cũ dựa trên chuỗi cứng `"HIGH"`, `"NORMAL"`, `"LOW"` không còn được khuyến nghị. Hãy sử dụng hàm so sánh số nguyên hoặc comparator tùy biến.

### `comparePriorities(a: any, b: any, context?: string): number`
Thực hiện so sánh độ ưu tiên giữa hai đối tượng `a` và `b` theo comparator đã đăng ký.

---

## 5. Đường Ống Dẫn Hook An Toàn (Safe Hook Pipeline)

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

## 11. Phòng Vệ, Phân Quyền & Dữ Liệu Lưu (Security, Permissions & Save Shield)

### `createSafeFs(modObj: ModObject): SafeFsWrapper`
Khởi tạo đối tượng giả lập `fs` (dựa trên `Object.create(fs)`) được trang bị kiểm tra Path Traversal, Null-Byte Poison và ủy quyền qua Security Policy.
* **Chuẩn hiện đại (v1.1.0+)**: Bọc và kiểm soát toàn diện cả **THAO TÁC ĐỌC** (`readFileSync`, `readFile`, `createReadStream`, `readdir`, `readlink`, `open`, `openSync`) lẫn **THAO TÁC GHI/XÓA** (`writeFileSync`, `writeFile`, `mkdir`, `unlink`, `rm`, `copyFile`...). Mod bị chặn đọc trộm bất kỳ file nào ngoài thư mục sandbox của nó trừ khi được cấp quyền `filesystem:unrestricted`.
* **[ĐÃ LỖI THỜI]**: Cơ chế cũ (v1.0.0) chỉ chặn thao tác ghi (Write-Only Interception) và để lọt thao tác đọc đã bị bãi bỏ do tiềm ẩn rủi ro lộ mã nguồn và file save.

### `grantPermission(modId: string, permission: string): void`
Cấp phát động một quyền hạn cho một bản mod tại runtime và ghi nhận vào cache quyền hạn.

### `revokePermission(modId: string, permission: string): void`
Thu hồi một quyền hạn đã cấp cho bản mod tại runtime.

### `hasPermission(modObj: ModObject, permission: string): boolean`
Kiểm tra xem bản mod có quyền được chỉ định hay không (tự động kích hoạt Dangerous Permission Prompt nếu gặp quyền nguy hiểm và chưa có chính sách cho phép trước đó).

### `auditMod(modObj: ModObject): AuditReport`
Thực thi phân tích tĩnh mã nguồn của mod qua 9 lớp tiêu chuẩn và trả về báo cáo điểm số (`score`: 0–100, `grade`: S/A/B/C/F, `passed`: boolean).

### `sanitizeSaveContents(): void`
Được gọi khi file save vừa nạp vào bộ nhớ. Quét sạch các ID vật phẩm, vũ khí, áo giáp, nhân vật mồ côi trong `$gameParty`, kích hoạt fallback khi đội hình rỗng và phát sự kiện `save:sanitized`.

---

## 12. Sự Kiện Toàn Cục (Event Bus)

`OpenRPGEngine` tích hợp Event Bus mạnh mẽ với thứ tự ưu tiên:

### Các phương thức:
* **`on(event: string, callback: Function, priority: number = 0): void`**: Đăng ký lắng nghe sự kiện kèm độ ưu tiên.
* **`once(event: string, callback: Function, priority: number = 0): void`**: Đăng ký lắng nghe sự kiện và tự động hủy sau lần kích hoạt đầu tiên.  
  *(**[ĐÃ LỖI THỜI]**: Kỹ thuật tự tạo biến cờ `let executed = false` bên trong `engine.on(...)` để chạy một lần đã lỗi thời và không còn cần thiết)*.
* **`off(event: string, callback: Function): void`**: Hủy đăng ký callback đã gắn vào sự kiện.
* **`emit(event: string, ...args: any[]): void`**: Kích hoạt sự kiện và gọi toàn bộ callback theo thứ tự ưu tiên giảm dần.

### Bảng sự kiện hệ thống:

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
