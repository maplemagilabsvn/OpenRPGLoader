# 🛡️ CHÀO MỪNG ĐẾN VỚI TÀI LIỆU NHÀ PHÁT TRIỂN OPENRPGLOADER
### *Hello to OpenRPGLoader Developer Document*

> [!IMPORTANT]
> **LƯU Ý QUAN TRỌNG**:  
> Toàn bộ hướng dẫn trong tài liệu này đều là **dạng tổng quát** (Generic Standard) nhằm mô tả cơ chế của nhân lõi mở `OpenRPGLoader`. Để đạt độ chính xác cao nhất cho từng dự án thực tế, vui lòng xem **CHI TIẾT TÀI LIỆU DÀNH CHO NHÀ PHÁT TRIỂN trên chính hệ thống Mod Loader mà bạn định tạo hoặc phát triển mod cho nó**.

---

## 🌟 1. Lời Ngỏ & Chào Mừng (Welcome Developers)

Chào mừng bạn đến với thế giới phát triển mod của **OpenRPGLoader**!

Nếu bạn đang đọc tài liệu này, bạn là một trong những nhà phát triển tiên phong chuẩn bị mở rộng tiềm năng vô tận của các tựa game xây dựng trên nền tảng **RPG Maker MZ** (môi trường NW.js). Dù mục tiêu của bạn là:
* **Một Modder**: Muốn bổ sung một nhiệm vụ cốt truyện mới, thêm trang bị kỹ năng độc đáo, thay đổi diện mạo nhân vật hay viết lại toàn bộ cơ chế chiến đấu;
* **Một Studio Game**: Muốn tích hợp sẵn một bộ nạp mod chuẩn mực, an toàn mang thương hiệu riêng của trò chơi vào dự án game của mình;

👉 **OpenRPGLoader được sinh ra để biến mọi ý tưởng đó thành hiện thực một cách an toàn, mượt mà và chuẩn mực nhất.**

---

## 📜 2. Tuyên Bố Bản Quyền & Tính Chất Dự Án

Để đảm bảo hệ sinh thái phát triển bền vững và tuân thủ các chuẩn mực pháp lý cũng như đạo đức cộng đồng, tất cả các nhà phát triển cần hiểu rõ và tôn trọng các nguyên tắc sau:

### 2.1. Tôn trọng quyền sở hữu trí tuệ của tác giả trò chơi gốc
- Toàn bộ nội dung của bất kỳ trò chơi nguyên bản nào — bao gồm cốt truyện, thế giới quan, nhân vật, hình ảnh đồ họa, âm nhạc, hiệu ứng âm thanh và mã nguồn gốc — là tài sản trí tuệ độc quyền của tác giả / nhà phát triển trò chơi đó.
- Mọi hoạt động phát triển mod phải luôn đặt sự tôn trọng cao nhất dành cho tác giả nguyên tác và tác phẩm gốc. Tuyệt đối không sao chép nguyên trạng tài nguyên có bản quyền để phân phối lại trái phép.

### 2.2. Tính chất độc lập của OpenRPGLoader
- **OpenRPGLoader** là một khung làm việc bộ nạp và quản lý bản mod độc lập, phi chính thức (Unofficial ModLoader Framework), do nhóm cộng đồng **M.A.P.L.E MAGI Labs** nghiên cứu và phát triển dưới dạng phần mềm nguồn mở.
- OpenRPGLoader **HOÀN TOÀN KHÔNG LIÊN KẾT**, không được tài trợ, ủy quyền hay đại diện cho bất kỳ nhà phát triển game cụ thể nào, cũng như không liên kết với Gotcha Gotcha Games Inc. hay KADOKAWA Corporation.

### 2.3. Chính sách thương mại hóa & Quy định khắt khe đối với bản mod / Loader thương mại

