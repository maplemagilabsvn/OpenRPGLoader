# Hướng Dẫn B3: Cấu Hình Chốt Chặn Tính Năng (Feature Toggles)

> **Dành cho**: Nhà phát triển muốn tinh chỉnh các tính năng cốt lõi (bật/tắt kiểm toán mã độc, chuyển đổi giữa chế độ cảnh báo mềm và chế độ cách ly nghiêm ngặt, vô hiệu hóa Safe-FS khi chạy kiểm thử tự động).

---

## 1. Danh Sách Các Cờ Tính Năng (Feature Flags)

OpenRPGLoader hỗ trợ 9 cờ tính năng độc lập, có thể cấu hình khi khởi tạo (`super({ features: { ... } })`) hoặc thay đổi động tại runtime:

| Tên cờ tính năng | Mặc định | Chức năng kỹ thuật |
| :--- | :---: | :--- |
| `audit` | `true` | Bật/tắt toàn bộ hệ thống phân tích tĩnh mã nguồn |
| `strictQuarantine` | `false` | **Chế độ kiểm duyệt**: `false` = Cảnh báo mềm (Advisory); `true` = Cách ly cưỡng chế nếu điểm thấp |
| `safeFs` | `true` | Kích hoạt hộp cát Safe-FS chống tấn công Path Traversal |
| `circuitBreaker` | `true` | Kích hoạt cầu dao tự động ngắt hook lỗi trong vòng lặp game |
| `dataPatching` | `true` | Kích hoạt bộ vá cơ sở dữ liệu RFC 6902 JSON-Patch |
| `virtualAssets` | `true` | Tự động định tuyến hình ảnh, âm thanh từ thư mục mod |
| `saveShield` | `true` | Tự động khử trùng các định danh mồ côi khi nạp file save |
| `sandbox` | `true` | Chạy mã nguồn mod bên trong Two-Phase Sandbox |
| `auditCache` | `true` | Sử dụng bộ nhớ đệm SHA-256 để tăng tốc độ nạp game (< 1ms) |

---

## 2. Cách Thiết Lập Khi Khởi Tạo

Khi xây dựng bản loader phái sinh cho tựa game:

```javascript
class MyCustomLoader extends OpenRPGLoaderCore {
    constructor() {
        super({
            features: {
                audit: true,
                strictQuarantine: false, // Triết lý mềm dẻo: không chặn oan mod
                safeFs: true,
                circuitBreaker: true,
                saveShield: true
            },
            circuitBreakerLimit: 3 // Ngắt hook nếu bị lỗi 3 lần liên tiếp
        });
    }
}
```

---

## 3. Bật / Tắt Động Tại Runtime

Trong các tình huống đặc biệt (ví dụ: môi trường chạy Unit Test headless hoặc khi quản trị viên bật chế độ gỡ lỗi Developer Debug Mode):

```javascript
// 1. Kiểm tra trạng thái cờ
if (myLoader.isFeatureEnabled("safeFs")) {
    console.log("Safe-FS đang bảo vệ!");
}

// 2. Tạm thời tắt cờ để chạy bài kiểm tra IO cấp thấp
myLoader.toggleFeature("safeFs", false);

// 3. Bật lại sau khi hoàn tất
myLoader.toggleFeature("safeFs", true);
```

---

## 4. Lời Khuyên Về `strictQuarantine`

* **Nên để `false` (Khuyến nghị)**: Đa phần các plugin RPG Maker MZ nổi tiếng (như VisuStella, Yanfly MZ) đều được obfuscate mã hóa để bảo vệ bản quyền tác giả. Nếu bạn bật `strictQuarantine: true`, hệ thống phân tích tĩnh sẽ đánh trượt và giam giữ (quarantine) các mod này, khiến người chơi không dùng được.
* Để `strictQuarantine: false` giúp game thủ vẫn có thể thưởng thức các plugin thương mại, trong khi sự an toàn của game vẫn được bảo đảm bởi cơ chế giám sát thời gian thực **Circuit Breaker**.

---

👉 Xem tiếp:  
[**B4. Nhúng Hệ Thống Nghiệp Vụ Riêng Của Tựa Game Vào Loader**](04_Injecting_Domain_Game_APIs.md)
