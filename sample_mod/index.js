/**
 * Sample Generic Mod cho OpenRPGLoader
 */
(() => {
    "use strict";

    OpenRPGLoader.log("[SampleMod] Đang khởi động bản mod mẫu OpenRPGLoader...");

    // 1. Đăng ký cấu hình in-game
    OpenRPGLoader.registerConfig("sample_generic_mod", {
        name: "Cấu Hình Mod Mẫu",
        options: [
            {
                key: "welcomeMessage",
                name: "Hiện Thông Báo Khởi Đầu",
                type: "boolean",
                default: true,
                desc: "Hiển thị thông báo Toast khi người chơi bước vào bản đồ."
            }
        ]
    });

    // 2. Lắng nghe khi cơ sở dữ liệu sẵn sàng
    OpenRPGLoader.onDatabaseLoaded(() => {
        OpenRPGLoader.log("[SampleMod] Database đã sẵn sàng! RFC 6902 Patch đã được áp dụng tự động.");
    });

    // 3. Lắng nghe khi vào màn chơi
    OpenRPGLoader.on("mapLoaded", (mapId) => {
        const config = OpenRPGLoader.loadModConfigValues("sample_generic_mod");
        if (config.welcomeMessage) {
            OpenRPGLoader.showInGameToast("OpenRPGLoader: Mod Mẫu đã nạp thành công!", "info");
        }
    });

    OpenRPGLoader.log("✔ [SampleMod] Hoàn tất nạp bản mod mẫu.");
})();
