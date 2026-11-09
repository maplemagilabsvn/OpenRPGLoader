# Đặc Tả Kỹ Thuật: Tệp Kê Khai `mod.json` (The Manifest Specification)

> **Mục tiêu**: Từ điển tra cứu chính xác tuyệt đối toàn bộ các trường dữ liệu, kiểu dữ liệu, ràng buộc cú pháp và giá trị mặc định của tệp kê khai `mod.json`.

---

## 1. Cấu Trúc Tổng Quan (Schema Overview)

Tệp `mod.json` bắt buộc phải đặt tại thư mục gốc của bản mod: `mods/<mod_id>/mod.json`.

```json
{
  "id": "my_sample_mod",
  "name": "Bản Mod Mẫu",
  "version": "1.2.0",
  "author": "M.A.P.L.E MAGI Labs",
  "description": "Mô tả tính năng ngắn gọn của bản mod.",
  "main": "index.js",
  "source": "https://github.com/my_repo/my_mod",
  "dependencies": [
    "core_library >= 1.0.0"
  ],
  "conflicts": [
    "incompatible_mod"
  ],
  "permissions": [
    "network:outbound"
  ],
  "strictCircuitBreaker": false,
  "bypassAudit": false
}
```

---

## 2. Bảng Tra Cứu Toàn Bộ Các Trường (Field Reference)

| Trường (Key) | Kiểu Dữ Liệu | Bắt Buộc | Mặc Định | Ràng Buộc & Mô Tả Kỹ Thuật |
| :--- | :---: | :---: | :---: | :--- |
| **`id`** | `String` | **Có** | *Tên thư mục* | Định danh kỹ thuật duy nhất của mod. Regex: `^[a-zA-Z0-9_\-\.]+$`. Không được chứa khoảng trắng hoặc ký tự đặc biệt tiếng Việt. |
| **`name`** | `String` | **Có** | *Tên ID* | Tên hiển thị người dùng nhìn thấy trên giao diện Menu in-game (hỗ trợ UTF-8 đầy đủ). |
| **`version`** | `String` | **Có** | `"1.0.0"` | Phiên bản tuân thủ chuẩn **SemVer 2.0.0** (`X.Y.Z`). Được dùng để giải quyết đồ thị phụ thuộc. |
| **`author`** | `String` | Không | `"N/A"` | Tên tác giả hoặc studio phát triển bản mod. |
| **`description`**| `String` | Không | `""` | Đoạn văn bản tóm tắt tính năng (hiển thị tại bảng chi tiết bên phải menu F8). |
| **`main`** | `String` | Không | `"index.js"` | Tệp điểm vào JavaScript chính (tương đối từ thư mục mod). Nếu mod là Resource Pack thuần thì có thể để trống hoặc bỏ qua. |
| **`source`** | `String` | Không | `"N/A"` | Đường dẫn URL tới trang chủ, diễn đàn hoặc kho mã nguồn phát hành bản mod. |
| **`dependencies`**| `Array<String>`| Không | `[]` | Danh sách các mod bắt buộc phải có kèm dải phiên bản SemVer. Ví dụ: `["core_lib >= 1.0.0", "sound_pack ^2.1.0"]`. |
| **`conflicts`** | `Array<String>`| Không | `[]` | Danh sách ID các mod xung đột trực tiếp. Nếu phát hiện một trong số này đang bật, cả hai sẽ chuyển sang trạng thái `conflict`. |
| **`permissions`**| `Array<String>`| Không | `[]` | Danh sách quyền đặc quyền cần cấp phát (xem mục 4). |
| **`priority`** | `Number \| String`| Không | `0` | Thứ tự ưu tiên nạp và thực thi của mod (số càng lớn độ ưu tiên càng cao). *(Xem lưu ý bên dưới về các chuỗi ưu tiên đã lỗi thời)*. |
| **`strictCircuitBreaker`**| `Boolean`| Không | `false` | Nếu là `true`, mod sẽ bị ngắt hook ngay tại lỗi runtime đầu tiên thay vì chờ đạt ngưỡng giới hạn. |
| **`bypassAudit`**| `Boolean` | Không | `false` | Bỏ qua kiểm định phân tích tĩnh (thường dùng cho các plugin thương mại bị mã hóa như VisuStella). |

> [!NOTE]
> **Quy chuẩn độ ưu tiên (`priority`)**:  
> * **Chuẩn hiện đại (Khuyến nghị)**: Sử dụng số nguyên từ `-10000` đến `10000` hoặc các cờ ưu tiên định sẵn: `CRITICAL` (10000), `HIGHEST` (1000), `HIGH` (500), `NORMAL` (0), `LOW` (-500), `LOWEST` (-1000), `MINIMAL` (-10000).  
> * **[ĐÃ LỖI THỜI]**: Cách khai báo chỉ dựa vào 3 chuỗi cố định `"HIGH"`, `"NORMAL"`, `"LOW"` không hỗ trợ mở rộng. Các bản mod mới nên dùng hệ thống số nguyên hoặc các cờ mở rộng.

---

## 3. Cú Pháp Dải Phiên Bản Phụ Thuộc (SemVer Ranges)

