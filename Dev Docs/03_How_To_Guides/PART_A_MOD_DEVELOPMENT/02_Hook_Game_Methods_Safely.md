# Hướng Dẫn A2: Hook An Toàn Vào Lớp Logic Game (Safe Hook Pipeline)

> **Bài toán**: Bạn muốn can thiệp vào công thức tính sát thương, sự kiện rơi đồ khi quái chết, hoặc thay đổi hành vi màn hình menu mà **không muốn đè hàm thô bạo (monkey-patching) gây crash game khi có lỗi**.

---

## 1. Tại Sao Không Nên Dùng Cách Ghi Đè Truyền Thống?

Cách làm cũ trong RPG Maker MZ:
```javascript
// CÁCH CŨ NGUY HIỂM:
const _Game_Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
    _Game_Action_apply.call(this, target);
    // Nếu dòng này ném lỗi (TypeError...) -> TOÀN BỘ GAME BỊ VĂNG!
    doSomethingRisky();
};
```
* **Nhược điểm**: Không kiểm soát được thứ tự chạy giữa các plugin, không thể thu hồi khi mod bị gỡ, và bất kỳ ngoại lệ nào cũng làm sập trò chơi.

---

## 2. Giải Pháp: `Forge.hook(targetClass, methodName, hookFn, modId, priority)`

OpenRPGLoader cung cấp đường ống dẫn hook an toàn (Safe Hook Pipeline) hỗ trợ:
* Middleware pattern với hàm điều hướng `next()`.
* Thứ tự ưu tiên `priority` (số càng lớn chạy càng trước).
* Tự động bảo vệ bởi **Circuit Breaker** (nếu hook của bạn bị crash quá số lần quy định, nó sẽ tự ngắt mà game vẫn chạy tiếp).

---

## 2. Quy Ước Gọi `next()` & Xử Lý Tham Số Đầu Vào

Hàm `next` trong Safe Hook Pipeline được thiết kế thông minh để hỗ trợ cả hai trường hợp:

* **Trường hợp 1: Giữ nguyên tham số gốc (Không sửa đổi)**:  
  Bạn chỉ cần gọi `next()` không truyền tham số. Engine sẽ **tự động chuyển tiếp đầy đủ toàn bộ tham số gốc ban đầu** sang các hook kế tiếp và hàm gốc của game.  
  *Ví dụ*: `const result = next();` (tự động nhận đủ arguments mà không sợ thất lạc).

* **Trường hợp 2: Sửa đổi tham số đầu vào (Argument Mutation)**:  
  Nếu bạn muốn can thiệp hoặc ghi đè tham số trước khi truyền cho các hook tiếp theo hoặc hàm game gốc, hãy truyền trực tiếp các giá trị mới vào `next(...)`.  
  *Ví dụ*: Muốn ép đòn đánh luôn là đòn chí mạng, bạn gọi: `const damage = next(target, true);` — giá trị `critical` được ép thành `true`.

* **Ngữ cảnh `this`**:  
  Từ khóa `this` bên trong hàm hook luôn trỏ chính xác về đối tượng đang gọi phương thức (ví dụ: instance của `Game_Action`, `Game_Enemy`, `Scene_Map`).

---

## 3. Các Ví Dụ Thực Tế (Code Snippets)

### Ví dụ 1: Can Thiệp Công Thức Sát Thương (Game_Action)

Nhân đôi sát thương nếu người tấn công là nhân vật chính (ID = 1):

```javascript
// Trong index.js của mod:
(() => {
    "use strict";

    Forge.hook(Game_Action, "makeDamageValue", function(next, target, critical) {
        // 1. Gọi hàm gốc để lấy sát thương tính toán ban đầu
        let baseDamage = next(target, critical);

        // 2. Can thiệp logic của mod
        if (this.subject().isActor() && this.subject().actorId() === 1) {
            baseDamage *= 2; // Tăng gấp đôi sát thương
            Forge.log(`⚔️ [DamageMod] Kích hoạt nhân đôi sát thương: ${baseDamage}`);
        }

        // 3. Trả về kết quả mới
        return baseDamage;
    }, "my_damage_mod", 100); // Priority = 100 (chạy ưu tiên cao)
})();
```

---

### Ví dụ 2: Tăng Tỉ Lệ Rơi Tiền Khi Tiêu Diệt Kẻ Địch (Game_Enemy)

```javascript
Forge.hook(Game_Enemy, "gold", function(next) {
    const originalGold = next();
    const bonusGold = Math.floor(originalGold * 1.5);
    return bonusGold;
}, "bonus_gold_mod", 50);
```

---

### Ví dụ 3: Ngăn Chặn Hành Vi Mặc Định (Chặn Thoát Game Đột Ngột)

Nếu bạn không gọi hàm `next()`, hàm gốc và các hook ưu tiên thấp hơn sẽ bị chặn lại:

```javascript
Forge.hook(Scene_GameEnd, "commandToTitle", function(next) {
    // Hiển thị cảnh báo thay vì thoát ngay
    if ($gameParty.gold() > 100000) {
        Forge.showInGameToast("Cảnh báo: Bạn đang giữ quá nhiều tiền vàng!", "warning");
    }
    // Vẫn cho phép tiếp tục thoát
    next();
}, "wealth_warning_mod");
```

---

## 4. Các Quy Tắc Vàng Khi Viết Hook

1. **Luôn kiểm tra sự tồn tại**: Trước khi truy cập các thuộc tính sâu, hãy dùng `&&` hoặc optional chaining `?.`.
2. **Luôn gọi `next()` trừ khi có chủ ý**: Việc quên gọi `next()` sẽ làm đứt chuỗi thực thi của các mod khác.
3. **Ưu tiên mức độ vừa phải**: Dùng `priority: 0` cho các can thiệp thông thường. Chỉ dùng `priority > 100` khi bạn làm các mod thư viện cốt lõi cần chạy trước.

---

👉 Xem tiếp:  
[**A3. Thay Thế Tài Nguyên Ảo (Virtual Assets)**](03_Virtual_Assets_Replacement.md)
