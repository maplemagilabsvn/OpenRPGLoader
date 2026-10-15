# Hướng Dẫn A1: Vá Cơ Sở Dữ Liệu 14 Bảng MZ Chuẩn RFC 6902 JSON-Patch

> **Bài toán**: Bạn muốn thêm một bình máu mới, sửa giá tiền một thanh kiếm, hoặc tăng sát thương một kỹ năng mà **không muốn ghi đè toàn bộ tệp JSON của game**, giúp mod của bạn có thể chạy song song cùng hàng chục bản mod khác mà không bị đè dữ liệu.

---

## 1. Tại Sao Lại Là Chuẩn RFC 6902?

Theo cách làm cũ, nếu Mod A và Mod B cùng sửa tệp `Items.json`:
* Mod nào nạp sau sẽ **đè bẹp** toàn bộ sửa đổi của Mod nạp trước.
* Chuẩn quốc tế **RFC 6902 JSON-Patch** giải quyết việc này bằng cách chỉ gửi các "lệnh phẫu thuật" chi tiết (Operation Diffs), ví dụ: *"chỉ sửa giá của Item số 1 thành 45 đồng"* hoặc *"chỉ thêm một hiệu ứng mới vào cuối mảng effects"*.

---

## 2. Quy Ước Đặt Tên Tệp Vá

Bên trong thư mục mod của bạn, tạo thư mục `data/`. Đặt tên tệp theo quy ước:
`<TênBảng>.patch.json` hoặc chứa từ khóa của bảng dữ liệu đó:

```text
mods/my_awesome_mod/
 └── data/
       ├── Items.patch.json         # Vá bảng $dataItems
       ├── Skills.patch.json        # Vá bảng $dataSkills
       ├── Weapons.patch.json       # Vá bảng $dataWeapons
       └── Enemies.patch.json       # Vá bảng $dataEnemies
```

OpenRPGLoader hỗ trợ tự động toàn bộ **14 bảng cơ sở dữ liệu của RPG Maker MZ**:
`Items`, `Weapons`, `Armors`, `Skills`, `Actors`, `Classes`, `Enemies`, `Troops`, `States`, `Animations`, `Tilesets`, `CommonEvents`, `System`, `MapInfos` (và các bản đồ `MapXXX.json`).

---

## 3. Các Ví Dụ Cụ Thể (Code Snippets)

### Ví dụ 1: Sửa Giá Tiền & Tên Bình Máu (`Items.patch.json`)

```json
[
  {
    "op": "replace",
    "path": "/1/name",
    "value": "Bình Siêu Máu (Đã Mod)"
  },
  {
    "op": "replace",
    "path": "/1/price",
    "value": 45
  },
  {
    "op": "add",
    "path": "/1/effects/-",
    "value": {
      "code": 11,
      "dataId": 0,
      "value1": 0.5,
      "value2": 200
    }
  }
]
```
* **`replace /1/name`**: Tìm vật phẩm ID = 1 và thay thế trường `name`.
* **`replace /1/price`**: Tìm vật phẩm ID = 1 và thay thế `price`.
* **`add /1/effects/-`**: Ký tự `"-"` nghĩa là chèn thêm một phần tử vào cuối danh sách hiệu ứng (`effects`) mà không làm mất các hiệu ứng gốc!

---

### Ví dụ 2: Thêm Kỹ Năng Mới Vào Bảng Kỹ Năng (`Skills.patch.json`)

Nếu bạn muốn tạo một kỹ năng mới tinh (ví dụ ID 105):

```json
[
  {
    "op": "add",
    "path": "/105",
    "value": {
      "id": 105,
      "name": "Bão Lửa Thiên Giới",
      "mpCost": 25,
      "tpCost": 0,
      "scope": 2,
      "damage": {
        "type": 1,
        "elementId": 2,
        "formula": "a.mat * 4 - b.mdf * 2",
        "variance": 20,
        "critical": true
      },
      "description": "Gọi bão lửa giáng xuống toàn bộ kẻ địch."
    }
  }
]
```

> [!NOTE]
> **Cơ chế tự động điền mảng của OpenRPGLoader**:  
> Trong RPG Maker MZ, các mảng cơ sở dữ liệu là 1-indexed (phần tử index 0 luôn là `null`). Nếu game gốc hiện chỉ có 50 kỹ năng (độ dài mảng là 51), OpenRPGLoader được tích hợp sẵn cơ chế **tự động điền các phần tử `null` vào các ô trống** từ index 51 đến 104 trước khi gắn kỹ năng mới vào vị trí 105. Nhờ đó, thao tác không bị báo lỗi "Index out of bounds" và vòng lặp duyệt skill của game vẫn an toàn tuyệt đối.
>
> [!TIP]
> **Tránh xung đột ID cố định giữa nhiều mod**:  
> Nếu cả Mod A và Mod B cùng chỉ định `"path": "/105"`, mod nạp sau sẽ ghi đè lên kỹ năng của mod trước. Để tránh hoàn toàn xung đột số ID tĩnh, đối với các bản mod phức tạp, bạn nên sử dụng hệ thống đăng ký động **`Forge.registerItem(...)`** hoặc định danh namespace **`ResourceLocation`** trong mã JavaScript (xem [02. Tra Cứu API OpenRPGEngine](../../04_API_Reference/02_OpenRPGEngine_API.md)).

---

### Ví dụ 3: Sử Dụng `test` Để Kiểm Tra Điều Kiện Trước Khi Vá

Phép toán `test` giúp đảm bảo bạn chỉ sửa dữ liệu nếu phiên bản game hoặc vật phẩm đang có đúng trạng thái bạn mong đợi:

```json
[
  {
    "op": "test",
    "path": "/1/id",
    "value": 1
  },
  {
    "op": "replace",
    "path": "/1/price",
    "value": 999
  }
]
```
> [!NOTE]
> Nếu giá trị tại đường dẫn `path` không khớp với `value`, toàn bộ gói vá sẽ an toàn dừng lại và thông báo lỗi, tránh làm sai lệch dữ liệu.

---

## 4. Bảng Tra Cứu Các Phép Toán RFC 6902

| Phép toán (`op`) | Mô tả | Tham số bắt buộc |
| :--- | :--- | :--- |
| **`add`** | Thêm trường mới hoặc chèn phần tử mảng | `path`, `value` |
| **`remove`** | Xóa trường khỏi đối tượng hoặc xóa phần tử mảng | `path` |
| **`replace`** | Thay thế giá trị của một trường đã tồn tại | `path`, `value` |
| **`move`** | Di chuyển giá trị từ vị trí này sang vị trí khác | `from`, `path` |
| **`copy`** | Sao chép giá trị (deep clone) sang vị trí mới | `from`, `path` |
| **`test`** | Kiểm tra giá trị có khớp không trước khi thực thi | `path`, `value` |

---

👉 Xem tiếp:  
[**A2. Hook An Toàn Vào Lớp Logic Game**](02_Hook_Game_Methods_Safely.md)
