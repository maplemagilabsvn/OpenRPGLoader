# OPENRPGLOADER — ĐIỀU KHOẢN MIỄN TRỪ TRÁCH NHIỆM VÀ GIỚI HẠN PHẠM VI DỰ ÁN
*(DISCLAIMER & LIMITATION OF LIABILITY)*

Văn bản này quy định chính sách phân phối, phạm vi kỹ thuật, phân định ranh giới trách nhiệm pháp lý và các giới hạn bồi thường đối với phần mềm **OpenRPGLoader** (bao gồm tầng nhân lõi **OpenRPGEngine** và bộ nạp giao diện **OpenRPGLoaderCore**).

OpenRPGLoader do **M.A.P.L.E MAGI Labs** nghiên cứu và phát triển độc lập, được thiết kế dưới dạng khung làm việc nạp tiện ích mở rộng (Mod Loader Framework) độc lập và tổng quát, tương thích với các trò chơi phát triển trên nền tảng engine **RPG Maker MZ** và môi trường runtime **NW.js**.

Tài liệu này được ban hành chính thức bằng **Tiếng Việt** dưới dạng tài liệu kỹ thuật và căn cứ pháp lý tối cao của dự án.

> **THÔNG BÁO QUAN TRỌNG:** Tài liệu này cung cấp thông tin chung về ranh giới kỹ thuật và giới hạn trách nhiệm của dự án mã nguồn mở, **không cấu thành lời khuyên pháp lý chuyên nghiệp**. 

---

## Thỏa thuận người dùng và Cơ chế suy đoán đồng ý (Deemed Acceptance)

1. **Hiệu lực ràng buộc:** Bằng việc tải về, giải nén, cài đặt, lưu trữ, tích hợp, nạp mod, kế thừa mã nguồn (fork/subclass) hoặc khởi chạy **OpenRPGLoader**, bạn xác nhận đã đọc, hiểu và hoàn toàn **ĐỒNG Ý VÔ ĐIỀU KIỆN** với toàn bộ các điều khoản miễn trừ trách nhiệm trong văn bản này.
2. **Nghĩa vụ khi không đồng ý:** Trong trường hợp bạn **KHÔNG ĐỒNG Ý**, bạn **CÓ NGHĨA VỤ NGAY LẬP TỨC** ngừng sử dụng, ngừng tích hợp và xóa bỏ hoàn toàn toàn bộ tệp tin của OpenRPGLoader khỏi thiết bị máy tính hoặc dự án trò chơi của bạn.
3. **Cơ chế suy đoán đồng ý:** Mọi hành vi tuyên bố không đồng ý nhưng vẫn **CỐ TÌNH (HOẶC VÔ TÌNH)** tiếp tục lưu giữ tệp tin, tích hợp vào mã nguồn game, cài đặt mod hoặc khởi chạy OpenRPGLoader đều được tính là bạn đã đương nhiên chấp thuận toàn bộ điều khoản này.
4. **Cập nhật qua các phiên bản:** Điều khoản có thể được cập nhật theo từng phiên bản phát hành của OpenRPGLoader. Người dùng và nhà phát triển phái sinh có nghĩa vụ tự kiểm tra nội dung cập nhật trước khi tiếp tục tải về hoặc sử dụng bản mới.

---

## 1. Ngôn ngữ chính thức và Thứ bậc áp dụng giải thích tối cao

1. **Ngôn ngữ tối cao (Authoritative Language):** Toàn bộ tài liệu chính thức, thông số kỹ thuật và các điều khoản do M.A.P.L.E MAGI Labs ban hành được soạn thảo và có hiệu lực cao nhất bằng **Tiếng Việt**.
2. **Bản dịch không chính thức:** Mọi bản dịch sang ngôn ngữ khác (kể cả Tiếng Anh) chỉ mang tính chất tham khảo, không có giá trị pháp lý thay thế bản gốc Tiếng Việt. M.A.P.L.E MAGI Labs không chịu trách nhiệm về sai sót dịch thuật hoặc hiểu nhầm ngữ nghĩa. Trong mọi trường hợp có sự khác biệt hoặc tranh chấp giải thích, **bản Tiếng Việt là căn cứ duy nhất và có giá trị quyết định cuối cùng**.
3. **Giấy phép phần mềm:** Mã nguồn OpenRPGLoader được phân phối theo giấy phép mã nguồn mở trong tệp `LICENSE` (Giấy phép MIT). Bản dịch hoặc tóm tắt giấy phép không thay thế văn bản gốc.

