/**
 * SampleCyberpunk_Extension.js - Ví Dụ Extension Cho Tựa Game Thể Loại Cyberpunk
 * TẦNG 2: PRODUCT EXTENSION (Ví dụ: Cyberpunk Edition)
 * ============================================================================
 * Minh họa cách một tựa game tương lai cắm thêm API đặc thù (Cyberware, Hacking, Karma)
 * vào OpenRPGEngine Core mà không cần sửa 1 byte nào của lõi.
 * ============================================================================
 */

(() => {
    "use strict";

    const CyberpunkExtension = {
        name: "CyberpunkSystem",
        version: "1.0.0",

        Hacking: {
            registerProtocol(protocolData) {
                console.log(`[Cyberpunk] Đăng ký giao thức hack: ${protocolData.name} (RAM cost: ${protocolData.ramCost})`);
            },
            triggerGlitch(targetId) {
                console.log(`[Cyberpunk] Gây nhiễu tín hiệu mạng lên mục tiêu: ${targetId}`);
            }
        },

        Cyberware: {
            installImplant(actor, implant) {
                console.log(`[Cyberware] Cấy ghép ${implant.name} vào nhân vật.`);
            }
        }
    };

    // Cách đăng ký vào OpenRPGEngine:
    if (typeof OpenRPGEngine !== "undefined" && window.rpgEngine) {
        window.rpgEngine.registerExtension("Cyberpunk", CyberpunkExtension);
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = CyberpunkExtension;
    }
})();