Nhân lõi **OpenRPGLoader** được phát hành dưới Giấy phép Nguồn mở **MIT License**. Về nguyên tắc kỹ thuật và bản quyền của OpenRPGLoader, chúng tôi **CHO PHÉP** việc thương mại hóa, bao gồm:
* Phát triển các bản mod thương mại (thu phí, gói tài trợ độc quyền qua Patreon/Ko-fi, bán qua itch.io/Gumroad).
* Kế thừa nhân `OpenRPGLoaderCore` để tạo ra các bộ nạp phái sinh mang tính thương mại (Commercial Derivative Loaders) tích hợp sẵn trong các tựa game thương mại phát hành trên Steam, itch.io, v.v.

> [!WARNING]
> #### ⚠️ CẢNH BÁO QUAN TRỌNG VỀ TÍNH ĐỘC LẬP CHÍNH SÁCH:
> **Việc OpenRPGLoader cho phép thương mại hóa TUYỆT ĐỐI KHÔNG ĐỒNG NGHĨA với việc mọi bản Loader phái sinh hay mọi tựa game đều đồng ý!**
> 
> * **Mỗi bản Loader phái sinh có thể có quy định bản quyền riêng**: Các bộ nạp do bên thứ ba hoặc studio game tạo ra dựa trên nhân này có toàn quyền áp dụng chính sách riêng biệt, bao gồm cả việc **nghiêm cấm thương mại hóa** hoặc thu phí đối với mod nạp vào game của họ.
> * **Mỗi tựa game gốc có thỏa thuận người dùng (EULA/ToS) riêng**: Nhiều nhà phát triển trò chơi nghiêm cấm hành vi kiếm tiền từ các sản phẩm liên quan đến tài sản trí tuệ của họ.
> * **Nghĩa vụ độc lập của bạn**: Bạn có trách nhiệm pháp lý độc lập phải tự tìm hiểu, xin phép và tuân thủ các điều khoản của **từng tựa game** và **từng bản Loader cụ thể** mà bạn nhắm tới. Sự chấp thuận từ phía OpenRPGLoader không có giá trị bảo hộ, ủy quyền hay thay thế cho thỏa thuận của các bên thứ ba.

#### ⚖️ 5 Chuẩn Mực Khắt Khe Bắt Buộc Khi Thương Mại Hóa:

Nếu bạn phát triển bản mod thương mại hoặc tạo ra bộ nạp (Loader) phái sinh mang tính thương mại, bạn **BẮT BUỘC** phải đáp ứng đầy đủ 5 tiêu chuẩn khắt khe sau:

1. **Nguyên tắc "Phòng Sạch" (Clean-Room) & Tuyệt đối không tái phân phối tài nguyên gốc**:
   - Bản mod hoặc Loader thương mại **tuyệt đối không được chứa, trích xuất, đóng gói lại hay phân phối lại** bất kỳ tệp tin, hình ảnh đồ họa, âm nhạc, kịch bản dữ liệu hay mã nguồn độc quyền nào của trò chơi gốc.
   - Toàn bộ nội dung thương mại phải là 100% tài sản trí tuệ do chính bạn tự sáng tạo từ đầu hoặc đã được chủ sở hữu quyền tác giả cấp phép bằng văn bản hợp lệ.
2. **Tuân thủ Thỏa thuận Người dùng (EULA/ToS) của Tựa Game Mục Tiêu**:
   - Bạn phải xác minh và đảm bảo rằng EULA của tựa game cho phép nội dung trả phí hoặc mở gây quỹ/quyên góp. Trường hợp tựa game có chính sách cấm mod thương mại, tác giả mod phải tự chịu hoàn toàn trách nhiệm và hậu quả pháp lý khi cố tình vi phạm.
3. **Tuân thủ Giấy phép Nguồn mở MIT License**:
   - Mọi sản phẩm kế thừa mã nguồn từ OpenRPGLoader/OpenRPGEngine phải giữ nguyên thông báo bản quyền gốc (*Copyright Notice*) của M.A.P.L.E MAGI Labs và toàn văn giấy phép MIT theo đúng quy định pháp luật sở hữu trí tuệ quốc tế.
