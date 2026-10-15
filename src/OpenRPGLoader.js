//=============================================================================
// RPG Maker MZ - OpenRPGLoader.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc OpenRPGLoader v1.0.0 - Nền tảng Modding & Cứu hộ tổng quát chuẩn phong cách Forge dành cho mọi tựa game RPG Maker MZ (NW.js).
 * @author M.A.P.L.E MAGI Labs
 *
 * @param enableTitleCommand
 * @text Nút Mods Trên Title
 * @type boolean
 * @desc Hiển thị mục 'Mods' trên màn hình tiêu đề (Title Screen).
 * @default true
 *
 * @param enableMenuCommand
 * @text Nút Mods Trong Pause Menu
 * @type boolean
 * @desc Cho phép mở danh sách Mod ngay trong menu khi đang chơi game.
 * @default true
 *
 * @param showWatermark
 * @text Hiện Watermark Trên Title
 * @type boolean
 * @desc Hiển thị thông số phiên bản OpenRPGLoader và số lượng Mod góc trên bên trái màn hình chính.
 * @default true
 *
 * @param enableAuditCache
 * @text Bật Bộ Nhớ Đệm Kiểm Định (Audit Cache)
 * @type boolean
 * @desc Lưu trữ mã băm SHA-256 để tăng tốc độ nạp game đối với các mod không thay đổi mã nguồn.
 * @default true
 *
 * @param allowModPermissions
 * @text Cho Phép Cấp Quyền Nâng Cao (Permissions)
 * @type boolean
 * @desc Cho phép các bản mod khai báo mảng 'permissions' trong mod.json để truy cập API nâng cao.
 * @default true
 *
 * @help OpenRPGLoader.js
 * ============================================================================
 * OPENRPGLOADER v1.0.0 - BỘ NẠP & QUẢN LÝ MOD TỔNG QUÁT CHO RPG MAKER MZ
 * ============================================================================
 * Phát triển bởi M.A.P.L.E MAGI Labs dưới dạng mã nguồn mở tự do (MIT).
 * Tương thích với mọi tựa game RPG Maker MZ vận hành trên nền tảng NW.js.
 *
 * KIẾN TRÚC MỞ RỘNG (CHROMIUM-STYLE EXTENSIBILITY):
 * - OpenRPGEngine: Lớp cơ sở (Headless Core) chứa 100% giải thuật nền tảng.
 * - OpenRPGLoaderCore: Lớp phân phối chuẩn kế thừa OpenRPGEngine tích hợp UI MZ.
 * - Bản phái sinh (9/10): Chỉ cần `class MyLoader extends OpenRPGLoaderCore`
 *   để thêm Domain API hoặc đổi theme mà không cần sửa 1 byte Core gốc.
 * - Can thiệp sâu (1/10): Tùy biến chốt chặn qua `setPolicy()`, `toggleFeature()`
 *   hoặc override phương thức Core với `super.method()`.
 * ============================================================================
 */

