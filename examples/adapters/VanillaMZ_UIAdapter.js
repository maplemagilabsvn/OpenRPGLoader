/**
 * VanillaMZ_UIAdapter.js - Adapter Giao Diện Mẫu Chuẩn Cho RPG Maker MZ
 * TẦNG 2: PRODUCT ADAPTER (Ví dụ: Vanilla MZ Edition)
 * ============================================================================
 * Lớp chuyển đổi (Adapter) kết nối trực tiếp với OpenRPGEngine (Tầng 1):
 * - Lắng nghe các sự kiện boot, progress, error từ Engine Core.
 * - Tự động gắn nút 'Mods' vào Window_TitleCommand và Window_MenuCommand.
 * - Hiển thị giao diện danh sách và cấu hình mod theo phong cách mặc định.
 * ============================================================================
 */

(() => {
    "use strict";

    class VanillaMZ_UIAdapter {
        constructor(options = {}) {
            this.engine = null;
            this.options = Object.assign({
                enableTitleMenu: true,
                enablePauseMenu: true,
                menuCommandName: "Bản Mod (Mods)"
            }, options);
        }

        init(engine) {
            this.engine = engine;

            // 1. Lắng nghe tiến trình khởi động từ lõi
            engine.on("boot:progress", ({ percent, task }) => {
                // Có thể cập nhật progress bar lúc khởi động
            });

            // 2. Lắng nghe thông báo
            engine.on("notify", ({ message, type }) => {
                this.showToast(message, type);
            });

            // 3. Tích hợp nút Mods vào màn hình tiêu đề (Title)
            if (this.options.enableTitleMenu && typeof Window_TitleCommand !== "undefined") {
                const adapterRef = this;
                const _makeCommandList = Window_TitleCommand.prototype.makeCommandList;
                Window_TitleCommand.prototype.makeCommandList = function () {
                    _makeCommandList.call(this);
                    this.addCommand(adapterRef.options.menuCommandName, "openrpg_mods", true);
                };
            }

            // 4. Hook DataManager để tự động kích hoạt Engine
            if (typeof DataManager !== "undefined") {
                const _loadDatabase = DataManager.loadDatabase;
                DataManager.loadDatabase = function () {
                    _loadDatabase.call(this);
                    engine.boot();
                };

                const _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
                Scene_Boot.prototype.onDatabaseLoaded = function () {
                    _Scene_Boot_onDatabaseLoaded.call(this);
                    DataManager._openRpgDatabaseReady = true;
                    engine.applyDataPatches();

                    for (const cb of engine._databaseLoadedCallbacks) {
                        try { cb(); } catch (e) { engine.error("Lỗi callback databaseLoaded:", e); }
                    }
                    engine._databaseLoadedCallbacks = [];
                };

                const _extractSave = DataManager.extractSaveContents;
                DataManager.extractSaveContents = function (contents) {
                    _extractSave.call(this, contents);
                    engine.sanitizeSaveContents();
                };
            }

            // 5. Hook Virtual Assets
            if (typeof ImageManager !== "undefined") {
                const _loadBitmap = ImageManager.loadBitmap;
                ImageManager.loadBitmap = function (folder, filename) {
                    if (filename) {
                        const rel = folder + Utils.encodeURI(filename) + ".png";
                        const override = engine.resolveAsset(rel);
                        if (override) return this.loadBitmapFromUrl(override);
                    }
                    return _loadBitmap.call(this, folder, filename);
                };
            }

            if (typeof AudioManager !== "undefined") {
                const _createBuffer = AudioManager.createBuffer;
                AudioManager.createBuffer = function (folder, name) {
                    const ext = this.audioFileExt();
                    const rel = "audio/" + folder + Utils.encodeURI(name) + ext;
                    const override = engine.resolveAsset(rel);
                    if (override) {
                        const buf = new WebAudio(override);
                        buf.name = name;
                        buf.frameCount = Graphics.frameCount;
                        return buf;
                    }
                    return _createBuffer.call(this, folder, name);
                };
            }
        }

        showToast(message, type = "info") {
            if (typeof document === "undefined" || !document.body) return;
            let container = document.getElementById("openRpgToastContainer");
            if (!container) {
                container = document.createElement("div");
                container.id = "openRpgToastContainer";
                container.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;";
                document.body.appendChild(container);
            }

            const toast = document.createElement("div");
            toast.style.cssText = "background:rgba(20,24,33,0.95);border:1px solid #3498db;border-radius:6px;padding:8px 14px;color:#fff;font-size:12px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.5);";
            toast.innerText = message;
            container.appendChild(toast);

            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 3500);
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = VanillaMZ_UIAdapter;
    }
    if (typeof window !== "undefined") {
        window.VanillaMZ_UIAdapter = VanillaMZ_UIAdapter;
    }
})();