4. **Trách nhiệm Độc lập Toàn diện (Pháp lý, Thuế, Khách hàng)**:
   - Đơn vị hoặc cá nhân phát hành sản phẩm thương mại là bên duy nhất chịu 100% trách nhiệm trước pháp luật, bao gồm nghĩa vụ thuế, chính sách giá, hoàn tiền, giải quyết khiếu nại và hỗ trợ kỹ thuật cho người mua.
   - **M.A.P.L.E MAGI Labs hoàn toàn vô can**, không tham gia chia sẻ lợi nhuận và không chịu bất kỳ trách nhiệm pháp lý liên đới nào.
5. **Chuẩn mực Kỹ thuật An toàn & Minh bạch Tuyệt đối**:
   - Sản phẩm thương mại tuyệt đối không được nhúng mã độc, trojan, spyware, adware, ransomware hay bất kỳ thành phần ẩn nào gây tổn hại đến hệ thống máy tính của người dùng.
   - Nghiêm cấm các cơ chế bảo vệ bản quyền (DRM) tiêu cực mang tính phá hoại, can thiệp sâu vào nhân hệ điều hành hoặc xung đột với cơ chế cách ly của OpenRPGEngine Sandbox.

### 2.4. Miễn trừ trách nhiệm (Disclaimer)
- Đội ngũ M.A.P.L.E MAGI Labs cung cấp nền tảng kỹ thuật và các hàng rào bảo vệ chủ động (*Safe Hooks, Circuit Breaker, Save Shield, Safe-FS Sandbox*) để giảm thiểu tối đa rủi ro xảy ra lỗi cho người chơi.
- Tuy nhiên, chúng tôi không chịu trách nhiệm pháp lý hoặc kỹ thuật đối với bất kỳ sự cố mất mát dữ liệu, lỗi phần cứng hay tranh chấp nào phát sinh do bản mod của bên thứ ba được lập trình cẩu thả hoặc cố tình chèn mã độc. Trách nhiệm về nội dung và hành vi hoàn toàn thuộc về tác giả của bản mod đó.

### 2.5. Chính sách & Điều khoản về việc sử dụng Trí tuệ Nhân tạo (A.I Policy - ĐƯỢC PHÉP)

Nhóm phát triển M.A.P.L.E MAGI Labs **HOÀN TOÀN ỦNG HỘ, CHO PHÉP VÀ KHUYẾN KHÍCH** việc ứng dụng Trí tuệ Nhân tạo (A.I) trong quá trình nghiên cứu, xây dựng bản mod cũng như phát triển các bộ nạp phái sinh (Derivative Loaders). 

Bản thân dự án OpenRPGLoader cũng đã tiên phong ứng dụng các công cụ A.I hiện đại (như trợ lý Google Antigravity) để hỗ trợ viết mã và xây dựng bộ kiểm thử tự động. Tuy nhiên, để đảm bảo tính an toàn và chất lượng cao nhất cho cộng đồng người chơi, mọi nhà phát triển ứng dụng A.I cần tuân thủ các chuẩn mực sau:

* **Nguyên tắc "Human-in-the-Loop" (Con người kiểm soát tối hậu)**:
  A.I là trợ thủ đắc lực giúp bạn tăng tốc độ lập trình, nhưng **con người phải là người chịu trách nhiệm cuối cùng**. Mọi dòng mã hoặc tài nguyên do A.I tạo ra bắt buộc phải được nhà phát triển trực tiếp đọc hiểu, rà soát logic và kiểm thử thực tế kỹ lưỡng trước khi đóng gói phát hành.
* **Nghiêm cấm phát hành mã ảo / mã rác (AI Hallucination)**:
  Tuyệt đối không phát hành các bản mod được tạo ra hoàn toàn từ mã nguồn do A.I sinh ngẫu nhiên mà chưa qua kiểm định thực tế, gây sập game (crash), hỏng file save hoặc làm giảm sút trải nghiệm của người chơi.
* **Trách nhiệm pháp lý về bản quyền dữ liệu**:
  Nhà phát triển tự chịu trách nhiệm 100% về tính hợp pháp của các tài sản (hình ảnh, âm thanh, giọng nói nhân vật, văn bản) được tạo bởi các mô hình sinh (Generative AI), đảm bảo không vi phạm quyền sở hữu trí tuệ hoặc chính sách bản quyền của dữ liệu huấn luyện.
