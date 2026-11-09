# 🔒 Chính Sách Bảo Mật (Security Policy)

OpenRPGLoader coi trọng tính an toàn của người chơi và các nhà phát triển game RPG Maker MZ. Cơ chế Safe-FS, Mock Process và Circuit Breaker được thiết kế để bảo vệ hệ thống khỏi các hành vi phá hoại hoặc lỗi vô ý.

## 🛡️ Các Phiên Bản Được Hỗ Trợ (Supported Versions)

Các phiên bản chính thức của OpenRPGLoader được hỗ trợ theo từng nhánh phát hành (Releases):

| Phiên Bản | Được Hỗ Trợ | Ghi Chú Tài Liệu |
| :--- | :---: | :--- |
| **`1.1.1`** | ✅ Có | Bản phát hành mới nhất (Sử dụng Dev Docs hiện hành) |
| **`1.1.0`** | ✅ Có | Được hỗ trợ bảo mật (Sử dụng Dev Docs hiện hành) |
| **`1.0.0`** | ✅ Có | Phiên bản gốc (Tra cứu qua [Dev Docs theo Tag v1.0.0](https://github.com/maplemagilabsvn/OpenRPGLoader/tree/v1.0.0/Dev%20Docs)) |
| **`< 1.0`** | ❌ Không | Bản tiền phát hành / thử nghiệm |

## 🚨 Báo Cáo Lỗ Hổng Bảo Mật (Reporting a Vulnerability)

Nếu bạn phát hiện lỗ hổng bảo mật nghiêm trọng (ví dụ: vượt rào Sandbox, Directory Traversal qua Safe-FS, hoặc thực thi mã độc tùy ý):

1. **Vui lòng KHÔNG mở Issue công khai trên GitHub.**
2. Gửi thông tin chi tiết về sự cố (kèm mã khai thác PoC nếu có) tới kênh bảo mật riêng hoặc email của đội ngũ phát triển.
3. Chúng tôi cam kết phản hồi trong vòng 48 giờ và phát hành bản vá bảo mật nhanh nhất có thể.

Cảm ơn bạn đã chung tay bảo vệ cộng đồng modding an toàn và lành mạnh!
