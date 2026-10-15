# 📚 Tài Liệu Nhà Phát Triển OpenRPGLoader (Developer Documentation)

> **Kiến trúc tài liệu chuẩn quốc tế theo mô hình Chromium & Diátaxis Framework.**  
> *Được thiết kế chuyên biệt cho hệ sinh thái RPG Maker MZ: phân tách rành mạch giữa Thực hành, Kiến trúc, Bí kíp và Tra cứu kỹ thuật.*

---

## 🏛️ Cấu Trúc Tài Liệu Theo Mô Hình Diátaxis & Chromium

Bộ tài liệu nhà phát triển của **OpenRPGLoader** được xây dựng dựa trên tiêu chuẩn kiến trúc tài liệu của **Chromium / Google Chrome** (`developer.chrome.com`), phân chia khoa học thành **4 Trụ Cột Tri Thức** cốt lõi:

```text
               HƯỚNG ĐẾN THỰC HÀNH (Practical)
                             ▲
                             │
     [1] GETTING STARTED     │     [3] HOW-TO GUIDES
         (Tutorials)         │        (Cookbooks)
      Dẫn dắt người mới      │    Giải quyết bài toán cụ thể
      tạo Mod trong 5 phút   │    bằng các đoạn code mẫu
                             │
─────────────────────────────┼─────────────────────────────► HƯỚNG ĐẾN KỸ THUẬT (Technical)
                             │
     [2] CORE CONCEPTS       │     [4] API REFERENCE
       (Architecture)        │        (Specifications)
     Hiểu sâu bản chất       │    Từ điển tra cứu chính xác
     và vòng đời hệ thống    │    về hàm, sự kiện, manifest
                             │
                             ▼
               HƯỚNG ĐẾN LÝ THUYẾT (Theoretical)
```

---

## 🗺️ Bản Đồ Điều Hướng & Chỉ Mục Tài Liệu

Tài liệu được chia thành **2 PHẦN LỚN** phục vụ 2 đối tượng nhà phát triển:
* **PHẦN A (Mod Developer)**: Dành cho modder phát triển tính năng, cốt truyện, hình ảnh cho game.
* **PHẦN B (Engine / Loader Extender)**: Dành cho các studio hoặc lập trình viên muốn tạo bản Mod Loader phái sinh (Derivative Loader) cho tựa game riêng.

---

> 🌟 **Khởi đầu lý tưởng**: Hãy đọc qua [**Lời Ngỏ & Giới Thiệu Dành Cho Nhà Phát Triển (Hello to OpenRPGLoader)**](Hello%20to%20OpenRPGLoader%20Developer%20Document.md) để nắm bắt tinh thần dự án, chính sách bản quyền và các nhóm kỹ năng cần có trước khi bắt tay vào viết mod!
>
> ⚠️ **Lưu ý**: Toàn bộ hướng dẫn trong bộ tài liệu này đều là **dạng tổng quát** (Generic Standard). Để chính xác hơn, vui lòng xem **CHI TIẾT TÀI LIỆU DÀNH CHO NHÀ PHÁT TRIỂN trên hệ thống Mod Loader mà bạn định tạo hoặc phát triển mod cho nó**.

---

### 🚀 Trụ Cột 1: Bắt Đầu Nhanh (Getting Started - Tutorials)
*Dành cho người mới bắt đầu, giúp bạn tạo sản phẩm chạy được trong 5–10 phút.*

* [**01. Tạo Bản Mod Đầu Tiên Trong 5 Phút (Hello World Mod)**](01_Getting_Started/01_Hello_World_Mod.md)  
  *Dẫn dắt tạo thư mục mod, khai báo `mod.json`, viết script hiển thị Toast thông báo khi vào game.*
* [**02. Tạo Bản Mod Loader Phái Sinh Cho Tựa Game Của Bạn Trong 10 Phút**](01_Getting_Started/02_Quickstart_Custom_Loader.md)  
  *Kế thừa `OpenRPGLoaderCore` trong ~30 dòng mã, bật tắt cờ tính năng và nhúng API đặc thù của game.*

---

### 🧠 Trụ Cột 2: Khái Niệm Cốt Lõi & Kiến Trúc (Core Concepts - Architecture)
*Giải thích bản chất "Tại sao hệ thống lại hoạt động như vậy" và nguyên lý vận hành ngầm.*

* [**01. Kiến Trúc Hai Tầng Phong Cách Chromium (Two-Tier Architecture)**](02_Core_Concepts/01_Two_Tier_Chromium_Architecture.md)  
  *Sự phân tách giữa `OpenRPGEngine` (Lõi trung lập) và `OpenRPGLoaderCore` (Vỏ tương thích RPG Maker MZ).*
* [**02. Vòng Đời Thực Thi 7 Giai Đoạn & Đồ Thị Topo Sort (Lifecycle Pipeline)**](02_Core_Concepts/02_Lifecycle_and_Execution_Pipeline.md)  
  *Quy trình khám phá, sắp xếp phụ thuộc bằng DFS, giải quyết chu trình lặp và Two-Phase Sandbox.*
* [**03. Bộ Ba Cơ Chế Phòng Vệ Chủ Động (Defensive Systems)**](02_Core_Concepts/03_Defensive_Mechanisms.md)  
  *Cầu dao tự ngắt lỗi Circuit Breaker, Hộp cát Safe-FS chống Path Traversal và Khiên Save Shield.*

---

### 🍳 Trụ Cột 3: Hướng Dẫn Thực Hành Cụ Thể (How-To Guides - Cookbooks)
*Tổng hợp các bài toán thực tế kèm đoạn code mẫu (code snippets) có thể sao chép và áp dụng ngay.*