---

## 2. Bản chất kỹ thuật và Cơ chế nạp bộ nhớ RAM (In-Memory Hooking)

**OpenRPGLoader** là một khung nạp tiện ích (runtime loader) độc lập, hoạt động bằng cách nạp động kịch bản JavaScript và vá dữ liệu tạm thời (RFC 6902 JSON-Patch) vào chu trình chạy của trò chơi trong bộ nhớ RAM môi trường NW.js.

Người dùng và nhà phát triển cần nhận thức rõ các giới hạn cố hữu:
1. **Không phải trò chơi và không chứa tài nguyên trò chơi:** OpenRPGLoader không chứa mã nguồn, dữ liệu cốt truyện, bản đồ, đồ họa hay âm thanh nguyên tác của bất kỳ tựa game cụ thể nào.
2. **Không chỉnh sửa vĩnh viễn tệp gốc:** OpenRPGLoader không can thiệp ghi đè hay làm sai lệch vĩnh viễn các tệp dữ liệu lưu trữ gốc trên ổ đĩa của trò chơi.
3. **Không phải công cụ phá hoại bản quyền:** Phần mềm được tạo ra vì mục đích nghiên cứu kỹ thuật, hỗ trợ dịch thuật, tăng cường tính năng và giải trí cá nhân hợp pháp; tuyệt đối **không được thiết kế để bẻ khóa bản quyền (DRM bypass), vượt qua cơ chế chống gian lận (anti-cheat)** hay hỗ trợ các hành vi phá hoại thương mại.
4. **Giới hạn của các công nghệ bảo vệ tích hợp:** Dù OpenRPGLoader tích hợp nhiều lớp phòng vệ chủ động (*Save Shield* dọn dẹp dữ liệu mồ côi, *Circuit Breaker* ngắt mod lỗi trong vòng lặp game, *Safe-FS Sandbox* chặn path traversal và *Audit Pipeline* kiểm định tĩnh), các cơ chế này được thiết kế theo nguyên tắc nỗ lực tối đa (best-effort) nhằm giảm thiểu rủi ro, **không cấu thành sự bảo đảm an toàn tuyệt đối 100%** trước mọi kịch bản lỗi logic phức tạp hoặc mã độc có chủ đích từ bên thứ ba.

---

## 3. Tuyên bố phi liên kết và Bảo vệ quyền sở hữu trí tuệ của bên thứ ba

1. **Phi liên kết với các nhà phát triển và nhà phát hành game:** OpenRPGLoader là dự án mã nguồn mở độc lập của M.A.P.L.E MAGI Labs, **hoàn toàn không được tài trợ, ủy quyền, chứng thực hoặc có bất kỳ mối liên hệ chính thức nào với bất kỳ nhà phát triển, họa sĩ, biên kịch hay nhà phát hành của bất kỳ tựa game cụ thể nào**.
2. **Bảo vệ tuyệt đối các tác giả trò chơi khỏi khiếu nại kỹ thuật do mod:**
   - Các tác giả và nhà phát hành trò chơi không phát triển và không chịu bất kỳ trách nhiệm nào về OpenRPGLoader hay các bản mod bên ngoài.
   - Khi trò chơi phát sinh lỗi, crash hoặc hỏng dữ liệu do sử dụng OpenRPGLoader hoặc mod, **người dùng tuyệt đối không gửi báo cáo lỗi, không đòi hỏi hỗ trợ và không làm phiền tác giả trò chơi gốc**. Mọi vấn đề kỹ thuật phải được chuyển về trang cộng đồng hoặc kho lưu trữ của OpenRPGLoader / tác giả mod tương ứng.