Trong trường `dependencies`, bạn có thể chỉ định phiên bản theo các toán tử so sánh sau:

| Cú pháp mẫu | Ý nghĩa kỹ thuật |
| :--- | :--- |
| `"core_lib"` | Chấp nhận bất kỳ phiên bản nào của `core_lib` |
| `"core_lib >= 1.2.0"` | Yêu cầu phiên bản 1.2.0 trở lên |
| `"core_lib > 2.0.0"` | Yêu cầu phiên bản lớn hơn 2.0.0 |
| `"core_lib <= 1.5.0"` | Yêu cầu phiên bản nhỏ hơn hoặc bằng 1.5.0 |
| `"core_lib = 1.0.4"` | Yêu cầu chính xác tuyệt đối phiên bản 1.0.4 |
| `"core_lib ^1.2.0"` | Tương thích ngược: chấp nhận `>= 1.2.0` và `< 2.0.0` (cùng Major) |
| `"core_lib ~1.2.0"` | Bản vá: chấp nhận `>= 1.2.0` và `< 1.3.0` (cùng Minor) |

---

## 4. Danh Mục Quyền Hạn Hạt Nhân (Granular Permissions)

Mặc định, mã nguồn mod chạy trong môi trường bị cô lập bảo vệ bởi Safe-FS Sandbox. Nếu mod cần thực hiện các thao tác hệ thống nâng cao, modder phải khai báo tường minh trong mảng `permissions`:

| Tên Quyền Hạn | Rủi Ro | Trạng Thái Cơ Chế Cấp Quyền | Mô Tả Quyền Kỹ Thuật Được Mở Khóa |
| :--- | :---: | :---: | :--- |
| `network:outbound` | Thấp | Tự động hoặc qua Policy | Cho phép tạo kết nối HTTP/HTTPS ra ngoài Internet (Fetch, XMLHttpRequest, WebSocket). |
| `filesystem:unrestricted` | Cao | **Bắt buộc người dùng xác nhận** | Bỏ qua Safe-FS Sandbox, cho phép đọc/ghi/xóa tệp tự do trên toàn bộ ổ đĩa máy tính. |
| `child_process:exec` | Cực cao | **Bắt buộc người dùng xác nhận** | Cho phép thực thi lệnh dòng lệnh hệ điều hành thông qua `child_process.exec` / `spawn`. |
| `system:control` | Cao | **Bắt buộc người dùng xác nhận** | Cho phép gọi `process.exit()`, can thiệp tiến trình hoặc khởi động lại trò chơi. |
| `*` (Wildcard) | Cực cao | **Bắt buộc người dùng xác nhận** | Cấp toàn bộ các quyền trên hệ thống (không khuyến nghị). |

> [!WARNING]
> **Thay đổi cơ chế cấp quyền nguy hiểm (Dangerous Permission Prompts)**:  
> * **[ĐÃ LỖI THỜI]**: Cơ chế tự động cấp toàn quyền ngay khi mod khai báo trong `permissions` mà không cần người dùng xác nhận đã bị **bãi bỏ hoàn toàn** vì rủi ro bảo mật.  
> * **Chuẩn hiện đại (v1.1.0+)**: Bất cứ khi nào một bản mod yêu cầu quyền nguy hiểm (`child_process:exec`, `filesystem:unrestricted`, `system:control`, `*`), hệ thống sẽ tự động bật hộp thoại cảnh báo song ngữ yêu cầu người chơi đồng ý (`window.confirm` trên UI hoặc hook chính sách `policies.permissionPrompt`). Nếu người chơi bấm "Hủy / Từ chối", quyền sẽ bị thu hồi và hàm liên quan sẽ ném ngoại lệ an toàn.

---

## 5. Quy Chuẩn Kiểm Tra Cú Pháp Nghiêm Ngặt (Strict Syntax Rules)

* **[ĐÃ LỖI THỜI]**: Các cơ chế tha thứ lỗi cú pháp (Lenient Parsing), tự sửa dấu phẩy thừa (Auto-fix trailing commas) hoặc tự động nắn chỉnh định dạng JSON/JS đã **bị loại bỏ hoàn toàn**.
* **Chuẩn hiện đại (Strict Syntax Enforcement)**:
  - Tệp `mod.json` bắt buộc phải là định dạng JSON hợp lệ 100% theo tiêu chuẩn ECMA-404 (tuyệt đối không chứa comment dạng `//` hay dấu phẩy thừa ở cuối mảng/object).
  - Tệp script `main` (ví dụ `index.js`) được quét cú pháp tĩnh bằng `new Function(...)` hoặc bộ phân tích AST trước khi khởi chạy.
  - Bất kỳ lỗi cú pháp nào dù là nhỏ nhất sẽ khiến mod bị đánh dấu `status: "error"` ngay lập tức, bị cô lập hoàn toàn và từ chối nạp vào trò chơi nhằm bảo vệ an toàn cho tiến trình game.

---

👉 Xem tiếp:  
[**02. Tra Cứu API Tầng Lõi OpenRPGEngine**](02_OpenRPGEngine_API.md)