* **Cấm triệt để việc dùng A.I tạo mã độc**:
  Nghiêm cấm việc lợi dụng các mô hình A.I để viết mã độc, script ẩn, backdoor đánh cắp dữ liệu, hoặc tạo ra các cơ chế vượt quyền nhằm phá hoại môi trường Sandbox của OpenRPGEngine.

---

## 🛠️ 3. Bạn Cần Gì Để Bắt Đầu Phát Triển?

Việc phát triển trên OpenRPGLoader rất linh hoạt. Tùy thuộc vào loại nội dung bạn muốn đóng góp, bạn sẽ cần các nhóm kỹ năng tương ứng:

### 3.1. Nếu bạn làm Mod Tính Năng & Cơ Chế Game (Code/Logic Mods)
* **Kiến thức**: Lập trình **JavaScript (ES6+)** và môi trường runtime **Node.js / NW.js**.
* **Hiểu biết engine**: Nắm cách tổ chức dữ liệu toàn cục RPG Maker MZ (`$dataItems`, `$dataSkills`, `$gameParty`, `$gameVariables`), các lớp giao diện và vòng lặp màn chơi (`Scene_...`, `Window_...`).
* **Kỹ năng**: Sử dụng Safe Hook Pipeline (`Forge.hook`), lắng nghe sự kiện (`Forge.on`) và vá dữ liệu chuẩn RFC 6902 JSON-Patch.

### 3.2. Nếu bạn làm Mod Đồ Họa & Giao Diện (Visual / Skin / UI Mods)
* **Kỹ năng**: Vẽ sprite nhân vật (spritesheet), biểu cảm (facesets), ảnh minh họa (pictures), hoặc thiết kế icon.
* **Quy chuẩn định dạng**: Tệp ảnh `.png` tiêu chuẩn của RPG Maker MZ.
* **Cơ chế**: Sử dụng cơ chế **Virtual Asset Replacement** — chỉ cần đặt file ảnh vào thư mục `img/` của mod là game tự động nhận diện, không cần viết 1 dòng code!

### 3.3. Nếu bạn làm Mod Âm Thanh & Âm Nhạc (Audio Mods)
* **Kỹ năng**: Sáng tác nhạc nền (BGM), nhạc sự kiện (ME) hoặc hiệu ứng âm thanh (SE).
* **Định dạng tệp**: Chuẩn nén âm thanh `.ogg` hoặc `.m4a`. Đặt vào thư mục `audio/` của mod.

### 3.4. Nếu bạn là Studio muốn tạo Biến Thể Mod Loader Riêng (Derivative Loader)
* **Kỹ năng**: Lập trình hướng đối tượng JavaScript (OOP / Class Inheritance).
* **Cơ chế**: Kế thừa `class MyGameLoader extends OpenRPGLoaderCore` trong ~30 dòng mã, tinh chỉnh Feature Toggles, đặt Pluggable Policy và nhúng Domain API của trò chơi.

---

## 🧭 4. Lộ Trình Đọc Tài Liệu Tiếp Theo

Bộ tài liệu được tổ chức theo tiêu chuẩn **Diátaxis Framework & Chromium**:

1. **Người mới bắt đầu thực hành ngay (5 phút)**:  
   👉 [**01. Tạo Bản Mod Đầu Tiên (Hello World Mod)**](01_Getting_Started/01_Hello_World_Mod.md)
2. **Dành cho studio muốn tạo Loader riêng (10 phút)**:  
   👉 [**02. Tạo Bản Mod Loader Phái Sinh Cho Tựa Game Của Bạn**](01_Getting_Started/02_Quickstart_Custom_Loader.md)
3. **Tìm hiểu kiến trúc ngầm và các lớp phòng vệ**:  
   👉 [**01. Kiến Trúc Hai Tầng Phong Cách Chromium**](02_Core_Concepts/01_Two_Tier_Chromium_Architecture.md)  
   👉 [**03. Bộ Ba Cơ Chế Phòng Vệ Chủ Động (Circuit Breaker, Safe-FS, Save Shield)**](02_Core_Concepts/03_Defensive_Mechanisms.md)
