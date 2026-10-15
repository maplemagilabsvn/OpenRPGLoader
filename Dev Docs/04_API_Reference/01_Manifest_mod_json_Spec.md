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
| **`strictCircuitBreaker`**| `Boolean`| Không | `false` | Nếu là `true`, mod sẽ bị ngắt hook ngay tại lỗi runtime đầu tiên thay vì chờ đạt ngưỡng giới hạn. |
| **`bypassAudit`**| `Boolean` | Không | `false` | Bỏ qua kiểm định phân tích tĩnh (thường dùng cho các plugin thương mại bị mã hóa như VisuStella). |

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

| Tên Quyền Hạn | Rủi Ro | Mô Tả Quyền Kỹ Thuật Được Mở Khóa |
| :--- | :---: | :--- |
| `network:outbound` | Thấp | Cho phép tạo kết nối HTTP/HTTPS ra ngoài Internet (Fetch, XMLHttpRequest, WebSocket). |
| `filesystem:unrestricted` | Cao | Bỏ qua Safe-FS Sandbox, cho phép ghi/xóa tệp tự do trên toàn bộ ổ đĩa máy tính. |
| `child_process:exec` | Cực cao | Cho phép thực thi lệnh dòng lệnh hệ điều hành thông qua `child_process.exec` / `spawn`. |
| `system:control` | Cao | Cho phép gọi `process.exit()`, can thiệp tiến trình hoặc khởi động lại trò chơi. |

> [!CAUTION]
> Các quyền như `filesystem:unrestricted` và `child_process:exec` có rủi ro bảo mật cực cao. Hệ thống kiểm định tĩnh sẽ tự động trừ điểm uy tín nếu phát hiện các quyền này. Chỉ sử dụng khi thật sự cần thiết!

---

👉 Xem tiếp:  
[**02. Tra Cứu API Tầng Lõi OpenRPGEngine**](02_OpenRPGEngine_API.md)