3. **Phi liên kết với chủ sở hữu Engine và Runtime:** OpenRPGLoader không liên kết, không thuộc quyền sở hữu và không đại diện cho Gotcha Gotcha Games Inc., KADOKAWA Corporation, The Chromium Project, hay đội ngũ phát triển NW.js / Node.js.
4. **Tôn trọng quyền sở hữu trí tuệ:** Toàn bộ nhãn hiệu, tên trò chơi, nhân vật, hình ảnh đồ họa, âm nhạc và kịch bản thuộc về chủ sở hữu hợp pháp tương ứng của từng tựa game. Bản phân phối chuẩn của OpenRPGLoader tuyệt đối không chứa hay phân phối lại bất kỳ tệp dữ liệu có bản quyền nào của bên thứ ba.

---

## 4. Kiến trúc nhân mở và Miễn trừ trách nhiệm đối với các biến thể phái sinh (Third-Party Derivatives & Forks)

1. **Kiến trúc tựa Chromium:** OpenRPGLoader được thiết kế theo mô hình nhân mở hai tầng (Layer 1: `OpenRPGEngine` không phụ thuộc giao diện; Layer 2: `OpenRPGLoaderCore` mở rộng), cho phép bên thứ ba tự do kế thừa (subclassing), tinh chỉnh chốt chặn (Feature Toggles), thay đổi chính sách bảo mật (Pluggable Policies) và tạo ra bản Mod Loader riêng biệt cho tựa game của họ.
2. **Trách nhiệm độc lập của bên thứ ba tạo bản phái sinh:**
   - M.A.P.L.E MAGI Labs chỉ duy trì và chịu trách nhiệm trong phạm vi mã nguồn gốc do chính chúng tôi phát hành.
   - Bất kỳ cá nhân, nhóm phát triển hoặc tổ chức nào kế thừa mã nguồn để tạo ra bản phân phối mới (Custom Derivative Mod Loader), sửa đổi chốt chặn bảo mật, nhúng thêm API riêng hoặc đóng gói kèm theo trò chơi thương mại thì **bên thứ ba đó là bên duy nhất chịu trách nhiệm kỹ thuật, pháp lý và bảo hành trước người dùng của họ**.
3. **M.A.P.L.E MAGI Labs hoàn toàn vô can:**
   - M.A.P.L.E MAGI Labs **KHÔNG CHỊU BẤT KỲ TRÁCH NHIỆM NÀO** về các bản phái sinh, bản fork, hoặc biến thể do bên thứ ba tạo ra.
   - Trong trường hợp xảy ra bất kỳ sự cố, tranh chấp pháp lý, xung đột bản quyền hoặc tổn hại nào phát sinh từ bản Mod Loader phái sinh của bên thứ ba, **M.A.P.L.E MAGI Labs HOÀN TOÀN VÔ CAN** và không có nghĩa vụ phải giải quyết, hòa giải hay bồi thường.

---

## 5. Mod và các Mod Loader phái sinh của bên thứ ba: Tính độc lập điều khoản, Nghĩa vụ người dùng và M.A.P.L.E MAGI Labs hoàn toàn vô can

1. **Tính độc lập của điều khoản:** Văn bản này **CHỈ CÓ TÁC DỤNG VỚI BẢN PHÂN PHỐI GỐC OPENRPGLOADER CHÍNH THỨC CỦA M.A.P.L.E MAGI LABS**. Văn bản này hoàn toàn **KHÔNG PHẢI là điều khoản chung và KHÔNG ÁP DỤNG MẶC ĐỊNH CHO**:
   - Toàn bộ các bản mod của bên thứ ba;
   - **Toàn bộ các bản Mod Loader khác / bản phái sinh / bản tái bản (Derivative Mod Loaders / Custom Loaders) DỰA TRÊN nhân này!**  
   Mỗi bản mod cũng như mỗi bản Mod Loader phái sinh (được xây dựng, tùy biến hoặc phân nhánh dựa trên nhân OpenRPGEngine / OpenRPGLoaderCore) đều có thể có điều khoản sử dụng, chính sách bản quyền, cơ chế cấp phép và giới hạn trách nhiệm riêng do chính tác giả/nhà phát triển của bản mod hoặc bản loader đó tự ban hành; người dùng có nghĩa vụ tự đọc, tự kiểm tra và tuân thủ các quy định từ tác giả của từng bản mod và từng bản loader đó.