4. **Tra cứu kỹ thuật chính xác**:  
   👉 [**Bản Đồ Chỉ Mục Đầy Đủ (Dev Docs Index)**](README.md)

---

## ❓ 5. Câu Hỏi Thường Gặp Dành Cho Nhà Phát Triển (Developer FAQ)

<details>
<summary><b>1. Tôi có thể sử dụng A.I (như Google Antigravity, ChatGPT, Claude, Cursor) để viết mã mod hoặc tạo Loader không?</b></summary>
<br>

**CÓ, HOÀN TOÀN ĐƯỢC PHÉP VÀ ĐƯỢC KHUYẾN KHÍCH!** Chúng tôi rất ủng hộ bạn tận dụng sức mạnh của các mô hình ngôn ngữ lớn để gia tăng hiệu suất lập trình. Tuy nhiên, theo quy định tại [Mục 2.5](#25-chính-sách--điều-khoản-về-việc-sử-dụng-trí-tuệ-nhân-tạo-ai-policy---được-phép), bạn bắt buộc phải là người trực tiếp đọc hiểu, rà soát logic và chạy kiểm thử thực tế. Bạn chịu 100% trách nhiệm về sự ổn định và an toàn của mã nguồn trước người chơi.
</details>

<details>
<summary><b>2. Tôi có thể kiếm tiền từ bản mod hoặc bộ nạp phái sinh do A.I hỗ trợ tạo ra không?</b></summary>
<br>

**ĐƯỢC PHÉP**, với điều kiện sản phẩm của bạn phải đáp ứng đầy đủ **5 chuẩn mực khắt khe** tại [Mục 2.3](#23-chính-sách-thương-mại-hóa--quy-định-khắt-khe-đối-với-bản-mod--loader-thương-mại). Bạn phải đảm bảo rằng không vi phạm thỏa thuận người dùng (EULA) của tựa game gốc, không đóng gói tài nguyên game có bản quyền và tự chịu trách nhiệm về bản quyền của dữ liệu do A.I sinh ra.
</details>

<details>
<summary><b>3. Khi nào tôi nên tạo một bản Mod thông thường và khi nào nên kế thừa tạo Bộ nạp phái sinh (Derivative Loader)?</b></summary>
<br>

* **Tạo Bản Mod (Game Mod)**: Khi bạn muốn bổ sung nội dung cho một tựa game cụ thể (thêm nhiệm vụ cốt truyện, vũ khí mới, cân bằng kỹ năng, thay đổi đồ họa hay âm thanh).
* **Tạo Bộ nạp phái sinh (Derivative Loader)**: Khi bạn là studio game phát triển một tựa game thương mại và muốn tích hợp sẵn hệ thống mod mang thương hiệu của mình, hoặc khi bạn muốn mở rộng `OpenRPGLoaderCore` để cung cấp các API nghiệp vụ riêng (Domain Game APIs) cho cộng đồng modder của game đó.
</details>

<details>
<summary><b>4. Tôi có cần xin phép M.A.P.L.E MAGI Labs trước khi phát hành mod hoặc bộ nạp phái sinh không?</b></summary>
<br>

**KHÔNG CẦN.** OpenRPGLoader được cấp phép theo chuẩn nguồn mở **MIT License**. Bạn có toàn quyền sử dụng, sửa đổi, phân phối và tích hợp vào sản phẩm của mình mà không cần xin phép trước. Yêu cầu duy nhất là bạn phải giữ nguyên dòng thông báo bản quyền gốc (*Copyright Notice*) của M.A.P.L.E MAGI Labs trong tệp mã nguồn.
</details>

<details>
<summary><b>5. Tôi là người mới và chưa từng lập trình JavaScript hay RPG Maker MZ thì nên bắt đầu từ đâu?</b></summary>
<br>

Hãy bắt đầu ngay với bài hướng dẫn thực hành nhanh:  
👉 [**01. Tạo Bản Mod Đầu Tiên (Hello World Mod) trong 5 Phút**](01_Getting_Started/01_Hello_World_Mod.md)  
Bạn không cần phải hiểu toàn bộ engine ngay lập tức; chỉ cần làm theo từng bước để tạo ra bản mod đầu tiên chạy được trên màn hình game, sau đó tiếp tục tìm hiểu cơ chế can thiệp an toàn tại [A2. Hook An Toàn Vào Lớp Logic Game (Safe Hook Pipeline)](03_How_To_Guides/PART_A_MOD_DEVELOPMENT/02_Hook_Game_Methods_Safely.md).
</details>

<details>
<summary><b>6. Làm thế nào để đảm bảo bản mod của tôi không làm hỏng dữ liệu save của người chơi?</b></summary>
<br>

* **Tuyệt đối không ghi đè trực tiếp các file JSON gốc trong `data/`**: Hãy sử dụng cơ chế **RFC 6902 JSON-Patch** (`data/*.patch.json`) do OpenRPGEngine cung cấp.
* **Tận dụng Save Shield**: OpenRPGEngine đã tích hợp sẵn cơ chế *Save Shield* tự động cách ly và khử trùng các ID vật phẩm/kỹ năng mồ côi nếu người chơi gỡ cài đặt mod, giúp file save không bị lỗi khi nạp lại.
</details>

<details>
<summary><b>7. M.A.P.L.E MAGI Labs có hỗ trợ kỹ thuật hoặc sửa lỗi trực tiếp (1-on-1) cho dự án của tôi không?</b></summary>
<br>

**KHÔNG.** Dự án được cung cấp theo nguyên tắc nguồn mở nguyên trạng (*"AS IS"*). Toàn bộ kiến trúc, mã nguồn, đặc tả kỹ thuật và bài tập mẫu đã được trình bày chi tiết trong bộ tài liệu [`Dev Docs`](README.md). Các nhà phát triển được khuyến khích trao đổi, học hỏi và đóng góp thông qua cộng đồng mã nguồn mở.
</details>

<details>
<summary><b>8. Hướng dẫn trong tài liệu này có áp dụng chính xác 100% cho mọi bản Mod Loader phái sinh không?</b></summary>
<br>

**LƯU Ý:** Toàn bộ hướng dẫn trong bộ tài liệu này đều là **dạng tổng quát** (Generic Standard) nhằm mô tả cơ chế của nhân lõi mở `OpenRPGLoader`. Mỗi bản Mod Loader phái sinh hoặc tựa game cụ thể có thể bổ sung các API nghiệp vụ riêng, siết chặt các chốt chặn bảo mật hoặc thay đổi cấu trúc thư mục. Để đạt độ chính xác cao nhất, **vui lòng xem CHI TIẾT TÀI LIỆU DÀNH CHO NHÀ PHÁT TRIỂN trên chính hệ thống Mod Loader mà bạn định tạo hoặc phát triển mod cho nó**.
</details>

<details>
<summary><b>9. Tôi muốn tạo tệp cài đặt tự động (Installer / File Setup) cho Bộ nạp phái sinh (Derivative Mod Loader) thì làm thế nào?</b></summary>
<br>

Bộ cài đặt tự động (Installer) cho phép người chơi tích hợp bộ nạp phái sinh của bạn vào game chỉ bằng một cú nhấp chuột mà không cần mở mã nguồn sửa thủ công `js/plugins.js`.

👉 Vui lòng xem toàn bộ kiến trúc và mã nguồn mẫu tại:  
[**B5. Xây Dựng Trình Cài Đặt Bộ Nạp Tự Động (Installer / Setup Wizard)**](03_How_To_Guides/PART_B_DERIVATIVE_LOADERS/05_Building_Installer_And_Setup.md)  
*(Bao gồm: Kỹ thuật tiêm an toàn vào `js/plugins.js`, cơ chế sao lưu nguyên tử `plugins.js.bak`, tự động hoàn tác khi có lỗi, kịch bản 1-Click Batch và đóng gói tệp cài đặt đồ họa chuyên nghiệp bằng Inno Setup).*
</details>

---

<p align="center">
  <i>Chúc bạn có những trải nghiệm sáng tạo thật thú vị và đột phá cùng OpenRPGLoader! 🛡️✨</i>
</p>
