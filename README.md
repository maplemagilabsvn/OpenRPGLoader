# 🎮 OpenRPGLoader

> **Nền tảng nạp và quản lý Mod thế hệ mới dành cho các tựa game RPG Maker MZ.**  
> *Đơn giản hóa trải nghiệm modding — An toàn cho dữ liệu, mượt mà khi trải nghiệm, cắm là chạy!*

---

[![Phiên bản](https://img.shields.io/badge/phiên%20bản-2.1.0-blue.svg)](#)
[![Tương thích](https://img.shields.io/badge/tương%20thích-RPG%20Maker%20MZ-orange.svg)](#)
[![Trải nghiệm](https://img.shields.io/badge/trải%20nghiệm-Cắm%20là%20chạy-success.svg)](#)
[![Giấy phép](https://img.shields.io/badge/giấy%20phép-MIT-green.svg)](#)

---

## 🌟 OpenRPGLoader là gì?

Nếu bạn từng chơi game và muốn cài thêm các bản mở rộng, nhân vật mới, trang bị mới hay bản dịch Việt hóa nhưng lại sợ:
* *Cài mod làm game bị văng (crash) giữa chừng?*
* *Lỡ tay xóa mod là mất trắng file lưu game (Save Data) cày cuốc hàng chục giờ?*
* *Các bản mod đánh nhau, gây lỗi xung đột không rõ nguyên nhân?*

👉 **OpenRPGLoader ra đời để giải quyết triệt để những nỗi lo đó!**

Lấy cảm hứng từ hệ sinh thái modding hiện đại (tựa như Minecraft Forge), **OpenRPGLoader** là một "trợ lý vô hình" hoạt động ngay bên trong game. Bạn không cần biết lập trình hay chỉnh sửa file phức tạp, OpenRPGLoader sẽ tự động nhận diện, sắp xếp và kích hoạt các bản mod một cách mượt mà nhất.

---

## ✨ Điểm Nổi Bật Dành Cho Game Thủ

### 🛡️ 1. Khiên Bảo Vệ Save Game (Save Shield)
Không còn nỗi sợ mất save game! Khi bạn tháo gỡ một bản mod đã từng dùng, OpenRPGLoader sẽ tự động nhận biết và thanh lọc an toàn các dữ liệu "mồ côi" (vật phẩm, trang bị, nhân vật của mod cũ). Trò chơi vẫn tiếp tục chạy bình thường mà không bị crash hay kẹt file lưu.

### ⚡ 2. Cầu Dao Tự Ngắt Lỗi (Circuit Breaker)
Nếu một bản mod bị lỗi hoặc thiếu sót khi tính toán sát thương, hệ thống sẽ tự động cách ly riêng bản mod đó mà **không làm sập cả trò chơi**. Bạn vẫn có thể tiếp tục hoàn thành trận chiến hoặc lưu game an toàn thay vì bị văng đột ngột ra màn hình desktop.

### 📋 3. Menu Quản Lý Mod Ngay Trong Game
* Mở trực tiếp từ **Màn hình chính (Title Screen)** hoặc **Menu tạm dừng (Pause Menu)**.
* **Bật/Tắt mod tức thì** chỉ với một nút bấm mà không cần phải xóa file.
* Tùy chỉnh các cài đặt riêng của từng bản mod (âm lượng, độ khó, hiệu ứng hiển thị...).
* Xem rõ ràng thông tin tác giả, phiên bản và mô tả của từng mod.

### 🧩 4. Cài Đặt "Cắm Là Chạy" (Plug & Play)
Không cần cài thêm phần mềm bên thứ ba rườm rà. Bạn chỉ cần tải mod về và thả vào thư mục — game sẽ tự động lo phần còn lại.

### 🔍 5. Kiểm Định Thân Thiện & Minh Bạch
Mỗi bản mod đều được chấm điểm chất lượng và hiển thị huy hiệu rõ ràng (`[S]`, `[A]`, `[B]`, `[C]`). Hệ thống không cấm đoán cực đoan mà đưa ra cảnh báo minh bạch, giúp bạn luôn chủ động nắm bắt tình trạng của bản mod mình đang chơi.

---

## 🚀 Hướng Dẫn Cài Đặt Mod (3 Bước Đơn Giản)

Việc cài đặt mod vào game giờ đây chỉ mất chưa đầy 30 giây:

```text
📁 Thư mục trò chơi của bạn
 ├── 📁 mods/                      <── Thả các bản mod vào đây!
 │    ├── 📁 Mod_VuKhiMoi/
 │    │    ├── mod.json
 │    │    └── index.js
 │    └── 📁 Mod_VietHoa/
 ├── Game.exe
 └── index.html
```

* **Bước 1**: Tải bản mod bạn yêu thích về máy (dạng thư mục hoặc file `.zip` đã giải nén).
* **Bước 2**: Thả thư mục mod vào thư mục `mods` nằm trong thư mục gốc của game.
* **Bước 3**: Khởi động game! Vào mục **"Bản Mod (Mods)"** trên màn hình chính để kiểm tra và bắt đầu hành trình mới.

> **Mẹo nhỏ**: Bạn cũng có thể nhấn phím tắt **`F8`** bất cứ lúc nào trong trò chơi để mở nhanh màn hình quản lý mod!

---

## 🎯 Phím Tắt Tiện Ích

| Phím Tắt | Chức Năng |
| :---: | :--- |
| **`F8`** | Mở nhanh giao diện Quản Lý Mod (Scene Mods) |
| **`F5`** | Tải lại game (Reload) để cập nhật thay đổi mod mới |

---

## ❓ Câu Hỏi Thường Gặp (FAQ)

<details>
<summary><b>1. Cài mod có làm hỏng file Save game cũ của tôi không?</b></summary>
<br>

**Hoàn toàn không!** Nhờ tính năng **Save Shield**, toàn bộ dữ liệu lưu game của bạn luôn được bảo vệ an toàn. Ngay cả khi bạn tháo gỡ một bản mod từng thêm vào các vật phẩm hoặc nhân vật mới, OpenRPGLoader sẽ tự động dọn sạch các tệp mồ côi và khôi phục trạng thái chuẩn để bạn tiếp tục chuyến phiêu lưu mà không bị kẹt hay lỗi file save.
</details>

<details>
<summary><b>2. Làm thế nào để biết một bản mod có đang hoạt động hay không?</b></summary>
<br>

Bạn chỉ cần nhấn phím **`F8`** hoặc vào mục **"Bản Mod (Mods)"** ngay tại màn hình chính. Danh sách sẽ hiển thị trạng thái màu sắc trực quan của từng mod:
* 🟢 **Đang hoạt động (Active)**: Mod đã sẵn sàng và đang vận hành trơn tru.
* ⚪ **Đã tắt (Disabled)**: Mod đang tạm dừng hoạt động theo ý muốn của bạn.
* 🔴 **Có vấn đề (Conflict/Error)**: Mod đang thiếu tài nguyên phụ thuộc hoặc xung đột với mod khác.
</details>

<details>
<summary><b>3. Tôi tải mod về ở dạng file nén (.zip / .rar) thì phải làm thế nào?</b></summary>
<br>

Rất đơn giản! Bạn chỉ cần giải nén file đó ra thành một thư mục (đảm bảo bên trong thư mục chứa file `mod.json` hoặc `index.js`), sau đó sao chép toàn bộ thư mục đó dán vào thư mục `mods/` của trò chơi. Khởi động lại game là mod sẽ tự động xuất hiện.
</details>

<details>
<summary><b>4. Tôi có cần cài thêm phần mềm hỗ trợ nào khác không?</b></summary>
<br>

**Không cần bất kỳ phần mềm nào khác!** OpenRPGLoader đã được tích hợp sẵn hoàn toàn vào trò chơi. Bạn không cần cài Node.js, Python hay các ứng dụng quản lý bên thứ ba nào. Mọi thao tác chỉ đơn giản là tải mod về và thả vào thư mục `mods/`.
</details>

<details>
<summary><b>5. Tôi muốn tạm tắt một bản mod mà không muốn xóa file thì làm thế nào?</b></summary>
<br>

Vào menu **"Bản Mod (Mods)"** trong game, tìm đến bản mod bạn muốn tạm dừng và bấm nút **"Tắt" (Disable)**. Bản mod sẽ ngừng hoạt động ngay lập tức mà dữ liệu file mod trên máy vẫn được giữ nguyên. Khi nào muốn chơi lại, bạn chỉ cần bấm **"Bật" (Enable)**.
</details>

<details>
<summary><b>6. Nếu hai bản mod bị xung đột nhau thì game có bị văng (crash) không?</b></summary>
<br>

**Không!** Hệ thống sẽ chủ động phát hiện sự xung đột trước khi game chạy. Thay vì để trò chơi bị văng đột ngột ra màn hình máy tính, OpenRPGLoader sẽ hiển thị thông báo chi tiết trong menu mod cho biết chính xác hai bản mod nào đang va chạm nhau để bạn dễ dàng lựa chọn giữ lại bản mod ưng ý.
</details>

<details>
<summary><b>7. Tôi có thể cài bao nhiêu bản mod cùng một lúc?</b></summary>
<br>

**Không giới hạn số lượng!** OpenRPGLoader được tối ưu hóa để có thể nạp hàng chục bản mod cùng lúc trong thời gian chưa tới một cái chớp mắt, đồng thời tự động tính toán thứ tự nạp chuẩn xác nhất (Topological Sort) để tất cả hoạt động hài hòa.
</details>

<details>
<summary><b>8. Cài nhiều mod có làm game bị giật, lag hoặc tụt FPS không?</b></summary>
<br>

**Hầu như không ảnh hưởng!** OpenRPGLoader sử dụng cơ chế lưu bộ nhớ đệm kiểm định (Audit Cache SHA-256) và can thiệp thông minh chỉ khi cần thiết. Quá trình kiểm tra mod lúc mở game diễn ra trong chưa đầy 1 phần nghìn giây và không tiêu tốn tài nguyên xử lý đồ họa khi bạn đang chơi.
</details>

<details>
<summary><b>9. Các huy hiệu kiểm định [S], [A], [B], [C] và biểu tượng cảnh báo [⚠️] có ý nghĩa gì?</b></summary>
<br>

Đây là hệ thống đánh giá chất lượng và độ an toàn của mod:
* **`[S]` & `[A]`**: Mod đạt chuẩn tối ưu, an toàn và tương thích hoàn hảo.
* **`[B]` & `[C]`**: Mod hoạt động ổn định nhưng có thể chứa mã nguồn chưa tối ưu hoặc thiếu một số mô tả phụ trợ.
* **`[⚠️]` (Cảnh báo)**: Mod có sử dụng một số hàm nhạy cảm hoặc được đóng gói mã hóa. OpenRPGLoader vẫn cho phép chạy bình thường nhưng gắn cảnh báo để bạn lưu tâm.
</details>

<details>
<summary><b>10. OpenRPGLoader có hỗ trợ các bản mod Việt hóa hoặc thay đổi giao diện không?</b></summary>
<br>

**Có, hỗ trợ hoàn hảo!** Nhờ tính năng **Virtual Asset Resolver** và **Data Patching**, các bản mod Việt hóa (hình ảnh nút bấm, hội thoại, tên kỹ năng, âm thanh lồng tiếng) có thể tự động thay thế tài nguyên gốc của game một cách mượt mà mà không làm thay đổi hay làm hỏng bất kỳ file gốc nào.
</details>

<details>
<summary><b>11. Nếu trò chơi có bản cập nhật mới từ nhà phát hành thì OpenRPGLoader có bị mất tác dụng không?</b></summary>
<br>

Đa phần là **vẫn hoạt động bình thường!** Vì OpenRPGLoader hoạt động cắm ngoài động trên bộ nhớ RAM chứ không sửa đổi vĩnh viễn mã nguồn trò chơi, nên các bản vá nội dung hoặc sửa lỗi thông thường từ nhà sản xuất sẽ không làm mất tính năng của bộ nạp mod.
</details>

<details>
<summary><b>12. Tôi có thể chơi game ngoại tuyến (offline) hoàn toàn khi đã cài đặt OpenRPGLoader không?</b></summary>
<br>

**Hoàn toàn được!** OpenRPGLoader hoạt động độc lập 100% trên máy tính của bạn, không yêu cầu kết nối mạng, không cần đăng nhập tài khoản và không kiểm tra bản quyền trực tuyến.
</details>

<details>
<summary><b>13. Liệu OpenRPGLoader có phải là một bản chỉnh sửa file game không phép không?</b></summary>
<br>

**Không.** OpenRPGLoader là một công cụ nạp động (dynamic in-memory loader) hoàn toàn độc lập. Cơ chế của nó là can thiệp logic tạm thời trên bộ nhớ RAM khi game đang khởi chạy, tuyệt đối **không chỉnh sửa, không ghi đè, không bẻ khóa DRM và không phân phối lại** bất kỳ tệp dữ liệu gốc (hình ảnh, âm thanh, cốt truyện hay mã nguồn game) có bản quyền nào của tác giả trò chơi. 

Về mặt căn cứ pháp lý:
* **Hoa Kỳ (US Law)**: Hành vi này được bảo vệ theo học thuyết *Sử dụng hợp lý (Fair Use - 17 U.S.C. § 107)* và án lệ kinh điển *Lewis Galoob Toys, Inc. v. Nintendo of America, Inc. (1992)* — trong đó Tòa án khẳng định các công cụ can thiệp tạm thời vào bộ nhớ RAM khi người dùng chơi game không tạo ra tác phẩm phái sinh vi phạm bản quyền nếu không sao chép lại mã game gốc.
* **Liên minh Châu Âu (EU Law)**: Điều 5(3) của *Chỉ thị 2009/24/EC về Bảo vệ pháp lý các chương trình máy tính* quy định rõ ràng rằng người có quyền sử dụng hợp pháp một bản sao phần mềm hoàn toàn được quyền quan sát, nghiên cứu hoặc thử nghiệm hoạt động của phần mềm đó nhằm mục đích xác định các nguyên tắc và kỹ thuật cơ bản của chương trình.
* **Việt Nam**: Theo *Luật Sở hữu trí tuệ Việt Nam* (Khoản 1 Điều 20 và Điều 25), việc người dùng cá nhân nghiên cứu, thưởng thức và tạo công cụ hỗ trợ trải nghiệm hợp lý mà không nhằm mục đích thương mại xâm hại đến quyền khai thác bình thường của tác giả trò chơi là hoàn toàn phù hợp.
</details>

<details>
<summary><b>14. Tôi là một nhà phát triển và muốn tạo ra một bản Mod Loader riêng cho game của mình thì làm thế nào?</b></summary>
<br>

👉 **Vui lòng đọc [Tài liệu dành cho nhà phát triển (Developer Documentation)](Dev%20Docs/README.md)** (đặc biệt là hướng dẫn [Tạo Bản Mod Loader Phái Sinh Trong 10 Phút](Dev%20Docs/01_Getting_Started/02_Quickstart_Custom_Loader.md)) để xem hướng dẫn chi tiết về cách kế thừa và mở rộng.
</details>

<details>
<summary><b>15. Tôi có thể cài mod trên điện thoại (Android / iOS) không?</b></summary>
<br>

**KHÔNG!** OpenRPGLoader được thiết kế chuyên biệt và tối ưu hóa cho môi trường NW.js trên máy tính PC (Desktop / Laptop) chạy hệ điều hành Windows, macOS hoặc Linux. 

Các bản phát hành trò chơi trên nền tảng di động (chạy qua Android APK, iOS App, WebView hoặc Cordova) không có quyền truy cập hệ thống tệp và runtime Node.js của NW.js, do đó OpenRPGLoader **hoàn toàn không hỗ trợ và không thể cài đặt mod trên điện thoại**.
</details>

<details>
<summary><b>16. M.A.P.L.E MAGI Labs có chịu trách nhiệm về các biến thể Mod Loader do bên thứ ba tạo không?</b></summary>
<br>

**KHÔNG.** M.A.P.L.E MAGI Labs chỉ duy trì và bảo đảm chất lượng cho phiên bản gốc chính thức được phát hành tại kho lưu trữ của chúng tôi. 

Điều khoản và chính sách của OpenRPGLoader **CHỈ CÓ TÁC DỤNG VỚI BẢN GỐC CHÍNH THỨC**, hoàn toàn **KHÔNG PHẢI là điều khoản chung** cho toàn bộ các bản mod hay **toàn bộ các Mod Loader khác dựa trên nhân này**. Bất kỳ phiên bản phái sinh, chỉnh sửa, đổi tên hoặc đóng gói lại do bên thứ ba phát hành sẽ do chính bên thứ ba đó tự ban hành điều khoản và tự chịu 100% trách nhiệm trước người dùng và pháp luật. Chiếu theo điều khoản của Giấy phép nguồn mở **MIT License**, phần mềm được cung cấp theo nguyên trạng (*"AS IS"*), không đi kèm bất kỳ cam kết hay bảo hành trách nhiệm pháp lý nào đối với các bản chỉnh sửa không chính thức.
</details>

<details>
<summary><b>17. Tôi là một nhà phát triển và muốn đóng góp hoặc sửa lỗi cho OpenRPGLoader thì làm thế nào?</b></summary>
<br>

Chúng tôi luôn hoan nghênh những đóng góp chất lượng từ cộng đồng! Quy trình rất đơn giản:
1. **Fork** kho lưu trữ mã nguồn chính thức của dự án.
2. Tạo nhánh mới cho tính năng hoặc bản sửa lỗi của bạn (`feature/ten-tinh-nang` hoặc `fix/ten-loi`).
3. Chạy bộ kiểm thử tự động tại `test/test_runner.js` để đảm bảo 100% các bài kiểm tra đều vượt qua mà không làm gãy các tính năng cũ.
4. Mở một **Pull Request (PR)** kèm mô tả rõ ràng để đội ngũ phụ trách thẩm định và sáp nhập vào dự án.
</details>

<details>
<summary><b>18. OpenRPGLoader có được M.A.P.L.E MAGI Labs cập nhật thường xuyên không?</b></summary>
<br>

**KHÔNG!** OpenRPGLoader được định hướng phát triển theo triết lý *"Feature-Complete"* (hoàn thiện trọn vẹn và tự vận hành bền bỉ lâu dài). 

Chúng tôi chủ trương giữ cho phần lõi luôn ổn định, tránh việc tung ra các bản cập nhật vụn vặt liên tục làm gãy tương thích của các bản mod cũ và gây phiền hà cho người chơi. Dự án sẽ chỉ phát hành bản cập nhật mới khi phát hiện lỗ hổng bảo mật nghiêm trọng hoặc khi nền tảng RPG Maker MZ có sự thay đổi cấu trúc mang tính bước ngoặt.
</details>

<details>
<summary><b>19. OpenRPGLoader có được tạo ra bởi Trí tuệ nhân tạo (A.I) không?</b></summary>
<br>

**CÓ!** Tuy vậy, chúng tôi chỉ **ỨNG DỤNG A.I** (như trợ lý Google Antigravity cùng các mô hình lập trình hiện đại) vào một số tác vụ nhất định như: tạo bản phác thảo mã nguồn, tối ưu hóa thuật toán và hỗ trợ viết bài kiểm thử tự động.

Đồng thời, **mọi dòng mã do A.I đề xuất đều đã được đội ngũ kỹ sư con người trực tiếp rà soát, tái cấu trúc và kiểm định thủ công**, kết hợp cùng bộ kiểm thử nghiêm ngặt đạt tỉ lệ chuẩn xác 100% để bảo đảm **KHÔNG bị lỗi** trước khi đến tay người dùng.
</details>

<details>
<summary><b>20. OpenRPGLoader có an toàn trước mã độc (malware, virus) không?</b></summary>
<br>

**Rất an toàn!** OpenRPGLoader tích hợp hệ thống **Safe-FS Sandbox** chặn đứng các hành vi nguy hiểm như tự ý ghi đè file hệ thống ngoài thư mục game (Path Traversal) và quét tĩnh cú pháp mod. Tuy nhiên, để đảm bảo an toàn tuyệt đối cho máy tính, bạn luôn nên tải mod từ các tác giả và nguồn cộng đồng đáng tin cậy.
</details>

<details>
<summary><b>21. OpenRPGLoader có thu thập dữ liệu cá nhân hay kết nối Internet ngầm không?</b></summary>
<br>

**Hoàn toàn KHÔNG!** OpenRPGLoader hoạt động 100% ngoại tuyến (offline), không tích hợp bất kỳ công cụ theo dõi hành vi (telemetry) nào, không thu thập thông tin thiết bị và không tự ý gửi bất kỳ gói tin nào ra mạng Internet. Sự riêng tư và an toàn dữ liệu của bạn luôn được đặt lên hàng đầu.
</details>

---

## 📜 Giấy Phép & Miễn Trừ Trách Nhiệm

* Dự án được phát hành hoàn toàn miễn phí dưới giấy phép **[MIT License](LICENSE)**. Tự do cho cộng đồng game thủ và các nhà sáng tạo nội dung.
* Vui lòng đọc kỹ toàn bộ ranh giới kỹ thuật và điều khoản miễn trừ trách nhiệm pháp lý chính thức tại: **[DISCLAIMER.md](DISCLAIMER.md)**.
* Dành cho modder và lập trình viên: Truy cập bộ tài liệu kỹ thuật chuẩn Diátaxis & Chromium tại: **[Dev Docs/README.md](Dev%20Docs/README.md)**.

---

<p align="center">
  <i>Chúc bạn có những giờ phút trải nghiệm game thật tuyệt vời cùng OpenRPGLoader! 🛡️✨</i>
</p>