2. **Nghĩa vụ tự kiểm tra của người dùng:** Người dùng tự chịu trách nhiệm hoàn toàn đối với việc tìm kiếm, lựa chọn, quét virus và cài đặt các bản mod cũng như các bản Mod Loader phái sinh của bên thứ ba vào trò chơi.
3. **Trách nhiệm thuộc về người tạo mod và người tạo loader phái sinh:** Đơn vị hoặc cá nhân tạo ra bản mod hoặc bản Mod Loader phái sinh là bên duy nhất chịu trách nhiệm kỹ thuật và pháp lý đối với nội dung, tính tương thích và tác động của sản phẩm đó.
4. **M.A.P.L.E MAGI Labs hoàn toàn vô can:**
   - M.A.P.L.E MAGI Labs **KHÔNG CHỊU BẤT KỲ TRÁCH NHIỆM NÀO** về các bản mod cũng như các bản Mod Loader phái sinh dựa trên nhân này do cộng đồng hoặc bên thứ ba phát triển.
   - Trong trường hợp xảy ra **BẤT KỲ TRANH CHẤP NÀO GIỮA BÊN PHÁT TRIỂN MOD / BÊN TẠO LOADER PHÁI SINH VÀ NGƯỜI DÙNG** (tranh chấp bản quyền, thu phí, hư hỏng thiết bị, mã độc, xung đột dữ liệu...), **M.A.P.L.E MAGI Labs HOÀN TOÀN VÔ CAN** và không có nghĩa vụ phải can thiệp, hòa giải hay chịu trách nhiệm liên đới.
5. **Độ tuổi và nội dung nhạy cảm:** Người dùng **tự chịu trách nhiệm về độ tuổi và có nghĩa vụ kiểm tra kỹ nội dung** trước khi tải các bản mod hoặc bản loader phái sinh có yếu tố 18+, kinh dị, bạo lực hoặc nhạy cảm.

---

## 6. Giới hạn kỹ thuật, Rủi ro an ninh mạng và Trách nhiệm dữ liệu

1. **Rủi ro đặc quyền NW.js và Mã độc bên thứ ba:**
   Các trò chơi chạy trên môi trường NW.js sở hữu quyền truy cập trực tiếp vào hệ thống tệp và các thư viện môi trường cấp thấp (`fs`, `child_process`). Mặc dù OpenRPGLoader trang bị hệ thống *Safe-FS* và *Audit System*, việc người dùng cố ý vượt qua chốt chặn (`bypassAudit`, cấp quyền `child_process:exec` hoặc nạp mod từ nguồn độc hại) vẫn có thể dẫn đến nguy cơ bị thực thi mã độc tùy ý (Arbitrary Code Execution), virus hoặc ransomware. Người dùng tự chịu mọi rủi ro an ninh khi nạp các bản mod không rõ nguồn gốc.
2. **Bảo toàn dữ liệu lưu trữ (Save Data):**
   Mặc dù OpenRPGLoader sở hữu tính năng *Save Shield* chủ động thanh lọc các định danh mồ côi khi gỡ mod, việc người dùng cài đặt đồng thời nhiều bản mod ghi đè sâu vào biến số trò chơi vẫn tiềm ẩn khả năng gây **hỏng tệp lưu (`.rpgsave`)** hoặc kẹt tiến trình cốt truyện (softlock). Người dùng có nghĩa vụ **tự sao lưu định kỳ thư mục `save/`**; M.A.P.L.E MAGI Labs không chịu trách nhiệm phục hồi dữ liệu bị hỏng.