#### 🎮 PHẦN A: DÀNH CHO MODDER PHÁT TRIỂN MOD CHO GAME
* [**A1. Vá Cơ Sở Dữ Liệu 14 Bảng MZ Chuẩn RFC 6902 JSON-Patch**](03_How_To_Guides/PART_A_MOD_DEVELOPMENT/01_Patch_Database_RFC6902.md)  
  *Cách thêm/sửa/xóa Item, Skill, Weapon, Enemy... mà không sợ xung đột giữa nhiều mod.*
* [**A2. Hook An Toàn Vào Lớp Logic Game (Safe Hook Pipeline)**](03_How_To_Guides/PART_A_MOD_DEVELOPMENT/02_Hook_Game_Methods_Safely.md)  
  *Cách can thiệp vào `BattleManager`, `Game_Action`, `Scene_Map` với thứ tự ưu tiên và `next()`.*
* [**A3. Thay Thế Tài Nguyên Ảo (Virtual Assets: Hình Ảnh, Âm Thanh, Việt Hóa)**](03_How_To_Guides/PART_A_MOD_DEVELOPMENT/03_Virtual_Assets_Replacement.md)  
  *Cách đè file đồ họa, lồng tiếng, tạo gói dịch ngôn ngữ mà không ghi đè bất kỳ file game gốc nào.*
* [**A4. Đăng Ký Menu Cấu Hình In-Game & Hiển Thị Thông Báo Toast**](03_How_To_Guides/PART_A_MOD_DEVELOPMENT/04_InGame_Config_and_UI.md)  
  *Cách tạo giao diện tinh chỉnh trong menu `F8` và gửi thông báo nổi lên màn hình game.*
* [**A5. Giao Tiếp Giữa Các Bản Mod & Khai Báo Phụ Thuộc (Inter-Mod API)**](03_How_To_Guides/PART_A_MOD_DEVELOPMENT/05_Inter_Mod_Communication.md)  
  *Cách xuất thư viện dùng chung (`exports`), gọi API của mod khác và trao đổi qua Event Bus.*

#### 🛠️ PHẦN B: DÀNH CHO NHÀ PHÁT TRIỂN TẠO BIẾN THỂ MOD LOADER
* [**B1. Kế Thừa & Tạo Bản Phân Phối Loader Mới (Subclassing Guide)**](03_How_To_Guides/PART_B_DERIVATIVE_LOADERS/01_Subclassing_OpenRPGLoaderCore.md)  
  *Cách tạo bộ nạp mod riêng biệt mang tên trò chơi của bạn mà không cần chạm vào lõi upstream.*
* [**B2. Tùy Biến Chính Sách Bảo Mật (Pluggable Policy APIs)**](03_How_To_Guides/PART_B_DERIVATIVE_LOADERS/02_Customizing_Security_Policies.md)  
  *Cách giới hạn quyền ghi file (`fs policy`), cấp quyền đặc quyền (`permission policy`) và kiểm định (`audit policy`).*
* [**B3. Cấu Hình Chốt Chặn Tính Năng (Feature Toggles)**](03_How_To_Guides/PART_B_DERIVATIVE_LOADERS/03_Feature_Toggles_Configuration.md)  
  *Bật/tắt chế độ cách ly cưỡng chế, vô hiệu hóa Safe-FS khi chạy test tự động, điều chỉnh ngưỡng Circuit Breaker.*
* [**B4. Nhúng Hệ Thống Nghiệp Vụ Riêng Của Tựa Game Vào Loader**](03_How_To_Guides/PART_B_DERIVATIVE_LOADERS/04_Injecting_Domain_Game_APIs.md)  
  *Cách tích hợp các hệ thống như Thế chiến đấu, Thần khí, Nấu ăn, Hacking Cyberpunk vào API chung.*
* [**B5. Xây Dựng Trình Cài Đặt Bộ Nạp Tự Động (Installer / Setup Wizard)**](03_How_To_Guides/PART_B_DERIVATIVE_LOADERS/05_Building_Installer_And_Setup.md)  
  *Kỹ thuật tiêm an toàn vào `js/plugins.js`, sao lưu dự phòng `.bak`, tự động hoàn tác và đóng gói Inno Setup.*

---

### 📖 Trụ Cột 4: Tra Cứu Kỹ Thuật (API & Manifest Reference)
*Từ điển tra cứu khô khan, chi tiết và chính xác tuyệt đối từng tham số và kiểu dữ liệu.*

* [**01. Đặc Tả Tệp Kê Khai `mod.json` (The Manifest Specification)**](04_API_Reference/01_Manifest_mod_json_Spec.md)  
  *Danh sách toàn bộ các trường, cú pháp dải phiên bản SemVer, hệ thống Permissions và cờ Audit.*
* [**02. Tra Cứu API Tầng Lõi `OpenRPGEngine`**](04_API_Reference/02_OpenRPGEngine_API.md)  
  *Chữ ký hàm, thuộc tính, sự kiện Event Bus, SafeHook, TopoSort, SafeFS và SaveShield.*
* [**03. Tra Cứu API Tầng Mở Rộng MZ `OpenRPGLoaderCore` & `Forge`**](04_API_Reference/03_OpenRPGLoader_Forge_API.md)  
  *API giao diện, quản lý cấu hình, giải quyết tài nguyên ảo, hiển thị UI Toast và các lớp Scene/Window.*

---

<p align="center">
  <b>M.A.P.L.E MAGI Labs</b> • <i>OpenRPGLoader Technical Documentation Suite</i>
</p>
