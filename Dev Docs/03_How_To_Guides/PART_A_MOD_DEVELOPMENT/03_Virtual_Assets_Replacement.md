# Hướng Dẫn A3: Thay Thế Tài Nguyên Ảo (Virtual Assets: Hình Ảnh, Âm Thanh, Việt Hóa)

> **Bài toán**: Bạn muốn thay đổi trang phục nhân vật (Skin Mod), thay thế nhạc nền chiến đấu mới (Audio Mod), hoặc tạo gói ngôn ngữ Việt hóa các nút bấm mà **không được phép ghi đè vào thư mục `img/` hay `audio/` gốc của game**.

---

## 1. Nguyên Lý Virtual Asset Resolver

OpenRPGLoader tự động chặn các lệnh nạp tài nguyên từ `ImageManager.loadBitmap` và `AudioManager.playBgm` trong runtime:
1. Khi trò chơi yêu cầu tệp: `img/characters/Actor1.png`.
2. Bộ nạp sẽ tự động tìm kiếm trong thư mục mod của bạn theo các ứng viên:
   * `mods/<mod_id>/img/characters/Actor1.png`
   * `mods/<mod_id>/assets/img/characters/Actor1.png`
   * `mods/<mod_id>/characters/Actor1.png`
3. Nếu tìm thấy, đường dẫn sẽ được **chuyển hướng ảo** sang tệp của mod. Tệp gốc trong game hoàn toàn nguyên vẹn!

---

## 2. Cấu Trúc Thư Mục Cho Mod Đồ Họa & Âm Thanh

Bạn chỉ cần tạo cấu trúc thư mục bên trong mod y hệt như cấu trúc của game gốc:

```text
mods/custom_skin_mod/
 ├── mod.json
 ├── img/
 │    ├── characters/
 │    │    └── Actor1.png        <── Thay thế ngoại hình nhân vật Actor1
 │    └── pictures/
 │         └── TitleLogo.png     <── Thay thế logo màn hình chính
 └── audio/
      └── bgm/
           └── Battle1.ogg       <── Thay thế bài nhạc chiến đấu Battle1
```

> [!NOTE]
> Đối với mod chỉ thay đổi tài nguyên (Resource Pack), bạn **không cần viết tệp `index.js`**. Chỉ cần có `mod.json` và các thư mục tài nguyên là xong!

---

## 3. Ví Dụ Tạo Bản Mod Việt Hóa Đồ Họa

Nếu trò chơi có các nút bấm dạng hình ảnh tiếng Anh (như `Attack.png`, `Skill.png`):

1. Tạo thư mục mod: `mods/vietnamese_ui_pack/`.
2. Khai báo `mod.json`:
   ```json
   {
     "id": "vietnamese_ui_pack",
     "name": "Gói Việt Hóa Giao Diện Đồ Họa",
     "version": "1.0.0",
     "author": "Cộng Đồng Việt Hóa",
     "description": "Việt hóa toàn bộ các nút bấm và hình ảnh hướng dẫn."
   }
   ```
3. Đặt các tệp ảnh đã dịch vào:
   * `mods/vietnamese_ui_pack/img/system/Button_Attack.png`
   * `mods/vietnamese_ui_pack/img/system/Button_Skill.png`
4. Khởi động game: Trò chơi sẽ tự động hiển thị nút bấm Tiếng Việt! Khi người chơi tắt mod trong menu F8, game lập tức quay trở lại hiển thị nút bấm tiếng Anh ban đầu.

---

👉 Xem tiếp:  
[**A4. Đăng Ký Menu Cấu Hình In-Game & Hiển Thị Thông Báo Toast**](04_InGame_Config_and_UI.md)