3. **Gián đoạn phát sóng và Sự cố phần cứng:**
   M.A.P.L.E MAGI Labs miễn trừ trách nhiệm đối với việc buổi phát trực tiếp (live stream) bị gián đoạn, kênh bị cấm/đánh gậy bản quyền do nội dung của mod, lỗi sập game khi đang thi đấu, hoặc các sự cố tràn RAM, xung đột driver đồ họa trong quá trình chơi game có nạp mod.
4. **Cam kết không thu thập dữ liệu (No Telemetry):**
   OpenRPGLoader hoạt động hoàn toàn cục bộ (offline/local), tuyệt đối không chứa mã theo dõi hành vi, không thu thập thông tin thiết bị và không tự ý truyền tải dữ liệu cá nhân ra ngoài mạng Internet, tuân thủ chặt chẽ **Nghị định 13/2023/NĐ-CP** của Việt Nam và các tiêu chuẩn bảo vệ quyền riêng tư quốc tế.

---

## 7. Cơ sở pháp lý về Kỹ thuật tương thích liên thông phần mềm

Dự án OpenRPGLoader được xây dựng và phân phối dựa trên các quyền ngoại lệ công nghệ hợp pháp về tính tương thích liên thông, áp dụng song song giữa pháp luật Việt Nam và các công ước quốc tế:
- **Việt Nam (Điều 20, Điều 25 và Điều 25a Luật Sở hữu trí tuệ 2005, sửa đổi bổ sung 2022):** Cho phép các trường hợp ngoại lệ không xâm phạm quyền tác giả đối với việc nghiên cứu khoa học, giảng dạy, làm thích ứng và bảo đảm khả năng tương thích liên thông (interoperability) giữa các chương trình máy tính độc lập phục vụ mục đích sử dụng cá nhân, không nhằm mục đích sao chép cạnh tranh thương mại bất chính.
- **Hoa Kỳ (17 U.S.C. § 107 Fair Use & 17 U.S.C. § 1201(f) DMCA):** Án lệ kinh điển *Lewis Galoob Toys, Inc. v. Nintendo of America, Inc. (964 F.2d 965 - 9th Cir. 1992)* thừa nhận việc can thiệp logic dữ liệu tạm thời vào bộ nhớ RAM khi người dùng chơi game là hợp pháp và không cấu thành việc tạo tác phẩm phái sinh vi phạm bản quyền nếu không sao chép lại mã nguồn game. Điều khoản 1201(f) của DMCA cũng bảo vệ quyền dịch ngược và thích ứng hợp pháp nhằm đạt được tính tương thích liên thông phần mềm.
- **Liên minh Châu Âu (Chỉ thị 2009/24/EC Điều 5(3) và Điều 6):** Quy định rõ ràng quyền của người sử dụng hợp pháp trong việc quan sát, nghiên cứu, kiểm thử hoạt động của chương trình máy tính và thực hiện các biện pháp kỹ thuật cần thiết để đạt được tính tương thích giữa các phần mềm độc lập.

---

## 8. Minh bạch về việc ứng dụng Trí tuệ nhân tạo (A.I Disclosure)

1. **Ứng dụng A.I có kiểm soát:** M.A.P.L.E MAGI Labs minh bạch tuyên bố rằng dự án có thể ứng dụng các công cụ Trí tuệ nhân tạo tiên tiến (chẳng hạn như Google Antigravity và các mô hình hỗ trợ phát triển phần mềm hiện đại) vào một số tác vụ như: phác thảo cấu trúc mã nguồn, tối ưu hóa giải thuật toán học và hỗ trợ soạn thảo các bài kiểm thử tự động.
2. **Thẩm định bởi con người:** Toàn bộ kiến trúc an toàn, các chốt chặn kiểm soát và mã nguồn cuối cùng đều đã trải qua quy trình rà soát, tái cấu trúc và xác thực thực tế nghiêm ngặt bởi đội ngũ kỹ sư con người, kết hợp cùng bộ kiểm thử tự động nhằm đảm bảo tính ổn định và loại bỏ lỗi logic trước khi phát hành.
3. **Không thay đổi nguyên tắc AS IS:** Việc ứng dụng A.I không làm thay đổi nguyên tắc cung cấp phần mềm theo trạng thái "NGUYÊN TRẠNG" (AS IS); người dùng vẫn phải tự thẩm định khi tích hợp vào môi trường sản phẩm thực tế.