(() => {
    "use strict";

    const pluginName = "OpenRPGLoader";
    const rawParams = (typeof PluginManager !== "undefined" && PluginManager.parameters) ? PluginManager.parameters(pluginName) : {};

    const isNwJs = typeof require === "function";
    const fs = isNwJs ? require("fs") : null;
    const path = isNwJs ? require("path") : null;
    const child_process = isNwJs ? require("child_process") : null;
    const crypto = isNwJs ? require("crypto") : null;

    //=============================================================================
    // 🧬 RFC 6902 JSON-PATCH IMPLEMENTATION (CHUẨN CÔNG NGHIỆP TOÀN DIỆN)
    //=============================================================================
    const JsonPatch = {
        decodePointer(token) {
            return token.replace(/~1/g, "/").replace(/~0/g, "~");
        },

        parsePath(pathStr) {
            if (!pathStr || pathStr === "" || pathStr === "/") return [];
            return pathStr.split("/").slice(1).map(this.decodePointer);
        },

        cloneValue(val) {
            if (val === undefined) return undefined;
            if (val === null || typeof val !== "object") return val;
            return JSON.parse(JSON.stringify(val));
        },

        deepEqual(a, b) {
            if (a === b) return true;
            if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
                return false;
            }
            if (Array.isArray(a) !== Array.isArray(b)) return false;

            if (Array.isArray(a)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!this.deepEqual(a[i], b[i])) return false;
                }
                return true;
            }

            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;

            for (const key of keysA) {
                if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
                if (!this.deepEqual(a[key], b[key])) return false;
            }
            return true;
        },

        applyPatch(doc, patchList) {
            if (!Array.isArray(patchList)) {
                throw new Error("JSON Patch phải là một mảng các operations.");
            }
            for (let i = 0; i < patchList.length; i++) {
                const opObj = patchList[i];
                if (!opObj || typeof opObj !== "object" || !opObj.op) {
                    throw new Error(`JSON Patch index ${i} thiếu thuộc tính 'op'.`);
                }
                this.applyOperation(doc, opObj);
            }
            return doc;
        },

        applyOperation(doc, opObj) {
            const op = opObj.op;
            const pathTokens = this.parsePath(opObj.path);

            if (pathTokens.length === 0) {
                if (op === "replace" || op === "add") {
                    if (Array.isArray(doc) && Array.isArray(opObj.value)) {
                        doc.length = 0;
                        for (let j = 0; j < opObj.value.length; j++) {
                            doc[j] = opObj.value[j];
                        }
                        return doc;
                    } else if (typeof doc === "object" && doc !== null && typeof opObj.value === "object" && opObj.value !== null) {
                        for (const k in doc) delete doc[k];
                        Object.assign(doc, opObj.value);
                        return doc;
                    }
                }
                if (op === "test") {
                    if (!this.deepEqual(doc, opObj.value)) {
                        throw new Error("[JSON-Patch:test] Thất bại tại root document: giá trị không khớp.");
                    }
                    return doc;
                }
                throw new Error(`[JSON-Patch] Không hỗ trợ thao tác '${op}' trên root document.`);
            }

            switch (op) {
                case "add": {
                    const { parent, key } = this.resolveParent(doc, pathTokens, true);
                    if (Array.isArray(parent)) {
                        if (key === "-") {
                            parent.push(opObj.value);
                        } else {
                            const idx = parseInt(key, 10);
                            if (isNaN(idx) || idx < 0 || String(idx) !== key) {
                                throw new Error(`[JSON-Patch:add] Chỉ số mảng không hợp lệ: ${key}`);
                            }
                            if (idx > parent.length) {
                                while (parent.length < idx) parent.push(null);
                                parent.push(opObj.value);
                            } else {
                                parent.splice(idx, 0, opObj.value);
                            }
                        }
                    } else if (parent && typeof parent === "object") {
                        parent[key] = opObj.value;
                    }
                    break;
                }
                case "remove": {
                    const { parent, key } = this.resolveParent(doc, pathTokens, false);
                    if (Array.isArray(parent)) {
                        const idx = parseInt(key, 10);
                        if (isNaN(idx) || idx < 0 || idx >= parent.length || String(idx) !== key) {
                            throw new Error(`[JSON-Patch:remove] Chỉ số mảng không hợp lệ hoặc không tồn tại: ${key}`);
                        }
                        parent.splice(idx, 1);
                    } else if (parent && typeof parent === "object") {
                        if (!Object.prototype.hasOwnProperty.call(parent, key)) {
                            throw new Error(`[JSON-Patch:remove] Khóa mục tiêu không tồn tại: ${key}`);
                        }
                        delete parent[key];
                    } else {
                        throw new Error(`[JSON-Patch:remove] Đối tượng mục tiêu không hợp lệ tại: ${opObj.path}`);
                    }
                    break;
                }
                case "replace": {
                    const { parent, key } = this.resolveParent(doc, pathTokens, false);
                    if (Array.isArray(parent)) {
                        const idx = parseInt(key, 10);
                        if (isNaN(idx) || idx < 0 || idx >= parent.length || String(idx) !== key) {
                            throw new Error(`[JSON-Patch:replace] Chỉ số mảng không hợp lệ hoặc không tồn tại: ${key}`);
                        }
                        parent[idx] = opObj.value;
                    } else if (parent && typeof parent === "object") {
                        if (!Object.prototype.hasOwnProperty.call(parent, key)) {
                            throw new Error(`[JSON-Patch:replace] Khóa mục tiêu không tồn tại: ${key}`);
                        }
                        parent[key] = opObj.value;
                    } else {
                        throw new Error(`[JSON-Patch:replace] Đối tượng mục tiêu không hợp lệ tại: ${opObj.path}`);
                    }
                    break;
                }
                case "move": {
                    if (typeof opObj.from !== "string") throw new Error("[JSON-Patch:move] Thiếu thuộc tính 'from'.");
                    if (opObj.path === opObj.from || opObj.path.startsWith(opObj.from + "/")) {
                        throw new Error(`[JSON-Patch:move] Không thể di chuyển đường dẫn vào chính nó hoặc phần tử con: ${opObj.from} -> ${opObj.path}`);
                    }
                    const fromTokens = this.parsePath(opObj.from);
                    if (fromTokens.length === 0) throw new Error("[JSON-Patch:move] Không thể di chuyển từ root.");
                    const { parent: fromParent, key: fromKey } = this.resolveParent(doc, fromTokens, false);
                    let valToMove;
                    if (Array.isArray(fromParent)) {
                        const idx = parseInt(fromKey, 10);
                        if (isNaN(idx) || idx < 0 || idx >= fromParent.length || String(idx) !== fromKey) {
                            throw new Error(`[JSON-Patch:move] Chỉ số mảng nguồn không hợp lệ hoặc không tồn tại: ${fromKey}`);
                        }
                        valToMove = fromParent.splice(idx, 1)[0];
                    } else if (fromParent && typeof fromParent === "object") {
                        if (!Object.prototype.hasOwnProperty.call(fromParent, fromKey)) {
                            throw new Error(`[JSON-Patch:move] Khóa nguồn không tồn tại: ${fromKey}`);
                        }
                        valToMove = fromParent[fromKey];
                        delete fromParent[fromKey];
                    } else {
                        throw new Error(`[JSON-Patch:move] Đối tượng nguồn không hợp lệ tại: ${opObj.from}`);
                    }
                    this.applyOperation(doc, { op: "add", path: opObj.path, value: valToMove });
                    break;
                }
                case "copy": {
                    const fromTokens = this.parsePath(opObj.from);
                    let valToCopy;
                    if (fromTokens.length === 0) {
                        valToCopy = this.cloneValue(doc);
                    } else {
                        valToCopy = this.cloneValue(this.resolveValue(doc, fromTokens));
                    }
                    this.applyOperation(doc, { op: "add", path: opObj.path, value: valToCopy });
                    break;
                }
                case "test": {
                    const actual = this.resolveValue(doc, pathTokens);
                    const expected = opObj.value;
                    if (!this.deepEqual(actual, expected)) {
                        throw new Error(`[JSON-Patch:test] Thất bại tại ${opObj.path}: giá trị không khớp.`);
                    }
                    break;
                }
                default:
                    throw new Error(`[JSON-Patch] Toán tử không hỗ trợ: ${op}`);
            }
        },

        resolveParent(doc, tokens, createMissing = false) {
            if (tokens.length === 0) throw new Error("Path rỗng.");
            let current = doc;
            for (let i = 0; i < tokens.length - 1; i++) {
                const token = tokens[i];
                if (current === null || typeof current !== "object") throw new Error(`Path lỗi tại: ${token}`);
                if (!(token in current)) {
                    if (createMissing) current[token] = {};
                    else throw new Error(`Khóa '${token}' không tồn tại.`);
                }
                current = current[token];
            }
            return { parent: current, key: tokens[tokens.length - 1] };
        },

        resolveValue(doc, tokens) {
            let current = doc;
            for (const token of tokens) {
                if (current === null || typeof current !== "object" || !(token in current)) {
                    throw new Error(`Không tìm thấy giá trị tại: ${token}`);
                }
                current = current[token];
            }
            return current;
        }
    };

    //=============================================================================
    // 🏛️ OPENRPG ENGINE CORE CLASS (TẦNG 1: LÕI CHROMIUM VÔ HÌNH)
    //=============================================================================
    class OpenRPGEngine {
        constructor(options = {}) {
            this.version = "1.0.0";
            this.options = Object.assign({
                gameId: "generic_rpg",
                gameVersion: "1.0.0",
                gameRoot: this._detectGameRoot(),
                modsDir: null,
                configFileName: "mods_config.json",
                logFileName: "openrpg.log",
                crashDirName: "crash-reports",
                auditCacheFileName: ".audit_cache.json",
                circuitBreakerLimit: 2,
                features: {},
                security: {
                    strictSandbox: true,
                    allowChildProcess: false,
                    allowedPermissions: [
                        "network:outbound",
                        "filesystem:unrestricted",
                        "child_process:exec",
                        "system:control"
                    ]
                }
            }, options);

            this.features = Object.assign({
                audit: true,
                strictQuarantine: false,
                safeFs: true,
                circuitBreaker: true,
                dataPatching: true,
                virtualAssets: true,
                saveShield: true,
                sandbox: true,
                auditCache: true
            }, this.options.features);

            this.policies = {
                fs: null,
                audit: null,
                permission: null,
                circuitBreaker: null
            };

            const root = this.options.gameRoot;
            const mDir = this.options.modsDir ? path.resolve(root, this.options.modsDir) : path.join(root, "mods");
            this.paths = {
                gameRoot: root,
                modsDir: mDir,
                configFile: path.join(mDir, this.options.configFileName),
                logFile: path.join(mDir, this.options.logFileName),
                crashDir: path.join(mDir, this.options.crashDirName),
                auditCacheFile: path.join(mDir, this.options.auditCacheFileName)
            };

            this.mods = [];
            this.config = { disabled: [] };
            this.auditCache = {};
            this.extensions = new Map();
            this.uiAdapter = null;
            this._eventListeners = {};
            this._hookPipelines = new Map();
            this._databaseLoadedCallbacks = [];
            this._modConfigs = new Map();
            this._lastCrashFilePath = null;
            this._isBooted = false;
            this._databaseReady = false;

            this.registries = {
                items: new Map(),
                actors: new Map(),
                weapons: new Map(),
                armors: new Map(),
                skills: new Map()
            };
            this.tags = {
                items: new Map(),
                actors: new Map()
            };
            this.imcMessages = {};

            this.EventPriority = Object.freeze({
                HIGHEST: 1000,
                HIGH: 500,
                NORMAL: 0,
                LOW: -500,
                LOWEST: -1000
            });

            this.log(`Khởi tạo OpenRPGEngine Core cho [${this.options.gameId}] v${this.options.gameVersion}`);
        }

        setPolicy(type, fn) {
            if (typeof fn !== "function") return;
            this.policies[type] = fn;
            this.log(`✔ [Policy] Đã đăng ký chính sách tùy biến cho chốt chặn: [${type}]`);
        }

        getPolicy(type) {
            return this.policies[type] || null;
        }

        toggleFeature(featureName, enabled) {
            this.features[featureName] = Boolean(enabled);
            this.log(`⚙ [FeatureToggle] Chốt chặn [${featureName}] = ${this.features[featureName]}`);
        }

        isFeatureEnabled(featureName) {
            return Boolean(this.features[featureName]);
        }

        _detectGameRoot() {
            if (typeof process !== "undefined") {
                if (path && process.mainModule && process.mainModule.filename) {
                    return path.dirname(process.mainModule.filename);
                }
                if (typeof process.cwd === "function") return process.cwd();
            }
            return ".";
        }

        getGlobalScope() {
            if (typeof window !== "undefined") return window;
            if (typeof global !== "undefined") return global;
            return {};
        }

        on(event, callback, priority = 0) {
            if (typeof callback !== "function") return;
            if (!this._eventListeners[event]) this._eventListeners[event] = [];
            this._eventListeners[event].push({ callback, priority });
            this._eventListeners[event].sort((a, b) => b.priority - a.priority);
        }

        emit(event, ...args) {
            if (!this._eventListeners[event]) return;
            for (const item of this._eventListeners[event]) {
                try {
                    item.callback(...args);
                    if (args[0] && typeof args[0].isCanceled === "function" && args[0].isCanceled()) {
                        break;
                    }
                } catch (err) {
                    this.error(`Lỗi trong EventBus handler [${event}]:`, err);
                }
            }
        }

        createEvent(type, data = {}, cancelable = false) {
            let canceled = false;
            let result = "DEFAULT";
            return Object.assign({
                type,
                cancelable,
                isCancelable: () => cancelable,
                isCanceled: () => canceled,
                setCanceled: (flag) => { if (cancelable) canceled = Boolean(flag); },
                setResult: (res) => { result = res; },
                getResult: () => result
            }, data);
        }

        log(msg, ...args) {
            const time = new Date().toLocaleTimeString();
            console.log(`[OpenRPG][${time}] ${msg}`, ...args);
            this._writeLog("INFO", msg);
        }

        warn(msg, ...args) {
            const time = new Date().toLocaleTimeString();
            console.warn(`[OpenRPG][${time}][WARN] ${msg}`, ...args);
            this._writeLog("WARN", msg);
        }

        error(msg, ...args) {
            const time = new Date().toLocaleTimeString();
            console.error(`[OpenRPG][${time}][ERROR] ${msg}`, ...args);
            this._writeLog("ERROR", msg);
        }

        _writeLog(level, msg) {
            if (fs && this.paths.logFile) {
                try {
                    fs.appendFileSync(this.paths.logFile, `[${new Date().toISOString()}][${level}] ${msg}\n`, "utf8");
                } catch (e) {}
            }
        }

        notify(message, type = "info") {
            this.emit("notify", { message, type });
            if (this.uiAdapter && typeof this.uiAdapter.showToast === "function") {
                this.uiAdapter.showToast(message, type);
            }
        }

        registerExtension(name, extObj) {
            if (!name || typeof extObj !== "object") return;
            this.extensions.set(name, extObj);
            this[name] = extObj;
            this.log(`✔ [Extension] Đã tích hợp module: [${name}]`);
            this.emit("extension:registered", { name, extension: extObj });
        }

        getExtension(name) {
            return this.extensions.get(name) || null;
        }

        setUIAdapter(adapter) {
            if (!adapter || typeof adapter !== "object") return;
            this.uiAdapter = adapter;
            if (typeof adapter.init === "function") {
                adapter.init(this);
            }
            this.log("✔ [UIAdapter] Đã kết nối adapter giao diện người dùng.");
        }

        loadAuditCache() {
            if (!fs || !this.isFeatureEnabled("auditCache") || !this.paths.auditCacheFile) return;
            try {
                if (fs.existsSync(this.paths.auditCacheFile)) {
                    this.auditCache = JSON.parse(fs.readFileSync(this.paths.auditCacheFile, "utf8")) || {};
                }
            } catch (e) {
                this.auditCache = {};
            }
        }

        saveAuditCache() {
            if (!fs || !this.isFeatureEnabled("auditCache") || !this.paths.auditCacheFile) return;
            try {
                fs.writeFileSync(this.paths.auditCacheFile, JSON.stringify(this.auditCache, null, 2), "utf8");
            } catch (e) {}
        }

        computeHash(filePath) {
            if (!fs || !crypto || !filePath || !fs.existsSync(filePath)) return null;
            try {
                return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
            } catch (e) {
                return null;
            }
        }

        loadConfig() {
            if (!fs || !this.paths.configFile) return;
            try {
                if (fs.existsSync(this.paths.configFile)) {
                    this.config = JSON.parse(fs.readFileSync(this.paths.configFile, "utf8")) || { disabled: [] };
                    if (!Array.isArray(this.config.disabled)) this.config.disabled = [];
                }
            } catch (e) {
                this.config = { disabled: [] };
            }
        }

        saveConfig() {
            if (!fs || !this.paths.configFile) return;
            try {
                fs.writeFileSync(this.paths.configFile, JSON.stringify(this.config, null, 2), "utf8");
            } catch (e) {
                this.error("Không thể lưu cấu hình mods:", e);
            }
        }

        registerConfig(modId, configDef) {
            if (!modId || !configDef) return;
            this._modConfigs.set(modId, configDef);
        }

        hasConfig(modId) {
            return this._modConfigs.has(modId);
        }

        getConfig(modId) {
            return this._modConfigs.get(modId) || null;
        }

        loadModConfigValues(modId) {
            const def = this.getConfig(modId);
            if (!def) return {};
            const values = {};
            if (Array.isArray(def.options)) {
                for (const opt of def.options) values[opt.key] = opt.default;
            }
            if (fs && path) {
                const mod = this.getMod(modId);
                const cfgPath = mod && mod.folderPath ? path.join(mod.folderPath, "config.json") : path.join(this.paths.modsDir, modId, "config.json");
                if (fs.existsSync(cfgPath)) {
                    try {
                        Object.assign(values, JSON.parse(fs.readFileSync(cfgPath, "utf8")));
                    } catch (e) {}
                }
            }
            return values;
        }

        saveModConfigValues(modId, newValues) {
            const mod = this.getMod(modId);
            if (fs && path) {
                const cfgPath = mod && mod.folderPath ? path.join(mod.folderPath, "config.json") : path.join(this.paths.modsDir, modId, "config.json");
                try {
                    const dir = path.dirname(cfgPath);
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    fs.writeFileSync(cfgPath, JSON.stringify(newValues, null, 2), "utf8");
                } catch (e) {
                    this.error(`Lỗi ghi config mod [${modId}]:`, e);
                }
            }
            this.emit("config:changed", { modId, config: newValues });
        }

        getMod(modId) {
            return this.mods.find(m => m.id === modId) || null;
        }

        activeCount() {
            return this.mods.filter(m => m.status === "active" && m.enabled).length;
        }

        hasErrors() {
            return this.mods.some(m => m.status === "error" || m.status === "missing_dependency" || m.status === "conflict");
        }

        isolateFaultyMod(modId) {
            const mod = this.getMod(modId);
            if (!mod || mod.isCore) return false;

            const globalObj = this.getGlobalScope();
            const sceneMgr = globalObj.SceneManager;
            const currentScene = (sceneMgr && sceneMgr._scene) ? sceneMgr._scene : null;
            const isBattle = Boolean(currentScene && (
                (globalObj.Scene_Battle && currentScene instanceof globalObj.Scene_Battle) ||
                (currentScene.constructor && currentScene.constructor.name === "Scene_Battle")
            ));

            if (isBattle) {
                this.warn(`⚠️ [Battle-Safe Guard] Đang ở Scene_Battle! Hoãn ngắt nóng hook của [${modId}] để tránh soft-lock lượt đấu.`);
                this.loadConfig();
                if (!this.config.disabled.includes(modId)) {
                    this.config.disabled.push(modId);
                    this.saveConfig();
                }
                mod.enabled = false;
                mod.status = "disabled";
                this.notify(`Đã vô hiệu hóa [${mod.name}] ở lần khởi động sau.`, "warn");
                return false;
            }

            this.loadConfig();
            if (!this.config.disabled.includes(modId)) {
                this.config.disabled.push(modId);
                this.saveConfig();
            }
            mod.enabled = false;
            mod.status = "disabled";

            if (this._hookPipelines) {
                for (const pipeline of this._hookPipelines.values()) {
                    for (const hook of pipeline.hooks) {
                        if (hook.modId === modId) hook.active = false;
                    }
                }
            }

            this.log(`🛡️ [SafeIsolate] Đã cách ly nóng hook của mod [${modId}].`);
            return true;
        }

        hook(targetClass, methodName, hookFunction, modId = null, priority = 0) {
            const effId = modId || "unknown";
            if (!targetClass || !targetClass.prototype || typeof targetClass.prototype[methodName] !== "function") {
                this.error(`Không thể hook [${methodName}]: Lớp hoặc phương thức không tồn tại.`);
                return;
            }

            const className = targetClass.name || "Object";
            const pipelineKey = `${className}.${methodName}`;

            if (!this._hookPipelines.has(pipelineKey)) {
                const originalMethod = targetClass.prototype[methodName];
                const pipeline = { originalMethod, hooks: [] };
                this._hookPipelines.set(pipelineKey, pipeline);

                const engineRef = this;
                targetClass.prototype[methodName] = function (...args) {
                    const activeHooks = pipeline.hooks.filter(h => h.active);
                    if (activeHooks.length === 0) return pipeline.originalMethod.apply(this, args);

                    let index = 0;
                    const next = (callerArgs) => {
                        const currentArgs = callerArgs !== undefined ? callerArgs : args;
                        if (index >= activeHooks.length) return pipeline.originalMethod.apply(this, currentArgs);

                        const currentHook = activeHooks[index++];
                        try {
                            return currentHook.fn.call(this, (...subArgs) => next(subArgs.length > 0 ? subArgs : currentArgs), ...currentArgs);
                        } catch (err) {
                            currentHook.errorCount++;
                            engineRef.error(`[SafeHook] Mod [${currentHook.modId}] ném lỗi tại [${pipelineKey}]:`, err);

                            if (engineRef.isFeatureEnabled("circuitBreaker")) {
                                let shouldTrip = false;
                                if (engineRef.policies.circuitBreaker) {
                                    shouldTrip = Boolean(engineRef.policies.circuitBreaker(currentHook, err, currentHook.errorCount, pipelineKey));
                                } else {
                                    const culprit = engineRef.getMod(currentHook.modId);
                                    const maxErrors = (culprit && culprit.strictCircuitBreaker) ? 1 : (engineRef.options.circuitBreakerLimit || 2);
                                    shouldTrip = currentHook.errorCount >= maxErrors;
                                }

                                if (shouldTrip) {
                                    currentHook.active = false;
                                    engineRef.warn(`[Circuit Breaker] Tự ngắt hook [${pipelineKey}] của mod [${currentHook.modId}].`);
                                    engineRef.notify(`Đã ngắt hook lỗi của mod [${currentHook.modId}].`, "error");
                                }
                            }
                            return next(currentArgs);
                        }
                    };
                    return next(args);
                };
            }

            const pipeline = this._hookPipelines.get(pipelineKey);
            pipeline.hooks.push({ modId: effId, fn: hookFunction, priority, active: true, errorCount: 0 });
            pipeline.hooks.sort((a, b) => b.priority - a.priority);
        }

        onDatabaseLoaded(callback) {
            if (typeof callback !== "function") return;
            const globalObj = this.getGlobalScope();
            const isMzReady = globalObj.DataManager && typeof globalObj.DataManager.isDatabaseLoaded === "function" && globalObj.DataManager.isDatabaseLoaded() && globalObj.DataManager._openRpgDatabaseReady;

            if (this._databaseReady || isMzReady) {
                callback();
            } else {
                this._databaseLoadedCallbacks.push(callback);
            }
        }

        notifyDatabaseLoaded() {
            if (this._databaseReady) return;
            this._databaseReady = true;
            const globalObj = this.getGlobalScope();
            if (globalObj.DataManager) {
                globalObj.DataManager._openRpgDatabaseReady = true;
            }

            // 1. Vá toàn bộ dữ liệu 14 bảng MZ bằng RFC 6902 JSON-Patch TRƯỚC
            this.applyDataPatches();

            // 2. Sau khi dữ liệu đã được vá hoàn tất, mới gọi các callback của Mod
            while (this._databaseLoadedCallbacks.length > 0) {
                const cb = this._databaseLoadedCallbacks.shift();
                try {
                    cb();
                } catch (e) {
                    this.error("Lỗi thực thi onDatabaseLoaded callback:", e);
                }
            }
            this.log("✔ [Lifecycle] Đã giải phóng và thực thi toàn bộ onDatabaseLoaded callbacks.");
        }

        _setupDatabaseHook() {
            const globalObj = this.getGlobalScope();
            if (globalObj.DataManager && typeof globalObj.DataManager.isDatabaseLoaded === "function" && globalObj.DataManager.isDatabaseLoaded()) {
                this.notifyDatabaseLoaded();
                return;
            }
            if (globalObj.DataManager && typeof globalObj.DataManager.isDatabaseLoaded === "function" && !this._dataManagerHooked) {
                this._dataManagerHooked = true;
                const origIsDatabaseLoaded = globalObj.DataManager.isDatabaseLoaded;
                const engineRef = this;
                globalObj.DataManager.isDatabaseLoaded = function () {
                    const loaded = origIsDatabaseLoaded.apply(this, arguments);
                    if (loaded && !engineRef._databaseReady) {
                        engineRef.notifyDatabaseLoaded();
                    }
                    return loaded;
                };
            }
            if (globalObj.Scene_Boot && globalObj.Scene_Boot.prototype && !this._dbHooked) {
                this._dbHooked = true;
                const origOnDatabaseLoaded = globalObj.Scene_Boot.prototype.onDatabaseLoaded;
                const engineRef = this;
                globalObj.Scene_Boot.prototype.onDatabaseLoaded = function () {
                    origOnDatabaseLoaded.call(this);
                    if (!engineRef._databaseReady) {
                        engineRef.notifyDatabaseLoaded();
                    }
                };
            }
        }

        ResourceLocation(modId, pathStr) {
            return `${String(modId).toLowerCase()}:${String(pathStr).toLowerCase()}`;
        }

        registerItem(itemData, modId = "mod") {
            this.onDatabaseLoaded(() => {
                const globalObj = this.getGlobalScope();
                if (!globalObj.$dataItems || !itemData) return;
                const id = itemData.id || globalObj.$dataItems.length;
                itemData.id = id;
                globalObj.$dataItems[id] = itemData;
                const key = itemData.key || (itemData.name ? itemData.name.toLowerCase().replace(/\s+/g, "_") : `item_${id}`);
                const resLoc = this.ResourceLocation(modId, key);
                itemData._resLoc = resLoc;
                this.registries.items.set(resLoc, itemData);
            });
        }

        registerActor(actorData, modId = "mod") {
            this.onDatabaseLoaded(() => {
                const globalObj = this.getGlobalScope();
                if (!globalObj.$dataActors || !actorData) return;
                const id = actorData.id || globalObj.$dataActors.length;
                actorData.id = id;
                globalObj.$dataActors[id] = actorData;
                const key = actorData.key || (actorData.name ? actorData.name.toLowerCase().replace(/\s+/g, "_") : `actor_${id}`);
                const resLoc = this.ResourceLocation(modId, key);
                actorData._resLoc = resLoc;
                this.registries.actors.set(resLoc, actorData);
            });
        }

        getItem(resLocOrId) {
            const globalObj = this.getGlobalScope();
            if (typeof resLocOrId === "number") return globalObj.$dataItems ? globalObj.$dataItems[resLocOrId] : null;
            return this.registries.items.get(resLocOrId) || null;
        }

        getActor(resLocOrId) {
            const globalObj = this.getGlobalScope();
            if (typeof resLocOrId === "number") return globalObj.$dataActors ? globalObj.$dataActors[resLocOrId] : null;
            return this.registries.actors.get(resLocOrId) || null;
        }

        attachCapability(targetObject, capabilityId, capabilityData) {
            if (!targetObject || typeof targetObject !== "object") return;
            if (!targetObject._openRpgCapabilities) targetObject._openRpgCapabilities = {};
            targetObject._openRpgCapabilities[capabilityId] = capabilityData;
            return capabilityData;
        }

        getCapability(targetObject, capabilityId) {
            if (!targetObject || !targetObject._openRpgCapabilities) return null;
            return targetObject._openRpgCapabilities[capabilityId] || null;
        }

        sendIMC(targetModId, method, message) {
            if (!this.imcMessages[targetModId]) this.imcMessages[targetModId] = [];
            this.imcMessages[targetModId].push({ method, message, timestamp: Date.now() });
        }

        getIMC(myModId, method = null) {
            const list = this.imcMessages[myModId] || [];
            if (!method) return list;
            return list.filter(m => m.method === method);
        }

        registerTag(type, tagName, idOrResLoc) {
            if (!this.tags[type]) this.tags[type] = new Map();
            if (!this.tags[type].has(tagName)) this.tags[type].set(tagName, new Set());
            this.tags[type].get(tagName).add(idOrResLoc);
        }

        hasTag(type, objectOrId, tagName) {
            if (!this.tags[type] || !this.tags[type].has(tagName)) return false;
            const set = this.tags[type].get(tagName);
            if (typeof objectOrId === "number" || typeof objectOrId === "string") return set.has(objectOrId);
            if (objectOrId && objectOrId.id && set.has(objectOrId.id)) return true;
            if (objectOrId && objectOrId._resLoc && set.has(objectOrId._resLoc)) return true;
            return false;
        }

        // --- VIRTUAL ASSETS RESOLVER ---
        resolveAsset(relativeUrl) {
            if (!fs || !path || !this.isFeatureEnabled("virtualAssets") || !relativeUrl) return null;
            let decodedUrl = relativeUrl;
            try {
                decodedUrl = decodeURIComponent(relativeUrl);
            } catch (e) {
                decodedUrl = relativeUrl;
            }
            const norm = decodedUrl.replace(/\\/g, "/");

            for (let i = this.mods.length - 1; i >= 0; i--) {
                const mod = this.mods[i];
                if (mod.status === "active" && mod.isFolder && mod.folderPath) {
                    const candidates = [
                        path.join(mod.folderPath, norm),
                        path.join(mod.folderPath, "assets", norm),
                        path.join(mod.folderPath, norm.replace(/^assets\//i, "")),
                        path.join(mod.folderPath, norm.replace(/^img\//i, "")),
                        path.join(mod.folderPath, norm.replace(/^audio\//i, "")),
                        path.join(mod.folderPath, "assets", norm.replace(/^img\//i, "")),
                        path.join(mod.folderPath, "assets", norm.replace(/^audio\//i, ""))
                    ];
                    for (const c of candidates) {
                        if (fs.existsSync(c)) return c.replace(/\\/g, "/");
                    }
                }
            }
            return null;
        }

        // --- RFC 6902 DATA PATCHING (HEADLESS-SAFE) ---
        applyDataPatches() {
            if (!fs || !path || !this.isFeatureEnabled("dataPatching") || !fs.existsSync(this.paths.modsDir)) return;
            const globalObj = this.getGlobalScope();

            for (const mod of this.mods) {
                if (mod.status !== "active" || !mod.isFolder || !mod.folderPath) continue;

                const dataDir = path.join(mod.folderPath, "data");
                if (!fs.existsSync(dataDir)) continue;

                try {
                    const files = fs.readdirSync(dataDir);
                    for (const file of files) {
                        if (!file.endsWith(".json")) continue;
                        const fullPath = path.join(dataDir, file);
                        const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));
                        const lower = file.toLowerCase();

                        let targetData = null;
                        if (lower.includes("item")) targetData = globalObj.$dataItems;
                        else if (lower.includes("weapon")) targetData = globalObj.$dataWeapons;
                        else if (lower.includes("armor")) targetData = globalObj.$dataArmors;
                        else if (lower.includes("skill")) targetData = globalObj.$dataSkills;
                        else if (lower.includes("actor")) targetData = globalObj.$dataActors;
                        else if (lower.includes("class")) targetData = globalObj.$dataClasses;
                        else if (lower.includes("enemy")) targetData = globalObj.$dataEnemies;
                        else if (lower.includes("troop")) targetData = globalObj.$dataTroops;
                        else if (lower.includes("state")) targetData = globalObj.$dataStates;
                        else if (lower.includes("animation")) targetData = globalObj.$dataAnimations;
                        else if (lower.includes("tileset")) targetData = globalObj.$dataTilesets;
                        else if (lower.includes("commonevent")) targetData = globalObj.$dataCommonEvents;
                        else if (lower.includes("system")) targetData = globalObj.$dataSystem;
                        else if (lower.includes("mapinfo")) targetData = globalObj.$dataMapInfos;
                        else if (lower.includes("map") && !lower.includes("mapinfo")) targetData = globalObj.$dataMap;

                        if (!targetData) continue;

                        const isRfc6902 = lower.endsWith(".patch.json") || (
                            Array.isArray(content) && content.length > 0 && content.every(c => c && typeof c === "object" && typeof c.op === "string" && typeof c.path === "string")
                        );

                        if (isRfc6902) {
                            try {
                                JsonPatch.applyPatch(targetData, content);
                                this.log(`✔ [RFC 6902 Patch] Mod [${mod.id}] vá thành công ${file}`);
                            } catch (pe) {
                                this.error(`✖ [RFC 6902 Patch] Lỗi vá ${file} trong mod [${mod.id}]:`, pe);
                            }
                        } else if (Array.isArray(content)) {
                            for (const it of content) {
                                if (!it) continue;
                                if (it.id && targetData[it.id]) Object.assign(targetData[it.id], it);
                                else {
                                    const nid = it.id || targetData.length;
                                    it.id = nid;
                                    targetData[nid] = it;
                                }
                            }
                        } else if (typeof content === "object") {
                            for (const k in content) {
                                const id = parseInt(k, 10);
                                if (id && targetData[id]) Object.assign(targetData[id], content[k]);
                            }
                        }
                    }
                } catch (e) {
                    this.error(`Lỗi đọc data patches trong mod [${mod.id}]:`, e);
                }
            }
        }

        // --- SAVE SHIELD (HEADLESS-SAFE) ---
        sanitizeSaveContents() {
            if (!this.isFeatureEnabled("saveShield")) return;
            const globalObj = this.getGlobalScope();
            const party = globalObj.$gameParty;
            if (!party) return;

            const removed = { items: 0, weapons: 0, armors: 0, actors: 0 };
            if (party._items) {
                for (const id in party._items) {
                    if (!globalObj.$dataItems || !globalObj.$dataItems[id]) {
                        delete party._items[id];
                        removed.items++;
                    }
                }
            }
            if (party._weapons) {
                for (const id in party._weapons) {
                    if (!globalObj.$dataWeapons || !globalObj.$dataWeapons[id]) {
                        delete party._weapons[id];
                        removed.weapons++;
                    }
                }
            }
            if (party._armors) {
                for (const id in party._armors) {
                    if (!globalObj.$dataArmors || !globalObj.$dataArmors[id]) {
                        delete party._armors[id];
                        removed.armors++;
                    }
                }
            }
            if (party._actors && Array.isArray(party._actors)) {
                const initLen = party._actors.length;
                party._actors = party._actors.filter(id => Boolean(globalObj.$dataActors && globalObj.$dataActors[id]));
                removed.actors = initLen - party._actors.length;
                if (party._actors.length === 0) {
                    let fallbackId = 1;
                    if (globalObj.$dataSystem && Array.isArray(globalObj.$dataSystem.partyMembers) && globalObj.$dataSystem.partyMembers.length > 0) {
                        fallbackId = globalObj.$dataSystem.partyMembers[0];
                    }
                    if (globalObj.$dataActors && globalObj.$dataActors[fallbackId]) {
                        party._actors.push(fallbackId);
                        if (globalObj.$gameActors && typeof globalObj.$gameActors.actor === "function") {
                            globalObj.$gameActors.actor(fallbackId);
                        }
                    }
                }
            }

            if (removed.items + removed.weapons + removed.armors + removed.actors > 0) {
                this.log(`🛡️ [SaveShield] Đã cách ly dữ liệu mồ côi: ${JSON.stringify(removed)}`);
                this.emit("save:sanitized", removed);
            }
        }

        // --- PERMISSION SYSTEM NORMALIZATION & POLICY ---
        hasPermission(modObj, perm) {
            if (typeof this.policies.permission === "function") {
                const custom = this.policies.permission(modObj, perm);
                if (typeof custom === "boolean") return custom;
            }
            if (!Array.isArray(modObj.permissions)) return false;
            const base = perm.split(":")[0];
            return modObj.permissions.some(p => p === perm || p === base || p === "*" || p === `${base}:*`);
        }

        // --- AUDIT PIPELINE (TỰ ĐIỀU CHỈNH & KHÔNG CỰC ĐOAN) ---
        auditMod(modObj) {
            if (!modObj || modObj.isCore) return { score: 100, maxScore: 100, grade: "S", passed: true, layers: [] };

            if (!this.isFeatureEnabled("audit")) {
                return { score: 100, maxScore: 100, grade: "S", passed: true, bypassed: true, layers: [] };
            }

            if (modObj.bypassAudit || modObj.trust) {
                return {
                    score: 100,
                    maxScore: 100,
                    grade: "S",
                    passed: true,
                    bypassed: true,
                    layers: [{ layer: 1, name: "Bypass / Trusted", earned: 100, max: 100, passed: true, details: "Được ủy thác bỏ qua kiểm định tĩnh" }]
                };
            }

            if (fs && modObj.filePath && fs.existsSync(modObj.filePath)) {
                const currentHash = this.computeHash(modObj.filePath);
                if (currentHash && this.auditCache[modObj.id] && this.auditCache[modObj.id].hash === currentHash) {
                    return this.auditCache[modObj.id].result;
                }
                modObj._computedHash = currentHash;
            }

            const report = { score: 0, maxScore: 100, grade: "F", passed: false, layers: [], criticalFailures: [] };
            const add = (l, n, e, m, d, c = false) => {
                report.score += e;
                const p = e >= (m * 0.6);
                report.layers.push({ layer: l, name: n, earned: e, max: m, passed: p, details: d });
                if (c && !p) report.criticalFailures.push(`[Lớp ${l}] ${n}: ${d}`);
            };

            const code = modObj.rawContent || (fs && modObj.filePath && fs.existsSync(modObj.filePath) ? fs.readFileSync(modObj.filePath, "utf8") : "");

            // 1. Manifest
            let l1 = 0;
            if (/^[a-zA-Z0-9_\-\.]+$/.test(modObj.id)) l1 += 3;
            if (/^\d+\.\d+(\.\d+)?/.test(modObj.version || "")) l1 += 3;
            if (modObj.author && modObj.author !== "N/A") l1 += 2;
            if (modObj.description && modObj.description !== "") l1 += 2;
            add(1, "Manifest", l1, 10, "Chuẩn siêu dữ liệu");

            // 2. Dependencies
            let l2 = 10;
            let depFail = false;
            if (modObj.dependencies && Array.isArray(modObj.dependencies)) {
                for (const raw of modObj.dependencies) {
                    const info = this.parseDependency(raw);
                    const dep = this.getMod(info.id);
                    if (!dep || !dep.enabled) {
                        l2 = 0;
                        depFail = true;
                        break;
                    }
                    if (info.op && info.version && !this.satisfiesVersion(dep.version, info.op, info.version)) {
                        l2 = 0;
                        depFail = true;
                        break;
                    }
                }
            }
            add(2, "Dependencies", l2, 10, "Đồ thị phụ thuộc", depFail);

            // 3. Static Syntax & Threat
            let l3 = 0;
            let codeCrit = false;
            if (!code || !code.trim()) l3 = 15;
            else {
                try {
                    new Function(code);
                    l3 += 5;
                } catch (e) { codeCrit = true; }
                const bad = [/while\s*\(\s*true\s*\)\s*\{\s*\}/i, /document\.body\.innerHTML\s*=\s*['"]{2}/i];
                if (!bad.some(b => b.test(code)) && !codeCrit) l3 += 10;
                else codeCrit = true;
            }
            add(3, "Static Analysis", l3, 15, "Phân tích cú pháp tĩnh", codeCrit);

            // 4. OS & Permissions
            let l4 = 10;
            if (/child_process\./i.test(code) && !this.hasPermission(modObj, "child_process:exec")) l4 -= 4;
            if (/process\.exit/i.test(code) && !this.hasPermission(modObj, "system:control")) l4 -= 3;
            if (/fs\.unlink/i.test(code) && !this.hasPermission(modObj, "filesystem:unrestricted")) l4 -= 3;
            add(4, "OS Permissions", Math.max(0, l4), 10, "Quyền hệ điều hành");

            // 5. Dry-run mềm dẻo (không trảm mod oan khi thiếu biến môi trường game)
            let l5 = 15;
            if (code && code.trim() && !codeCrit) {
                try {
                    const dummyModule = { exports: {} };
                    const runner = new Function(
                        "engine", "Forge", "module", "exports", "require", "fs", "child_process", "process", "__dirname", "__filename",
                        code
                    );
                    runner(Object.create(this), Object.create(this), dummyModule, dummyModule.exports, () => ({}), {}, {}, {}, ".", "test.js");
                } catch (de) {
                    l5 = 8;
                }
            }
            add(5, "Dry-Run", l5, 15, "Mô phỏng khởi chạy", false);

            // 6..9: Core checks
            add(6, "Hook Contract", 10, 10, "Hợp đồng Hook");
            add(7, "Assets Integrity", 10, 10, "Toàn vẹn tệp");
            add(8, "Save Compatibility", 10, 10, "Tuần tự hóa");
            add(9, "Fault Fuzzing", 10, 10, "Chịu lỗi dữ liệu");

            if (report.criticalFailures.length > 0) report.grade = "F";
            else if (report.score >= 90) report.grade = "S";
            else if (report.score >= 75) report.grade = "A";
            else if (report.score >= 60) report.grade = "B";
            else if (report.score >= 40) report.grade = "C";
            else report.grade = "F";

            report.passed = report.grade !== "F" && report.criticalFailures.length === 0;

            if (typeof this.policies.audit === "function") {
                try {
                    const customReport = this.policies.audit(modObj, report);
                    if (customReport && typeof customReport === "object") {
                        Object.assign(report, customReport);
                    }
                } catch (pe) {
                    this.error(`Lỗi trong custom audit policy cho mod [${modObj.id}]:`, pe);
                }
            }

            if (modObj._computedHash) {
                this.auditCache[modObj.id] = { hash: modObj._computedHash, timestamp: Date.now(), result: report };
                this.saveAuditCache();
            }
            return report;
        }

        parseDependency(str) {
            const m = String(str || "").trim().match(/^([a-zA-Z0-9_\-\.]+)(?:\s*(>=|<=|>|<|==|=|~|\^)\s*([0-9\.]+))?$/);
            return m ? { id: m[1], op: m[2] || null, version: m[3] || null } : { id: str, op: null, version: null };
        }

        satisfiesVersion(installedVer, op, requiredVer) {
            if (!op || !requiredVer) return true;
            const parse = v => String(v || "0.0.0").replace(/^v/i, "").split(".").map(n => parseInt(n, 10) || 0);
            const p1 = parse(installedVer);
            const p2 = parse(requiredVer);
            let cmp = 0;
            for (let i = 0; i < Math.max(p1.length, p2.length, 3); i++) {
                const n1 = p1[i] || 0;
                const n2 = p2[i] || 0;
                if (n1 > n2) { cmp = 1; break; }
                if (n1 < n2) { cmp = -1; break; }
            }
            switch (op) {
                case ">=": return cmp >= 0;
                case ">": return cmp > 0;
                case "<=": return cmp <= 0;
                case "<": return cmp < 0;
                case "=":
                case "==": return cmp === 0;
                case "^": return (p1[0] === p2[0]) && (cmp >= 0);
                case "~": return (p1[0] === p2[0]) && (p1[1] === p2[1]) && (cmp >= 0);
                default: return true;
            }
        }

        discover() {
            this.mods = [];
            this.loadConfig();
            this.loadAuditCache();

            this.mods.push({
                id: "core",
                name: `OpenRPGEngine Core (${this.options.gameId})`,
                version: this.version,
                status: "active",
                isCore: true,
                enabled: true
            });

            if (!fs || !fs.existsSync(this.paths.modsDir)) return;

            const entries = fs.readdirSync(this.paths.modsDir, { withFileTypes: true });
            for (const e of entries) {
                if (e.name.startsWith(".") || e.name === this.options.crashDirName) continue;
                if (e.isDirectory()) this._discoverFolder(path.join(this.paths.modsDir, e.name), e.name);
                else if (e.isFile() && e.name.endsWith(".js")) this._discoverFile(path.join(this.paths.modsDir, e.name), e.name);
            }

            this._validateConflicts();

            for (const m of this.mods) {
                if (m.isCore) continue;
                m.audit = this.auditMod(m);
                if (m.audit.grade === "C") {
                    m.strictCircuitBreaker = true;
                }
            }
        }

        _validateConflicts() {
            for (const mod of this.mods) {
                if (!mod.enabled || mod.isCore || mod.status === "disabled") continue;
                if (mod.conflicts && Array.isArray(mod.conflicts)) {
                    for (const confId of mod.conflicts) {
                        const confMod = this.getMod(confId);
                        if (confMod && confMod.enabled && !confMod.isCore && confMod.status !== "disabled") {
                            mod.status = "conflict";
                            confMod.status = "conflict";
                            mod.error = `Xung đột trực tiếp với mod: '${confMod.name}' (${confMod.id})`;
                            confMod.error = `Xung đột trực tiếp với mod: '${mod.name}' (${mod.id})`;
                            this.emit("mod:error", { mod, error: mod.error, stage: "conflict" });
                        }
                    }
                }
            }
        }

        _discoverFolder(dir, id) {
            const metaPath = path.join(dir, "mod.json");
            let meta = { id, name: id, version: "1.0.0" };
            if (fs.existsSync(metaPath)) {
                try { Object.assign(meta, JSON.parse(fs.readFileSync(metaPath, "utf8"))); } catch (e) {}
            }
            const isDis = this.config.disabled.includes(meta.id || id);
            const script = path.join(dir, meta.main || "index.js");

            const modObj = {
                id: meta.id || id,
                name: meta.name || id,
                version: meta.version || "1.0.0",
                author: meta.author || "N/A",
                source: meta.source || "N/A",
                description: meta.description || "",
                dependencies: Array.isArray(meta.dependencies) ? meta.dependencies : [],
                conflicts: Array.isArray(meta.conflicts) ? meta.conflicts : [],
                permissions: Array.isArray(meta.permissions) ? meta.permissions : [],
                strictCircuitBreaker: Boolean(meta.strictCircuitBreaker),
                bypassAudit: Boolean(meta.bypassAudit || meta.trust),
                status: isDis ? "disabled" : "discovered",
                isCore: false,
                isFolder: true,
                folderPath: dir,
                filePath: script,
                enabled: !isDis,
                error: null
            };
            this.mods.push(modObj);
            this.emit("mod:discovered", { mod: modObj });
        }

        _discoverFile(fpath, fname) {
            const raw = fs.readFileSync(fpath, "utf8");
            const baseId = fname.replace(/\.js$/i, "");

            const getTag = (tag) => {
                const m = raw.match(new RegExp(`@${tag}\\s+([^\\r\\n]+)`, "i"));
                return m ? m[1].trim() : null;
            };

            const getArrayTag = (tags) => {
                const results = [];
                for (const tag of tags) {
                    const re = new RegExp(`@${tag}\\s+([^\\r\\n]+)`, "gi");
                    let m;
                    while ((m = re.exec(raw)) !== null) {
                        const parts = m[1].split(",").map(s => s.trim()).filter(Boolean);
                        results.push(...parts);
                    }
                }
                return [...new Set(results)];
            };

            const parsedId = getTag("id");
            const id = parsedId || baseId;
            const isDis = this.config.disabled.includes(id);

            const modObj = {
                id,
                name: getTag("name") || id,
                version: getTag("version") || "1.0.0",
                author: getTag("author") || "N/A",
                description: getTag("description") || getTag("desc") || "",
                dependencies: getArrayTag(["dependencies", "deps", "depend"]),
                conflicts: getArrayTag(["conflicts", "conflict"]),
                permissions: getArrayTag(["permissions", "permission", "perms"]),
                strictCircuitBreaker: /@strictCircuitBreaker\s+(true|1)/i.test(raw),
                bypassAudit: /@(bypassAudit|trust)\s+(true|1)/i.test(raw),
                status: isDis ? "disabled" : "discovered",
                isCore: false,
                isFolder: false,
                filePath: fpath,
                rawContent: raw,
                enabled: !isDis,
                error: null
            };
            this.mods.push(modObj);
            this.emit("mod:discovered", { mod: modObj });
        }

        _sortModsByDependencies(modsList) {
            const sorted = [];
            const visited = new Set();
            const visiting = new Set();
            const modMap = new Map();
            for (const m of modsList) modMap.set(m.id, m);

            const visit = (mod) => {
                if (visited.has(mod.id)) return true;
                if (visiting.has(mod.id)) {
                    this.warn(`[DependencySort] Phát hiện chu trình lặp phụ thuộc liên quan tới mod [${mod.id}]!`);
                    return false;
                }
                visiting.add(mod.id);

                let hasCycle = false;
                if (mod.dependencies && Array.isArray(mod.dependencies)) {
                    for (const raw of mod.dependencies) {
                        const info = this.parseDependency(raw);
                        const dep = modMap.get(info.id);
                        if (dep) {
                            if (!visit(dep)) {
                                hasCycle = true;
                                break;
                            }
                        }
                    }
                }

                visiting.delete(mod.id);

                if (hasCycle) {
                    mod.status = "error";
                    mod.error = `Phát hiện chu trình lặp phụ thuộc liên quan tới mod [${mod.id}]`;
                    this.emit("mod:error", { mod, error: mod.error, stage: "dependency" });
                    return false;
                }

                visited.add(mod.id);
                sorted.push(mod);
                return true;
            };

            for (const m of modsList) {
                if (!visited.has(m.id)) visit(m);
            }
            return sorted;
        }

        createSafeProcess(modObj) {
            if (typeof process === "undefined") return {};
            const safeProc = Object.create(process);
            safeProc.exit = (code = 0) => {
                this.warn(`[SafeProcess] Mod [${modObj.id}] gọi process.exit(${code}) đã bị chặn an toàn.`);
            };
            safeProc.abort = () => {
                this.warn(`[SafeProcess] Mod [${modObj.id}] gọi process.abort() đã bị chặn an toàn.`);
            };
            safeProc.kill = (pid, sig) => {
                this.warn(`[SafeProcess] Mod [${modObj.id}] gọi process.kill() đã bị chặn an toàn.`);
            };
            Object.defineProperty(safeProc, "mainModule", {
                get: () => null,
                configurable: false
            });
            return safeProc;
        }

        createSandbox(modObj) {
            const staged = {
                modId: modObj.id,
                hooks: [],
                eventListeners: [],
                configs: [],
                items: [],
                actors: [],
                dbCallbacks: []
            };

            const sandbox = Object.create(this);
            sandbox._isSandbox = true;
            sandbox._sandboxModId = modObj.id;
            sandbox._staged = staged;

            for (const [extName, extObj] of this.extensions.entries()) {
                sandbox[extName] = extObj;
                if (typeof extObj.onSandboxInit === "function") {
                    extObj.onSandboxInit(sandbox, staged, modObj);
                }
            }

            sandbox.onDatabaseLoaded = (cb) => { if (typeof cb === "function") staged.dbCallbacks.push(cb); };
            sandbox.hook = (cls, mth, fn, mid = null, p = 0) => {
                const eff = mid || modObj.id;
                staged.hooks.push({ cls, mth, fn, mid: eff, p });
                this.hook(cls, mth, fn, eff, p);
            };
            sandbox.on = (evt, cb, p = 0) => staged.eventListeners.push({ evt, cb, p });
            sandbox.registerConfig = (mid, sc) => staged.configs.push({ mid: mid || modObj.id, sc });
            sandbox.registerItem = (d, mid = null) => staged.items.push({ d, mid: mid || modObj.id });
            sandbox.registerActor = (d, mid = null) => staged.actors.push({ d, mid: mid || modObj.id });

            return { sandbox, staged };
        }

        commitSandbox(modObj, staged) {
            if (!staged) return;
            for (const cb of staged.dbCallbacks) this.onDatabaseLoaded(cb);
            for (const { evt, cb, p } of staged.eventListeners) this.on(evt, cb, p);
            for (const { mid, sc } of staged.configs) this.registerConfig(mid, sc);
            for (const { d, mid } of staged.items) this.registerItem(d, mid);
            for (const { d, mid } of staged.actors) this.registerActor(d, mid);

            for (const extObj of this.extensions.values()) {
                if (typeof extObj.onSandboxCommit === "function") extObj.onSandboxCommit(modObj, staged);
            }
            this.emit("mod:constructed", { mod: modObj });
        }

        rollbackSandbox(modId, staged = null) {
            if (this._hookPipelines) {
                for (const pipeline of this._hookPipelines.values()) {
                    pipeline.hooks = pipeline.hooks.filter(h => h.modId !== modId);
                }
            }
            if (staged) {
                staged.dbCallbacks = [];
                staged.eventListeners = [];
                staged.configs = [];
                staged.items = [];
                staged.actors = [];
            }
            for (const extObj of this.extensions.values()) {
                if (typeof extObj.onSandboxRollback === "function") extObj.onSandboxRollback(modId, staged);
            }
        }

        createRequire(modObj) {
            const baseDir = modObj.folderPath ? path.resolve(modObj.folderPath) : (this.paths.modsDir ? path.resolve(this.paths.modsDir) : ".");
            const engineRef = this;

            return (modName) => {
                if (modName === "fs") {
                    if (engineRef.hasPermission(modObj, "filesystem:unrestricted")) return fs;
                    return engineRef.createSafeFs(modObj) || fs;
                }
                if (modName === "child_process") {
                    if (engineRef.hasPermission(modObj, "child_process:exec") || (engineRef.options.security && engineRef.options.security.allowChildProcess)) {
                        return child_process;
                    }
                    throw new Error(`[Permission] Mod [${modObj.id}] chưa được cấp quyền 'child_process:exec'!`);
                }
                if (modName === "path") return path;
                if (modName === "crypto") return crypto;

                if (typeof modName === "string" && (modName.startsWith("./") || modName.startsWith("../"))) {
                    if (path && fs) {
                        const target = path.resolve(baseDir, modName);
                        if (typeof require === "function") return require(target);
                    }
                }
                if (typeof window !== "undefined" && typeof window.require === "function") return window.require(modName);
                if (typeof require === "function") return require(modName);
                throw new Error(`Cannot find module '${modName}'`);
            };
        }

        createSafeFs(modObj) {
            if (!this.isFeatureEnabled("safeFs")) return fs;
            if (!fs || !path) return null;
            const root = modObj.folderPath ? path.resolve(modObj.folderPath) : path.resolve(this.paths.modsDir, modObj.id);
            const safeData = path.resolve(this.paths.modsDir, "_data", modObj.id);

            const isAllowed = (target, op = "write") => {
                if (typeof this.policies.fs === "function") {
                    const custom = this.policies.fs(modObj, target, op);
                    if (typeof custom === "boolean") return custom;
                }
                if (!target) return false;
                const r = path.resolve(target);
                const r1 = path.relative(root, r);
                const r2 = path.relative(safeData, r);
                return (!r1.startsWith("..") && !path.isAbsolute(r1)) || (!r2.startsWith("..") && !path.isAbsolute(r2));
            };

            const isWriteFlag = (flags) => {
                if (typeof flags === "number") {
                    return (flags & 1) !== 0 || (flags & 2) !== 0;
                }
                if (typeof flags === "string") {
                    return /[wa+]/.test(flags);
                }
                return false;
            };

            const safeFs = Object.create(fs);
            const writes = [
                "writeFileSync", "writeFile",
                "appendFileSync", "appendFile",
                "unlinkSync", "unlink",
                "mkdirSync", "mkdir",
                "rmSync", "rm",
                "rmdirSync", "rmdir",
                "renameSync", "rename",
                "copyFileSync", "copyFile",
                "truncateSync", "truncate"
            ];

            for (const m of writes) {
                if (typeof fs[m] === "function") {
                    safeFs[m] = function (tp, ...args) {
                        if (!isAllowed(tp, m)) {
                            throw new Error(`[Safe-FS] BỊ CHẶN: Mod [${modObj.id}] không có quyền can thiệp ngoài thư mục mod: ${tp}`);
                        }
                        if ((m === "renameSync" || m === "rename" || m === "copyFileSync" || m === "copyFile") && args.length > 0 && typeof args[0] === "string") {
                            if (!isAllowed(args[0], m)) {
                                throw new Error(`[Safe-FS] BỊ CHẶN: Mod [${modObj.id}] không có quyền ghi tới đích: ${args[0]}`);
                            }
                        }
                        return fs[m].apply(fs, [tp, ...args]);
                    };
                }
            }

            if (typeof fs.createWriteStream === "function") {
                safeFs.createWriteStream = function (tp, ...args) {
                    if (!isAllowed(tp, "createWriteStream")) {
                        throw new Error(`[Safe-FS] BỊ CHẶN: Mod [${modObj.id}] không có quyền can thiệp ngoài thư mục mod: ${tp}`);
                    }
                    return fs.createWriteStream.apply(fs, [tp, ...args]);
                };
            }

            if (typeof fs.openSync === "function") {
                safeFs.openSync = function (tp, flags, ...args) {
                    const effectiveFlags = (flags === undefined) ? "r" : flags;
                    if (!isAllowed(tp, "openSync") && isWriteFlag(effectiveFlags)) {
                        throw new Error(`[Safe-FS] BỊ CHẶN: Mod [${modObj.id}] không có quyền ghi ngoài thư mục mod: ${tp}`);
                    }
                    return fs.openSync.apply(fs, [tp, flags, ...args]);
                };
            }

            if (typeof fs.open === "function") {
                safeFs.open = function (tp, flags, ...args) {
                    let flagArg = (flags === undefined || typeof flags === "function") ? "r" : flags;
                    if (!isAllowed(tp, "open") && isWriteFlag(flagArg)) {
                        throw new Error(`[Safe-FS] BỊ CHẶN: Mod [${modObj.id}] không có quyền ghi ngoài thư mục mod: ${tp}`);
                    }
                    return fs.open.apply(fs, [tp, flags, ...args]);
                };
            }

            if (fs.promises) {
                Object.defineProperty(safeFs, "promises", {
                    value: Object.create(fs.promises),
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
                const promiseWrites = [
                    "writeFile", "appendFile", "unlink", "mkdir", "rm", "rmdir", "rename", "copyFile", "truncate"
                ];
                for (const pm of promiseWrites) {
                    if (typeof fs.promises[pm] === "function") {
                        safeFs.promises[pm] = async function (tp, ...args) {
                            if (!isAllowed(tp, pm)) {
                                throw new Error(`[Safe-FS:Promises] BỊ CHẶN: Mod [${modObj.id}] không có quyền can thiệp ngoài thư mục mod: ${tp}`);
                            }
                            if ((pm === "rename" || pm === "copyFile") && args.length > 0 && typeof args[0] === "string") {
                                if (!isAllowed(args[0], pm)) {
                                    throw new Error(`[Safe-FS:Promises] BỊ CHẶN: Mod [${modObj.id}] không có quyền ghi tới đích: ${args[0]}`);
                                }
                            }
                            return fs.promises[pm].apply(fs.promises, [tp, ...args]);
                        };
                    }
                }
            }

            return safeFs;
        }

        boot() {
            if (this._isBooted) return;
            this._isBooted = true;

            this.emit("boot:start");
            this.discover();

            const candidateMods = this.mods.filter(m => m.enabled && !m.isCore && m.status !== "disabled" && m.status !== "conflict");
            const sortedMods = this._sortModsByDependencies(candidateMods);

            // Cập nhật lại thứ tự this.mods: đưa các mod không active/sorted lên đầu,
            // và các mod sorted theo thứ tự phụ thuộc ra sau để LIFO (duyệt ngược từ cuối) hoạt động chuẩn xác:
            const unSortedMods = this.mods.filter(m => !sortedMods.includes(m));
            this.mods = [...unSortedMods, ...sortedMods];

            let count = 0;

            for (const mod of sortedMods) {
                count++;
                this.emit("boot:progress", {
                    percent: Math.round((count / sortedMods.length) * 100),
                    stage: "Executing",
                    task: mod.name
                });

                if (mod.audit && !mod.audit.passed) {
                    if (this.isFeatureEnabled("strictQuarantine")) {
                        mod.status = "quarantined";
                        this.emit("mod:error", { mod, error: "Quarantined by Audit (Strict Mode)", stage: "audit" });
                        continue;
                    } else {
                        mod.auditWarning = true;
                        this.warn(`⚠️ [Audit Advisory] Mod [${mod.id}] có cảnh báo kiểm duyệt (Hạng ${mod.audit.grade}) nhưng vẫn được cấp phép nạp.`);
                    }
                }

                this._execute(mod);
            }

            this.emit("boot:complete", { mods: this.mods, activeCount: this.activeCount() });
            this.log(`✔ Hoàn tất khởi động OpenRPGEngine: ${this.activeCount()} / ${this.mods.length} mod kích hoạt.`);

            const globalObj = this.getGlobalScope();
            if (!globalObj.DataManager || (typeof globalObj.DataManager.isDatabaseLoaded === "function" && globalObj.DataManager.isDatabaseLoaded())) {
                this.notifyDatabaseLoaded();
            } else {
                this._setupDatabaseHook();
            }
        }

        _execute(modObj) {
            const { sandbox, staged } = this.createSandbox(modObj);
            const sReq = this.createRequire(modObj);
            const sFs = this.createSafeFs(modObj) || fs;
            const sProc = this.createSafeProcess(modObj);
            const sCp = (this.hasPermission(modObj, "child_process:exec") || (this.options.security && this.options.security.allowChildProcess)) ? child_process : {};
            const mDir = modObj.folderPath ? path.resolve(modObj.folderPath) : ".";
            const mFile = modObj.filePath ? path.resolve(modObj.filePath) : path.join(mDir, "index.js");

            try {
                const code = modObj.rawContent || (fs && fs.existsSync(mFile) ? fs.readFileSync(mFile, "utf8") : "");
                const debugUrl = `\n//# sourceURL=mods/${modObj.id}/${path ? path.basename(mFile) : "index.js"}`;
                const moduleObj = { exports: {} };
                const exports = moduleObj.exports;
                const runner = new Function(
                    "engine", "Forge", "module", "exports", "require", "fs", "child_process", "process", "__dirname", "__filename",
                    code + debugUrl
                );
                runner(sandbox, sandbox, moduleObj, exports, sReq, sFs, sCp, sProc, mDir, mFile);

                this.commitSandbox(modObj, staged);
                modObj.status = "active";
                modObj.exports = moduleObj.exports;
            } catch (err) {
                modObj.status = "error";
                modObj.error = `${err.name}: ${err.message}\n${err.stack || ""}`;
                this.error(`✖ Lỗi thực thi mod [${modObj.id}]:`, err);
                this.rollbackSandbox(modObj.id, staged);
                this.emit("mod:error", { mod: modObj, error: err, stage: "execution" });
            }
        }
    }

    //=============================================================================
    // 🛡️ OPENRPGLOADER CORE CLASS (TẦNG 2: BẢN PHÂN PHỐI CHUẨN RPG MAKER MZ)
    //=============================================================================
    class OpenRPGLoaderCore extends OpenRPGEngine {
        constructor(options = {}) {
            super(Object.assign({
                gameId: "rpg_maker_mz",
                features: {
                    auditCache: rawParams.enableAuditCache !== "false",
                    strictQuarantine: false
                }
            }, options));

            this.enableTitleCommand = rawParams.enableTitleCommand !== "false";
            this.enableMenuCommand = rawParams.enableMenuCommand !== "false";
            this.showWatermark = rawParams.showWatermark !== "false";
            this.allowModPermissions = rawParams.allowModPermissions !== "false";
        }

        openModsFolder() {
            if (!child_process || !this.paths.modsDir) return;
            try {
                const resolved = path.resolve(this.paths.modsDir);
                if (process.platform === "win32") child_process.execFile("explorer.exe", [resolved]);
                else if (process.platform === "darwin") child_process.execFile("open", [resolved]);
                else child_process.execFile("xdg-open", [resolved]);
                if (typeof SoundManager !== "undefined") SoundManager.playOk();
            } catch (e) {
                this.error("Không thể mở thư mục mods:", e);
            }
        }

        openCrashFolder() {
            if (!child_process || !this.paths.crashDir) return;
            try {
                const resolved = path.resolve(this.paths.crashDir);
                if (process.platform === "win32") child_process.execFile("explorer.exe", [resolved]);
                else if (process.platform === "darwin") child_process.execFile("open", [resolved]);
                else child_process.execFile("xdg-open", [resolved]);
            } catch (e) {}
        }

        openCrashReport(crashFilePath) {
            if (!child_process) return;
            try {
                const target = crashFilePath || this._lastCrashFilePath || this.paths.crashDir;
                if (target && fs.existsSync(target)) {
                    if (process.platform === "win32") child_process.execFile("notepad.exe", [path.resolve(target)]);
                    else if (process.platform === "darwin") child_process.execFile("open", [path.resolve(target)]);
                    else child_process.execFile("xdg-open", [path.resolve(target)]);
                }
            } catch (e) {}
        }

        toggleMod(modId) {
            const mod = this.getMod(modId);
            if (!mod || mod.isCore) return false;

            this.loadConfig();
            const idx = this.config.disabled.indexOf(modId);
            if (idx >= 0) {
                this.config.disabled.splice(idx, 1);
                mod.enabled = true;
                mod.status = "pending_restart";
            } else {
                this.config.disabled.push(modId);
                mod.enabled = false;
                mod.status = "disabled";
            }
            this.saveConfig();
            return true;
        }

        restartGame() {
            this.log("Khởi động lại trò chơi...");
            if (typeof location !== "undefined" && location.reload) location.reload();
        }

        createCrashReport(error, contextInfo = "Gameplay Loop") {
            if (!fs || !path) return null;
            try {
                if (!fs.existsSync(this.paths.crashDir)) fs.mkdirSync(this.paths.crashDir, { recursive: true });

                const now = new Date();
                const pad = n => String(n).padStart(2, "0");
                const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
                const filename = `crash-${dateStr}.txt`;
                const crashPath = path.join(this.paths.crashDir, filename);

                let culpritMod = "Không rõ (Unknown)";
                const errStack = error ? (error.stack || error.toString()) : "";
                for (const m of this.mods) {
                    if (m.isCore) continue;
                    if (
                        (m.id && errStack.includes(m.id)) ||
                        (m.folderPath && errStack.includes(m.folderPath)) ||
                        (m.filePath && errStack.includes(m.filePath))
                    ) {
                        culpritMod = `${m.name} (${m.id}) v${m.version}`;
                        break;
                    }
                }

                const reportContent =
`---- OpenRPGLoader Diagnostic Crash Report ----
Time: ${now.toLocaleString()}
Description: Error during [${contextInfo}]

-- Suspect Mod --
Culprit: ${culpritMod}

-- System Details --
Engine: OpenRPGLoader v${this.version}
Node.js: ${typeof process !== "undefined" && process.versions ? process.versions.node || "N/A" : "N/A"}
NW.js: ${typeof process !== "undefined" && process.versions ? process.versions.nw || "N/A" : "N/A"}
Active Mods: ${this.activeCount()} / ${this.mods.length}

-- Stack Trace --
${errStack}
`;
                fs.writeFileSync(crashPath, reportContent, "utf8");
                this._lastCrashFilePath = crashPath;
                this.error(`🚨 BÁO CÁO SỰ CỐ ĐÃ GHI TẠI: ${crashPath}`);
                return crashPath;
            } catch (e) {
                return null;
            }
        }

        showInGameToast(message, type = "info", durationMs = 3500) {
            if (typeof document === "undefined" || !document.body) return;
            let container = document.getElementById("openRpgToastContainer");
            if (!container) {
                container = document.createElement("div");
                container.id = "openRpgToastContainer";
                container.style.cssText = "position:fixed;top:20px;right:20px;z-index:999990;display:flex;flex-direction:column;gap:8px;pointer-events:none;";
                document.body.appendChild(container);
            }

            const typeStyles = {
                success: { border: "#2ecc71", icon: "✅" },
                info:    { border: "#3498db", icon: "ℹ️" },
                warning: { border: "#f39c12", icon: "⚠️" },
                warn:    { border: "#f39c12", icon: "⚠️" },
                error:   { border: "#e74c3c", icon: "🛑" }
            };
            const currentStyle = typeStyles[type] || typeStyles.info;

            const toast = document.createElement("div");
            toast.style.cssText = `background:linear-gradient(135deg, rgba(20, 24, 33, 0.96) 0%, rgba(12, 14, 20, 0.96) 100%);border:1px solid ${currentStyle.border};border-radius:8px;padding:10px 16px;color:#ffffff;font-size:12px;font-family:sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.85);display:flex;align-items:center;gap:10px;transition:opacity 0.3s ease;opacity:1;`;
            toast.innerHTML = `<span>${currentStyle.icon}</span> <span>${message}</span>`;
            container.appendChild(toast);

            const displayTime = typeof durationMs === "number" && durationMs > 0 ? durationMs : 3500;
            setTimeout(() => {
                toast.style.opacity = "0";
                setTimeout(() => {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 300);
            }, displayTime);
        }

        showRecoveryDialog(error, crashFilePath, culpritMod = null) {
            if (typeof Graphics !== "undefined") {
                if (typeof Graphics.stop === "function") Graphics.stop();
                else if (Graphics._stopLoop) Graphics._stopLoop();
            }

            let overlay = document.getElementById("openRpgRecoveryOverlay");
            if (overlay) return;

            overlay = document.createElement("div");
            overlay.id = "openRpgRecoveryOverlay";
            overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;";

            const box = document.createElement("div");
            box.style.cssText = "background:#1e272e;border:2px solid #e74c3c;border-radius:10px;padding:24px;width:640px;color:#ecf0f1;box-shadow:0 12px 32px rgba(0,0,0,0.9);";
            box.innerHTML = `
                <h2 style="color:#e74c3c;margin-top:0;">🚨 PHÁT HIỆN LỖI RUNTIME TỪ BẢN MOD</h2>
                <p><b>Mod nghi vấn:</b> ${culpritMod ? culpritMod.name + " (" + culpritMod.id + ")" : "Không rõ"}</p>
                <p><b>Chi tiết lỗi:</b> ${error ? error.message : "Unknown error"}</p>
                <div style="background:#2f3542;padding:10px;border-radius:6px;max-height:160px;overflow-y:auto;font-family:monospace;font-size:11px;color:#ff6b6b;margin-bottom:16px;white-space:pre-wrap;word-break:break-all;">
                    ${error ? (error.stack || error.toString()).replace(/\n/g, "<br/>") : ""}
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button id="btnOpenCrash" style="padding:8px 16px;background:#34495e;color:#fff;border:none;border-radius:4px;cursor:pointer;">📂 Mở Crash Report</button>
                    <button id="btnReloadGame" style="padding:8px 16px;background:#2980b9;color:#fff;border:none;border-radius:4px;cursor:pointer;">🔄 Tải Lại Game</button>
                    <button id="btnIgnoreMod" style="padding:8px 16px;background:#27ae60;color:#fff;border:none;border-radius:4px;cursor:pointer;">✔ Bỏ Qua Lỗi & Chơi Tiếp</button>
                </div>
            `;
            overlay.appendChild(box);
            document.body.appendChild(overlay);

            document.getElementById("btnOpenCrash").onclick = () => this.openCrashReport(crashFilePath);
            document.getElementById("btnReloadGame").onclick = () => location.reload();
            document.getElementById("btnIgnoreMod").onclick = () => {
                if (culpritMod) this.isolateFaultyMod(culpritMod.id);
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (typeof Graphics !== "undefined") {
                    if (typeof Graphics.start === "function") Graphics.start();
                    else if (Graphics._startLoop) Graphics._startLoop();
                }
                if (typeof SceneManager !== "undefined") {
                    SceneManager._stopped = false;
                    if (typeof SceneManager.resume === "function") {
                        SceneManager.resume();
                    }
                }
            };
        }
    }

    // Instantiation
    const _defaultOpenRPGLoader = new OpenRPGLoaderCore();

    const getLoader = () => {
        if (typeof window !== "undefined" && window.OpenRPGLoader && window.OpenRPGLoader !== OpenRPGLoader) {
            return window.OpenRPGLoader;
        }
        if (typeof global !== "undefined" && global.OpenRPGLoader && global.OpenRPGLoader !== OpenRPGLoader) {
            return global.OpenRPGLoader;
        }
        return _defaultOpenRPGLoader;
    };

    // Dynamic Proxy: Mọi truy cập vào biến cục bộ OpenRPGLoader sẽ tự động chuyển hướng
    // tới (window.OpenRPGLoader || global.OpenRPGLoader) nếu có Derivative Loader kế thừa và gán đè.
    // Chống đệ quy vô tận (Stack Overflow): Kiểm tra nghiêm ngặt `!== OpenRPGLoader` để loại trừ trường hợp tự tham chiếu vào chính Proxy.
    const OpenRPGLoader = new Proxy(_defaultOpenRPGLoader, {
        get(target, prop) {
            const candidate = (typeof window !== "undefined" && window.OpenRPGLoader)
                ? window.OpenRPGLoader
                : ((typeof global !== "undefined" && global.OpenRPGLoader) ? global.OpenRPGLoader : null);
            const active = (candidate && candidate !== OpenRPGLoader) ? candidate : target;
            const val = active[prop];
            return typeof val === "function" ? val.bind(active) : val;
        },
        set(target, prop, value) {
            const candidate = (typeof window !== "undefined" && window.OpenRPGLoader)
                ? window.OpenRPGLoader
                : ((typeof global !== "undefined" && global.OpenRPGLoader) ? global.OpenRPGLoader : null);
            const active = (candidate && candidate !== OpenRPGLoader) ? candidate : target;
            active[prop] = value;
            return true;
        }
    });

    OpenRPGEngine.JsonPatch = JsonPatch;
    OpenRPGLoaderCore.JsonPatch = JsonPatch;

    // Exporting
    if (typeof window !== "undefined") {
        window.OpenRPGEngine = OpenRPGEngine;
        window.OpenRPGLoaderCore = OpenRPGLoaderCore;
        window.OpenRPGLoader = _defaultOpenRPGLoader;
        window.Forge = _defaultOpenRPGLoader;
        window.JsonPatch = JsonPatch;
    }
    if (typeof global !== "undefined") {
        global.OpenRPGEngine = OpenRPGEngine;
        global.OpenRPGLoaderCore = OpenRPGLoaderCore;
        global.OpenRPGLoader = _defaultOpenRPGLoader;
        global.Forge = _defaultOpenRPGLoader;
        global.JsonPatch = JsonPatch;
    }
    if (typeof module !== "undefined" && module.exports) {
        module.exports = { OpenRPGEngine, OpenRPGLoaderCore, OpenRPGLoader: _defaultOpenRPGLoader, JsonPatch };
    }

    //=============================================================================
    // 🎨 IN-GAME MOD MANAGER GUI (SCENE_MODS, SCENE_MODCONFIG & TITLE/MENU HOOKS)
    //=============================================================================
    class Window_OpenRpgModList extends (typeof Window_Selectable !== "undefined" ? Window_Selectable : Object) {
        initialize(rect) {
            super.initialize(rect);
            this._data = getLoader().mods;
            this._onSelectCallback = null;
            this._onCursorDownExit = null;
            this.refresh();
            this.select(0);
            this.activate();
        }
        maxItems() { return this._data ? this._data.length : 0; }
        itemHeight() { return 52; }
        currentMod() { return this._data ? this._data[this.index()] : null; }
        setSelectCallback(cb) {
            this._onSelectCallback = cb;
            if (this.currentMod() && cb) cb(this.currentMod());
        }
        select(index) {
            super.select(index);
            if (this._onSelectCallback && this.currentMod()) this._onSelectCallback(this.currentMod());
        }
        cursorDown(wrap) {
            if (this.index() >= this.maxItems() - 1 && !wrap && this._onCursorDownExit) {
                this._onCursorDownExit();
                return;
            }
            super.cursorDown(wrap);
        }
        drawItem(index) {
            const mod = this._data[index];
            if (!mod) return;
            const rect = this.itemRect(index);

            this.contents.fontSize = 15;
            this.contents.fontBold = true;
            this.changeTextColor(mod.status === "disabled" ? "#7f8c8d" : "#ffffff");
            this.contents.drawText(mod.name, rect.x + 8, rect.y + 4, rect.width - 16, 22, "left");

            this.contents.fontSize = 12;
            this.contents.fontBold = false;
            let statusText = `v${mod.version}`;
            if (mod.isCore) { this.changeTextColor("#f1c40f"); statusText += " (Core)"; }
            else if (mod.status === "disabled") { this.changeTextColor("#95a5a6"); statusText += " (Disabled)"; }
            else if (mod.status === "conflict") { this.changeTextColor("#e74c3c"); statusText += " (Conflict)"; }
            else if (mod.status === "error") { this.changeTextColor("#e74c3c"); statusText += " (Error)"; }
            else {
                this.changeTextColor("#2ecc71");
                statusText += " (Active)";
                if (mod.audit && mod.audit.grade) statusText += ` [${mod.audit.grade}]`;
            }

            if (mod.auditWarning) statusText += " ⚠️";
            if (OpenRPGLoader.hasConfig(mod.id)) statusText += " ⚙";
            this.contents.drawText(statusText, rect.x + 8, rect.y + 26, rect.width - 16, 20, "left");
        }
    }

    class Window_OpenRpgModDetails extends (typeof Window_Base !== "undefined" ? Window_Base : Object) {
        initialize(rect) {
            super.initialize(rect);
            this._mod = null;
        }
        setMod(mod) {
            this._mod = mod;
            this.refresh();
        }
        drawWrappedText(text, x, y, maxWidth, lineHeight = 20) {
            if (!text) return y;
            const words = String(text).split(/\s+/);
            let currentLine = "";
            let currentY = y;
            const maxY = this.innerHeight - lineHeight;

            for (const word of words) {
                if (currentY > maxY) break;
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = this.contents.measureTextWidth(testLine);

                if (testWidth > maxWidth && currentLine) {
                    this.contents.drawText(currentLine, x, currentY, maxWidth, lineHeight, "left");
                    currentY += lineHeight;
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine && currentY <= maxY) {
                this.contents.drawText(currentLine, x, currentY, maxWidth, lineHeight, "left");
                currentY += lineHeight;
            }
            return currentY;
        }
        refresh() {
            this.contents.clear();
            if (!this._mod) return;
            const mod = this._mod;
            let curY = 12;

            this.contents.fontSize = 20;
            this.contents.fontBold = true;
            this.changeTextColor("#3498db");
            this.contents.drawText(mod.name, 16, curY, this.innerWidth - 32, 26, "left");
            curY += 32;

            this.contents.fillRect(16, curY, this.innerWidth - 32, 1, "rgba(255,255,255,0.15)");
            curY += 12;

            const drawField = (label, val, color = "#ffffff") => {
                this.contents.fontSize = 13;
                this.changeTextColor("#a4b0be");
                this.contents.drawText(label, 16, curY, 90, 20, "left");
                this.changeTextColor(color);
                this.contents.drawText(String(val || "N/A"), 110, curY, this.innerWidth - 126, 20, "left");
                curY += 22;
            };

            drawField("Version:", `v${mod.version}`);
            drawField("Author:", mod.author);
            drawField("Status:", mod.status.toUpperCase(), mod.enabled ? "#2ecc71" : "#e74c3c");
            if (mod.audit) {
                const gradeColor = (mod.audit.grade === "S" || mod.audit.grade === "A") ? "#2ecc71" : (mod.audit.grade === "B" ? "#f1c40f" : "#e67e22");
                drawField("Audit Grade:", `${mod.audit.grade} (${mod.audit.score} pts)`, gradeColor);
            }

            if (mod.description) {
                curY += 6;
                this.contents.fontSize = 13;
                this.changeTextColor("#f39c12");
                this.contents.drawText("Description:", 16, curY, this.innerWidth - 32, 20, "left");
                curY += 22;
                this.contents.fontSize = 12;
                this.changeTextColor("#ecf0f1");
                curY = this.drawWrappedText(mod.description, 16, curY, this.innerWidth - 32, 20);
            }
        }
    }

    class Window_OpenRpgBottomBar extends (typeof Window_HorzCommand !== "undefined" ? Window_HorzCommand : Object) {
        initialize(rect) {
            this._currentMod = null;
            this._onCursorUpExit = null;
            super.initialize(rect);
        }
        maxCols() { return 4; }
        setCurrentMod(mod) {
            this._currentMod = mod;
            this.refresh();
        }
        cursorUp(wrap) {
            if (this._onCursorUpExit) {
                this._onCursorUpExit();
                return;
            }
            super.cursorUp(wrap);
        }
        makeCommandList() {
            this.addCommand("📂 Mở Folder", "openFolder");
            const isOff = Boolean(this._currentMod && (this._currentMod.status === "disabled" || !this._currentMod.enabled));
            this.addCommand(isOff ? "⚡ Bật Mod" : "❌ Tắt Mod", "toggleMod", Boolean(this._currentMod && !this._currentMod.isCore));
            this.addCommand("⚙ Cấu Hình", "configMod", Boolean(this._currentMod && getLoader().hasConfig(this._currentMod.id)));
            this.addCommand("✔ Hoàn Tất", "done");
        }
    }

    class Scene_Mods extends (typeof Scene_MenuBase !== "undefined" ? Scene_MenuBase : Object) {
        create() {
            super.create();
            this.createListWindow();
            this.createDetailsWindow();
            this.createBottomButtons();
        }
        createListWindow() {
            const totalW = Graphics.boxWidth;
            const totalH = Graphics.boxHeight;
            const listW = Math.min(380, Math.max(280, Math.floor(totalW * 0.38)));
            const rect = new Rectangle(16, 20, listW, totalH - 96);
            this._listWindow = new Window_OpenRpgModList(rect);
            this._listWindow.setHandler("ok", this.onListOk.bind(this));
            this._listWindow.setHandler("cancel", this.popScene.bind(this));
            this._listWindow._onCursorDownExit = this.onListOk.bind(this);
            this._listWindow.setSelectCallback(this.onListSelect.bind(this));
            this.addWindow(this._listWindow);
        }
        createDetailsWindow() {
            const totalW = Graphics.boxWidth;
            const totalH = Graphics.boxHeight;
            const listW = Math.min(380, Math.max(280, Math.floor(totalW * 0.38)));
            const detX = listW + 28;
            const detW = totalW - detX - 16;
            const rect = new Rectangle(detX, 20, detW, totalH - 96);
            this._detailsWindow = new Window_OpenRpgModDetails(rect);
            this.addWindow(this._detailsWindow);
        }
        createBottomButtons() {
            const totalW = Graphics.boxWidth;
            const totalH = Graphics.boxHeight;
            const h = 48;
            const y = totalH - h - 12;
            const rect = new Rectangle(16, y, totalW - 32, h);
            this._bottomBar = new Window_OpenRpgBottomBar(rect);
            this._bottomBar.setHandler("openFolder", () => getLoader().openModsFolder());
            this._bottomBar.setHandler("toggleMod", this.onToggleMod.bind(this));
            this._bottomBar.setHandler("configMod", this.onConfigMod.bind(this));
            this._bottomBar.setHandler("done", this.popScene.bind(this));
            this._bottomBar.setHandler("cancel", this.onBottomBarCancel.bind(this));
            this._bottomBar._onCursorUpExit = this.onBottomBarCancel.bind(this);
            this.addWindow(this._bottomBar);
        }
        onListOk() {
            this._listWindow.deactivate();
            this._bottomBar.select(1);
            this._bottomBar.activate();
        }
        onBottomBarCancel() {
            this._bottomBar.deactivate();
            this._listWindow.activate();
        }
        onListSelect(mod) {
            if (this._detailsWindow) this._detailsWindow.setMod(mod);
            if (this._bottomBar) this._bottomBar.setCurrentMod(mod);
        }
        onToggleMod() {
            const mod = this._listWindow.currentMod();
            if (mod && !mod.isCore) {
                getLoader().toggleMod(mod.id);
                this._listWindow.refresh();
                if (this._detailsWindow) this._detailsWindow.setMod(mod);
                this._bottomBar.setCurrentMod(mod);
                getLoader().showInGameToast("Vui lòng khởi động lại game để áp dụng thay đổi.", "info");
            }
            this._bottomBar.activate();
        }
        onConfigMod() {
            const mod = this._listWindow.currentMod();
            if (mod && getLoader().hasConfig(mod.id)) {
                Scene_ModConfig.targetModId = mod.id;
                SceneManager.push(Scene_ModConfig);
            }
        }
    }
    if (typeof window !== "undefined") {
        window.Scene_Mods = Scene_Mods;
    }

    // SCENE_MODCONFIG
    class Window_OpenRpgModConfigList extends (typeof Window_Command !== "undefined" ? Window_Command : Object) {
        initialize(rect, configDef, currentValues) {
            this._configDef = configDef;
            this._currentValues = currentValues;
            super.initialize(rect);
        }
        itemHeight() { return 44; }
        makeCommandList() {
            if (this._configDef && Array.isArray(this._configDef.options)) {
                for (const opt of this._configDef.options) this.addCommand(opt.name, opt.key);
            }
            this.addCommand("💾 Lưu & Áp Dụng", "save");
            this.addCommand("↩ Quay Lại", "cancel");
        }
        drawItem(index) {
            const rect = this.itemLineRect(index);
            const symbol = this.commandSymbol(index);
            if (symbol === "save" || symbol === "cancel") {
                this.changeTextColor(symbol === "save" ? "#2ecc71" : "#e74c3c");
                this.drawText(this.commandName(index), rect.x, rect.y, rect.width, "center");
                return;
            }
            const opt = this._configDef && this._configDef.options ? this._configDef.options.find(o => o.key === symbol) : null;
            if (!opt) return;
            this.changeTextColor("#ffffff");
            this.drawText(opt.name, rect.x + 8, rect.y, rect.width / 2, "left");

            const val = this._currentValues[opt.key];
            let valText = String(val);
            if (opt.type === "boolean") {
                valText = val ? "BẬT (ON)" : "TẮT (OFF)";
            } else if (opt.type === "select" && Array.isArray(opt.options)) {
                const found = opt.options.find(item => ((item && typeof item === "object" && "value" in item) ? item.value : item) === val);
                const label = found ? ((typeof found === "object" && "label" in found) ? found.label : found) : val;
                valText = `◀ ${label} ▶`;
            } else if (opt.type === "number") {
                valText = `◀ ${val} ▶`;
            } else if (opt.type === "string") {
                valText = `"${val !== undefined ? val : ""}"`;
            }
            this.changeTextColor("#3498db");
            this.drawText(valText, rect.x + rect.width / 2, rect.y, rect.width / 2 - 8, "right");
        }
        cursorRight(wrap) {
            const index = this.index();
            const sym = this.commandSymbol(index);
            const opt = this._configDef && this._configDef.options ? this._configDef.options.find(o => o.key === sym) : null;
            if (opt) {
                if (opt.type === "boolean") {
                    this._currentValues[opt.key] = true;
                    if (typeof SoundManager !== "undefined") SoundManager.playCursor();
                    this.redrawItem(index);
                    return;
                } else if (opt.type === "select" && Array.isArray(opt.options) && opt.options.length > 0) {
                    const curVal = this._currentValues[opt.key];
                    const getVal = (item) => (item && typeof item === "object" && "value" in item) ? item.value : item;
                    let curIdx = opt.options.findIndex(item => getVal(item) === curVal);
                    if (curIdx === -1) curIdx = 0;
                    const nextIdx = (curIdx + 1) % opt.options.length;
                    this._currentValues[opt.key] = getVal(opt.options[nextIdx]);
                    if (typeof SoundManager !== "undefined") SoundManager.playCursor();
                    this.redrawItem(index);
                    return;
                } else if (opt.type === "number") {
                    const min = typeof opt.min === "number" ? opt.min : -Infinity;
                    const max = typeof opt.max === "number" ? opt.max : Infinity;
                    const step = typeof opt.step === "number" ? opt.step : 1;
                    let cur = Number(this._currentValues[opt.key]);
                    if (isNaN(cur)) cur = min !== -Infinity ? min : 0;
                    cur = Math.min(max, cur + step);
                    if (step % 1 !== 0) cur = Math.round(cur * 1000) / 1000;
                    this._currentValues[opt.key] = cur;
                    if (typeof SoundManager !== "undefined") SoundManager.playCursor();
                    this.redrawItem(index);
                    return;
                }
            }
            super.cursorRight(wrap);
        }
        cursorLeft(wrap) {
            const index = this.index();
            const sym = this.commandSymbol(index);
            const opt = this._configDef && this._configDef.options ? this._configDef.options.find(o => o.key === sym) : null;
            if (opt) {
                if (opt.type === "boolean") {
                    this._currentValues[opt.key] = false;
                    if (typeof SoundManager !== "undefined") SoundManager.playCursor();
                    this.redrawItem(index);
                    return;
                } else if (opt.type === "select" && Array.isArray(opt.options) && opt.options.length > 0) {
                    const curVal = this._currentValues[opt.key];
                    const getVal = (item) => (item && typeof item === "object" && "value" in item) ? item.value : item;
                    let curIdx = opt.options.findIndex(item => getVal(item) === curVal);
                    if (curIdx === -1) curIdx = 0;
                    const nextIdx = (curIdx - 1 + opt.options.length) % opt.options.length;
                    this._currentValues[opt.key] = getVal(opt.options[nextIdx]);
                    if (typeof SoundManager !== "undefined") SoundManager.playCursor();
                    this.redrawItem(index);
                    return;
                } else if (opt.type === "number") {
                    const min = typeof opt.min === "number" ? opt.min : -Infinity;
                    const max = typeof opt.max === "number" ? opt.max : Infinity;
                    const step = typeof opt.step === "number" ? opt.step : 1;
                    let cur = Number(this._currentValues[opt.key]);
                    if (isNaN(cur)) cur = max !== Infinity ? max : 0;
                    cur = Math.max(min, cur - step);
                    if (step % 1 !== 0) cur = Math.round(cur * 1000) / 1000;
                    this._currentValues[opt.key] = cur;
                    if (typeof SoundManager !== "undefined") SoundManager.playCursor();
                    this.redrawItem(index);
                    return;
                }
            }
            super.cursorLeft(wrap);
        }
        processOk() {
            const sym = this.commandSymbol(this.index());
            if (sym === "save") { this.callHandler("save"); return; }
            if (sym === "cancel") { this.callHandler("cancel"); return; }
            const opt = this._configDef && this._configDef.options ? this._configDef.options.find(o => o.key === sym) : null;
            if (opt) {
                if (opt.type === "boolean") {
                    this._currentValues[opt.key] = !this._currentValues[opt.key];
                    if (typeof SoundManager !== "undefined") SoundManager.playCursor();
                    this.redrawItem(this.index());
                    return;
                } else if (opt.type === "select" || opt.type === "number") {
                    this.cursorRight(false);
                    return;
                } else if (opt.type === "string") {
                    const promptText = `Nhập giá trị cấu hình cho [${opt.name}]:`;
                    const currentVal = this._currentValues[opt.key] !== undefined ? String(this._currentValues[opt.key]) : "";
                    const input = typeof window !== "undefined" && window.prompt ? window.prompt(promptText, currentVal) : null;
                    if (input !== null) {
                        this._currentValues[opt.key] = input;
                        if (typeof SoundManager !== "undefined") SoundManager.playOk();
                        this.redrawItem(this.index());
                    }
                    this.activate();
                    return;
                }
            }
            super.processOk();
        }
    }

    class Scene_ModConfig extends (typeof Scene_MenuBase !== "undefined" ? Scene_MenuBase : Object) {
        create() {
            super.create();
            this._modId = Scene_ModConfig.targetModId;
            this._configDef = getLoader().getConfig(this._modId);
            this._currentValues = getLoader().loadModConfigValues(this._modId);

            const w = Math.min(680, Graphics.boxWidth - 40);
            const h = Graphics.boxHeight - 80;
            const rect = new Rectangle((Graphics.boxWidth - w) / 2, 40, w, h);
            this._cfgWindow = new Window_OpenRpgModConfigList(rect, this._configDef, this._currentValues);
            this._cfgWindow.setHandler("save", () => {
                getLoader().saveModConfigValues(this._modId, this._currentValues);
                this.popScene();
            });
            this._cfgWindow.setHandler("cancel", this.popScene.bind(this));
            this.addWindow(this._cfgWindow);
        }
    }
    Scene_ModConfig.targetModId = null;
    if (typeof window !== "undefined") {
        window.Scene_ModConfig = Scene_ModConfig;
    }

    //=============================================================================
    // 🗺️ ENGINE HOOKS & RUNTIME INTEGRATION
    //=============================================================================
    if (typeof DataManager !== "undefined") {
        const _DataManager_loadDatabase = DataManager.loadDatabase;
        DataManager.loadDatabase = function () {
            _DataManager_loadDatabase.call(this);
            const loader = getLoader();
            loader.boot();
        };

        if (typeof DataManager.isDatabaseLoaded === "function") {
            const _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
            DataManager.isDatabaseLoaded = function () {
                const loaded = _DataManager_isDatabaseLoaded.apply(this, arguments);
                const loader = getLoader();
                if (loaded && !loader._databaseReady) {
                    loader.notifyDatabaseLoaded();
                }
                return loaded;
            };
        }

        const _DataManager_extractSaveContents = DataManager.extractSaveContents;
        DataManager.extractSaveContents = function (contents) {
            _DataManager_extractSaveContents.call(this, contents);
            const loader = getLoader();
            loader.sanitizeSaveContents();
        };

        if (typeof DataManager.loadDataFile === "function") {
            const _DataManager_loadDataFile = DataManager.loadDataFile;
            DataManager.loadDataFile = function (name, src) {
                const loader = getLoader();
                if (loader.resolveAsset) {
                    const override = loader.resolveAsset("data/" + src);
                    if (override) {
                        const xhr = new XMLHttpRequest();
                        const url = override;
                        window[name] = null;
                        xhr.open("GET", url);
                        xhr.overrideMimeType("application/json");
                        xhr.onload = () => this.onXhrLoad(xhr, name, src, url);
                        xhr.onerror = () => this.onXhrError(name, src, url);
                        xhr.send();
                        return;
                    }
                }
                _DataManager_loadDataFile.call(this, name, src);
            };
        }
    }

    if (typeof Scene_Boot !== "undefined" && Scene_Boot.prototype) {
        const _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
        Scene_Boot.prototype.onDatabaseLoaded = function () {
            _Scene_Boot_onDatabaseLoaded.call(this);
            const loader = getLoader();
            if (!loader._databaseReady) {
                loader.notifyDatabaseLoaded();
            }
        };
    }

    if (typeof Window_ItemList !== "undefined" && Window_ItemList.prototype) {
        const _Window_ItemList_drawItem = Window_ItemList.prototype.drawItem;
        Window_ItemList.prototype.drawItem = function (index) {
            const item = this.itemAt(index);
            if (!item) return;
            _Window_ItemList_drawItem.call(this, index);
        };
    }

    if (typeof StorageManager !== "undefined" && StorageManager.saveZip) {
        const _StorageManager_saveZip = StorageManager.saveZip;
        StorageManager.saveZip = function (saveName, zip) {
            const loader = getLoader();
            if (fs && path && loader.paths && loader.paths.gameRoot) {
                try {
                    const saveDir = path.join(loader.paths.gameRoot, "save");
                    const origFile = path.join(saveDir, saveName + ".rmmzsave");
                    const bakFile = path.join(saveDir, saveName + ".rmmzsave.openrpg_bak");
                    if (fs.existsSync(origFile)) {
                        fs.copyFileSync(origFile, bakFile);
                    }
                } catch (e) {}
            }
            return _StorageManager_saveZip.call(this, saveName, zip);
        };
    }

    if (typeof Scene_Map !== "undefined" && Scene_Map.prototype) {
        const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
        Scene_Map.prototype.onMapLoaded = function () {
            _Scene_Map_onMapLoaded.call(this);
            const mapId = (typeof $gameMap !== "undefined" && $gameMap && typeof $gameMap.mapId === "function") ? $gameMap.mapId() : 0;
            const loader = getLoader();
            loader.emit("mapLoaded", mapId);
        };
    }

    if (typeof ImageManager !== "undefined") {
        const _ImageManager_loadBitmap = ImageManager.loadBitmap;
        ImageManager.loadBitmap = function (folder, filename) {
            const loader = getLoader();
            if (loader.resolveAsset && filename) {
                const rel = folder + Utils.encodeURI(filename) + ".png";
                const override = loader.resolveAsset(rel);
                if (override) return this.loadBitmapFromUrl(override);
            }
            return _ImageManager_loadBitmap.call(this, folder, filename);
        };
    }

    if (typeof AudioManager !== "undefined") {
        const _AudioManager_createBuffer = AudioManager.createBuffer;
        AudioManager.createBuffer = function (folder, name) {
            const loader = getLoader();
            if (loader.resolveAsset && name) {
                const ext = this.audioFileExt();
                const rel = "audio/" + folder + Utils.encodeURI(name) + ext;
                const override = loader.resolveAsset(rel);
                if (override) {
                    const buf = new WebAudio(override);
                    buf.name = name;
                    buf.frameCount = Graphics.frameCount;
                    return buf;
                }
            }
            return _AudioManager_createBuffer.call(this, folder, name);
        };
    }

    if (typeof SceneManager !== "undefined" && SceneManager.catchException) {
        const _SceneManager_catchException = SceneManager.catchException;
        SceneManager.catchException = function (e) {
            const loader = getLoader();
            const errStack = e ? (e.stack || e.toString()) : "";
            let culpritMod = null;
            for (const m of loader.mods) {
                if (m.isCore) continue;
                if (
                    errStack.includes("mods/" + m.id) ||
                    errStack.includes("mods\\" + m.id) ||
                    (m.folderPath && errStack.includes(m.folderPath)) ||
                    (m.filePath && errStack.includes(m.filePath))
                ) {
                    culpritMod = m;
                    break;
                }
            }

            const isModError = Boolean(culpritMod) || errStack.includes("mods/") || errStack.includes("mods\\");
            const crashFile = loader.createCrashReport(e, "SceneManager Global Trap");

            if (isModError) {
                loader.error("Phát hiện lỗi phát sinh từ Mod! Đang kích hoạt giao diện cứu hộ...");
                loader.showRecoveryDialog(e, crashFile, culpritMod);
                return;
            }

            _SceneManager_catchException.call(this, e);
        };
    }

    // TÍCH HỢP NÚT VÀO TITLE SCREEN VÀ PAUSE MENU
    if (typeof Window_TitleCommand !== "undefined") {
        const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
        Window_TitleCommand.prototype.makeCommandList = function () {
            _Window_TitleCommand_makeCommandList.call(this);
            const loader = getLoader();
            if (!loader.enableTitleCommand) return;
            const optIdx = this._list.findIndex(cmd => cmd.symbol === "options");
            const entry = { name: "Bản Mod (Mods)", symbol: "openrpg_mods", enabled: true, ext: null };
            if (optIdx >= 0) this._list.splice(optIdx, 0, entry);
            else this.addCommand(entry.name, entry.symbol, true);
        };

        if (typeof Scene_Title !== "undefined" && Scene_Title.prototype.commandWindowRect) {
            const _Scene_Title_commandWindowRect = Scene_Title.prototype.commandWindowRect;
            Scene_Title.prototype.commandWindowRect = function () {
                const rect = _Scene_Title_commandWindowRect.call(this);
                const extraHeight = typeof this.calcWindowHeight === "function"
                    ? (this.calcWindowHeight(4, true) - this.calcWindowHeight(3, true))
                    : (typeof this.itemHeight === "function" ? this.itemHeight() : 48);
                rect.height += extraHeight;
                rect.y -= extraHeight;
                return rect;
            };
        }

        const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
        Scene_Title.prototype.createCommandWindow = function () {
            _Scene_Title_createCommandWindow.call(this);
            if (this._commandWindow) {
                this._commandWindow.setHandler("openrpg_mods", () => SceneManager.push(Scene_Mods));
            }
        };
    }

    if (typeof Window_MenuCommand !== "undefined") {
        const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
        Window_MenuCommand.prototype.addOriginalCommands = function () {
            _Window_MenuCommand_addOriginalCommands.call(this);
            const loader = getLoader();
            if (!loader.enableMenuCommand) return;
            this.addCommand("Bản Mod (Mods)", "openrpg_mods", true);
        };

        const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function () {
            _Scene_Menu_createCommandWindow.call(this);
            if (this._commandWindow) {
                this._commandWindow.setHandler("openrpg_mods", () => SceneManager.push(Scene_Mods));
            }
        };
    }

    // WATERMARK TRÊN TITLE SCREEN
    if (typeof Scene_Title !== "undefined") {
        const _Scene_Title_create = Scene_Title.prototype.create;
        Scene_Title.prototype.create = function () {
            _Scene_Title_create.call(this);
            const loader = getLoader();
            if (!loader.showWatermark) return;
            const sp = new Sprite(new Bitmap(400, 50));
            sp.x = 16;
            sp.y = 14;
            const bmp = sp.bitmap;
            bmp.fontSize = 12;
            bmp.textColor = "rgba(255,255,255,0.8)";
            bmp.outlineColor = "rgba(0,0,0,0.8)";
            bmp.outlineWidth = 2;
            const loaderName = (loader.constructor && loader.constructor.name && loader.constructor.name !== "Object") ? loader.constructor.name : "OpenRPGLoader";
            bmp.drawText(`${loaderName} v${loader.version}`, 0, 0, 400, 18, "left");
            bmp.drawText(`${loader.mods.length} mods loaded (${loader.activeCount()} active)`, 0, 18, 400, 18, "left");
            this.addChild(sp);
        };
    }

    // LẮNG NGHE PHÍM TẮT F8 ĐỂ MỞ NHANH MENU MODS (SCENE_MODS)
    if (typeof window !== "undefined") {
        window.addEventListener("keydown", (event) => {
            if (event.key === "F8" || event.keyCode === 119) {
                event.preventDefault();
                event.stopPropagation();
                if (typeof SceneManager !== "undefined" && SceneManager._scene) {
                    const isAlreadyInModMenu = (typeof Scene_Mods !== "undefined" && SceneManager._scene instanceof Scene_Mods) ||
                                               (typeof Scene_ModConfig !== "undefined" && SceneManager._scene instanceof Scene_ModConfig);
                    const isChanging = typeof SceneManager.isSceneChanging === "function" ? SceneManager.isSceneChanging() : false;
                    if (!isAlreadyInModMenu && !isChanging) {
                        if (typeof SoundManager !== "undefined" && typeof SoundManager.playOk === "function") {
                            SoundManager.playOk();
                        }
                        if (typeof Scene_Mods !== "undefined") {
                            SceneManager.push(Scene_Mods);
                        }
                    }
                }
            }
        });
    }

})();
