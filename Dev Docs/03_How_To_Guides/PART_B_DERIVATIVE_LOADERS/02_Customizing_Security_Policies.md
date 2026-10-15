# Hướng Dẫn B2: Tùy Biến Chính Sách Bảo Mật (Pluggable Policy APIs)

> **Dành cho**: Studio game muốn thắt chặt hoặc nới lỏng các chốt chặn an ninh kỹ thuật (quyền ghi tệp tin, cấp quyền hệ điều hành, tiêu chí kiểm định mã độc) phù hợp với bối cảnh của tựa game.

---

## 1. Cơ Chế Pluggable Policy Là Gì?

Thay vì ép buộc một bộ quy tắc bảo mật cứng nhắc, OpenRPGEngine cung cấp phương thức `this.setPolicy(type, policyFunction)`.

Khi một hành động nhạy cảm diễn ra:
1. Hệ thống sẽ gọi hàm `policyFunction` của bạn trước.
2. Nếu hàm trả về `true` -> Cho phép thực hiện.
3. Nếu hàm trả về `false` -> Chặn đứng hành động và ném lỗi an toàn.
4. Nếu hàm trả về `null` hoặc `undefined` -> Nhường quyền quyết định lại cho bộ xử lý mặc định của OpenRPG.

---

## 2. Các Loại Policy Hỗ Trợ

Hệ thống hỗ trợ 4 loại Policy:
* `"fs"`: Kiểm soát quyền đọc/ghi tệp tin của mod.
* `"permission"`: Kiểm soát việc cấp quyền đặc quyền cho mod.
* `"audit"`: Can thiệp hoặc thay đổi kết quả chấm điểm kiểm định mã độc tĩnh.
* `"circuitBreaker"`: Tùy biến điều kiện đánh sập cầu dao ngắt hook lỗi.

---

## 3. Các Ví Dụ Triển Khai Thực Tế

### Ví dụ 1: Tùy Biến Chính Sách Hệ Thống Tệp (`fs policy`)

Mặc định, mod chỉ được ghi file vào chính thư mục của nó. Giả sử game của bạn muốn cho phép mod ghi dữ liệu vào thư mục `save/` và `data/custom_data/`, nhưng tuyệt đối cấm sửa file `.dll` hay file thực thi:

```javascript
class MyGameModLoader extends BaseLoader {
    constructor() {
        super();

        this.setPolicy("fs", (modObj, targetPath, op) => {
            const normalized = targetPath.replace(/\\/g, "/");

            // Chặn tuyệt đối mọi hành vi can thiệp file nhạy cảm
            if (/\.(exe|dll|bat|cmd|vbs|ps1)$/i.test(normalized)) {
                console.warn(`[SecurityAlert] Mod [${modObj.id}] cố tình ghi file thực thi: ${targetPath}`);
                return false; // CHẶN NGAY!
            }

            // Cho phép ghi vào thư mục save và thư mục dữ liệu mở rộng riêng của game
            if (op === "write" || op === "writeFileSync") {
                if (normalized.includes("/save/") || normalized.includes("/custom_data/")) {
                    return true; // CHO PHÉP!
                }
            }

            // Để mặc định xử lý (kiểm tra thư mục mod)
            return null;
        });
    }
}
```

---

### Ví dụ 2: Tùy Biến Cấp Quyền Đặc Quyền (`permission policy`)

Nếu game của bạn có một hệ thống tài khoản trực tuyến riêng và muốn cấp quyền gọi mạng đặc biệt cho các mod được studio ủy quyền:

```javascript
this.setPolicy("permission", (modObj, permission) => {
    // Nếu là quyền gửi điểm số trực tuyến và mod nằm trong danh sách đối tác tin cậy
    if (permission === "network:leaderboard") {
        const trustedMods = ["official_dlc_1", "community_tournament"];
        if (trustedMods.includes(modObj.id)) {
            return true;
        }
    }
    return null; // Mặc định xử lý
});
```

---

### Ví dụ 3: Tùy Biến Chấm Điểm Kiểm Định Tĩnh (`audit policy`)

Nếu game của bạn sử dụng một số thư viện obfuscate phổ biến (như VisuStella) và bạn không muốn trừ điểm kiểm định của những plugin này:

```javascript
this.setPolicy("audit", (modObj, report) => {
    // Nếu mod khai báo là plugin thương mại hợp pháp
    if (modObj.id.startsWith("visustella_") || modObj.bypassAudit) {
        report.score = 100;
        report.grade = "S";
        report.passed = true;
        report.criticalFailures = [];
    }
    return report;
});
```

---

👉 Xem tiếp:  
[**B3. Cấu Hình Chốt Chặn Tính Năng (Feature Toggles)**](03_Feature_Toggles_Configuration.md)