---

## 9. Điều khoản Bồi hoàn và Giữ cho vô hại (Indemnification & Hold Harmless)

Bằng việc sử dụng hoặc tích hợp OpenRPGLoader, bạn đồng ý sẽ **bảo vệ, bồi hoàn và giữ cho M.A.P.L.E MAGI Labs**, các thành viên sáng lập, lập trình viên và cộng tác viên **HOÀN TOÀN KHÔNG BỊ TỔN HẠI** trước mọi khiếu nại, khiếu kiện, yêu cầu bồi thường, tổn thất, phán quyết và chi phí pháp lý (bao gồm phí luật sư hợp lý) phát sinh từ hoặc có liên quan đến:
1. Hành vi bạn vi phạm bất kỳ điều khoản nào trong văn bản này;
2. Bất kỳ bản mod hoặc bản Mod Loader phái sinh nào bạn tạo ra, phân phối hoặc tích hợp gây thiệt hại cho bên thứ ba;
3. Bất kỳ tranh chấp nào giữa bạn và các tác giả trò chơi, nhà phát hành engine hoặc bất kỳ bên thứ ba nào khác.

---

## 10. Phân phối, Nhãn hiệu và Không cam kết bảo trì định kỳ

1. **Quyền phân phối lại:** Các bản phân nhánh (fork) hoặc chia sẻ lại mã nguồn phải giữ nguyên thông báo bản quyền gốc, điều khoản giấy phép MIT và văn bản miễn trừ trách nhiệm này; đồng thời phải ghi chú rõ ràng đây là bản phái sinh không chính thức. Tuyệt đối không đóng gói kèm dữ liệu có bản quyền của bất kỳ trò chơi nào.
2. **Quyền sở hữu nhãn hiệu:** Tên gọi **"M.A.P.L.E MAGI Labs"**, **"OpenRPGLoader"** và **"OpenRPGEngine"** thuộc quyền sở hữu nhận diện của M.A.P.L.E MAGI Labs. Giấy phép mã nguồn mở không cấp quyền sử dụng các nhãn hiệu này cho mục đích thương mại, quảng cáo hoặc gây hiểu nhầm về sự tài trợ hay chứng thực chính thức.
3. **Triết lý Feature-Complete & Không cam kết bảo trì định kỳ:** Phần mềm được cung cấp dưới dạng đóng góp mã nguồn mở thiện chí theo định hướng hoàn thiện trọn vẹn (*Feature-Complete*). M.A.P.L.E MAGI Labs **KHÔNG CÓ NGHĨA VỤ** phải bảo trì định kỳ, cập nhật tính năng liên tục, sửa đổi theo yêu cầu cá nhân hay duy trì khả năng tương thích khi các trò chơi hoặc engine cập nhật phiên bản mới, và có quyền tạm ngừng hoặc chấm dứt dự án bất kỳ lúc nào mà không cần thông báo trước.

---

## 11. Miễn trừ bảo hành ("NGUYÊN TRẠNG") và Mức trần trách nhiệm tối đa

1. **Cung cấp "NGUYÊN TRẠNG" (AS IS):**
   Phần mềm OpenRPGLoader được cung cấp theo nguyên tắc **"NGUYÊN TRẠNG" (AS IS)** và **"SẴN CÓ" (AS AVAILABLE)**, không kèm theo bất kỳ sự bảo đảm nào dưới bất kỳ hình thức nào, dù rõ ràng hay ngụ ý (bao gồm nhưng không giới hạn ở các bảo đảm ngụ ý về khả năng thương mại, sự phù hợp cho một mục đích cụ thể, tính ổn định không gián đoạn, hay tính không vi phạm).
2. **Giới hạn trách nhiệm pháp lý:**
   Trong phạm vi tối đa mà pháp luật hiện hành cho phép, M.A.P.L.E MAGI Labs và các thành viên **tuyệt đối không chịu trách nhiệm pháp lý** đối với bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên, đặc biệt, mang tính trừng phạt hoặc hệ quả nào (bao gồm nhưng không giới hạn ở các thiệt hại do mất dữ liệu lưu game, hỏng hóc thiết bị, gián đoạn kinh doanh, mất doanh thu phát sóng trực tiếp hoặc chi phí thay thế phần cứng) phát sinh từ việc sử dụng hoặc không thể sử dụng phần mềm này.
3. **Mức trần bồi thường tài chính:**
   Tổng mức trách nhiệm bồi thường tài chính tối đa của M.A.P.L.E MAGI Labs đối với mọi khiếu nại, khiếu kiện hoặc tranh chấp liên quan đến OpenRPGLoader trong mọi trường hợp được ấn định cố định là **0 VNĐ (Không Đồng Việt Nam) / 0 USD**.

---

## 12. Luật điều chỉnh, Giải quyết tranh chấp quốc tế và Thời hiệu khiếu nại

1. **Luật điều chỉnh:** Văn bản này được điều chỉnh, diễn giải và thực thi độc quyền theo **pháp luật của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam**.
2. **Giải quyết tranh chấp (Áp dụng cho người dùng trong nước và quốc tế):**
   - **Thương lượng thiện chí 30 ngày:** Trước khi tiến hành bất kỳ thủ tục tố tụng pháp lý nào, các bên bắt buộc phải nỗ lực giải quyết bất đồng thông qua thương lượng trực tiếp bằng văn bản với tinh thần thiện chí trong thời hạn tối thiểu **30 ngày**.
   - **Thẩm quyền tài phán độc quyền:** Trong trường hợp không đạt được thỏa thuận qua thương lượng, mọi tranh chấp phát sinh từ hoặc liên quan đến văn bản này sẽ được đưa ra giải quyết độc quyền tại **Tòa án nhân dân có thẩm quyền tại Việt Nam**. Người dùng ngoài lãnh thổ Việt Nam đồng ý chấp thuận thẩm quyền tài phán độc quyền này, tự nguyện từ bỏ quyền phản đối về nơi xét xử không thuận tiện (*forum non conveniens*), và tự chịu mọi chi phí pháp lý phát sinh của bản thân.
   - **Từ bỏ khởi kiện tập thể (Class Action Waiver):** Mọi thủ tục giải quyết tranh chấp phải được tiến hành trên tư cách cá nhân của từng bên, tuyệt đối không tham gia, khởi xướng hoặc kết hợp trong bất kỳ vụ kiện tập thể (*Class Action*) hay vụ kiện mang tư cách đại diện nào.
3. **Thời hiệu khởi kiện:** Thời hiệu khởi kiện đối với các tranh chấp phát sinh từ hoặc liên quan đến việc sử dụng phần mềm được thực hiện theo quy định của pháp luật tố tụng dân sự Việt Nam.
4. **Tính hiệu lực từng phần (Severability):** Nếu bất kỳ điều khoản hoặc nội dung nào trong văn bản này bị cơ quan nhà nước hoặc tòa án có thẩm quyền tuyên bố là vô hiệu, bất hợp pháp hoặc không thể thi hành, tính hợp pháp và hiệu lực thi hành của các điều khoản còn lại sẽ không bị ảnh hưởng và vẫn giữ nguyên giá trị pháp lý cao nhất.

---

<p align="center">
  <b>M.A.P.L.E MAGI Labs</b><br>
  <i>Chính sách miễn trừ trách nhiệm và giới hạn pháp lý chính thức dành cho OpenRPGLoader.</i>
</p>
