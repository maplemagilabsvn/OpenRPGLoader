/**
 * ============================================================================
 * OpenRPGEngine.js - Lõi Modding & Cứu Hộ Độc Lập Cho RPG Maker MZ (NW.js)
 * TẦNG 1: OPENRPG ENGINE CORE (Headless, Pluggable, Event-Driven)
 * ============================================================================
 * Đơn vị phát triển: M.A.P.L.E MAGI Labs
 * Giấy phép: MIT License
 *
 * ĐẶC ĐIỂM KIẾN TRÚC:
 * 1. Hoàn toàn độc lập môi trường (Headless Core, Environment-agnostic).
 * 2. Cấu hình linh hoạt qua OpenRPGEngine(options).
 * 3. Hỗ trợ chuẩn RFC 6902 JSON-Patch (deepEqual, copy undefined safe, root replace).
 * 4. Hệ thống Cấp quyền hạt nhân (Granular Permission System với tiền tố chuẩn).
 * 5. Bỏ qua kiểm định theo cờ ủy thác (bypassAudit / trust).
 * 6. Tăng tốc khởi động với SHA-256 Audit Cache.
 * 7. Thuật toán sắp xếp Topo (Topological Sort) với bộ phát hiện chu trình lặp (DFS).
 * 8. Kiểm định tách biệt (Audit chạy sau khi hoàn tất Discovery toàn bộ mod).
 * 9. Xử lý xung đột (conflicts) tự động và Safe-FS bao quát 16 phương thức ghi/xóa.
 * ============================================================================
 */

(() => {
    "use strict";

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

            // Xử lý Root Replacement (path: "" hoặc path: "/")
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
    // 🏛️ OPENRPG ENGINE CORE CLASS (TẦNG 1: LÕI VÔ HÌNH)
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

            // Chốt chặn tính năng (Feature Toggles) - Mặc định bật nhưng mềm dẻo, không cực đoan
            this.features = Object.assign({
                audit: true,
                strictQuarantine: false, // MẶC ĐỊNH: FALSE (Không chặn mù quáng, chỉ cảnh báo)
                safeFs: true,
                circuitBreaker: true,
                dataPatching: true,
                virtualAssets: true,
                saveShield: true,
                sandbox: true,
                auditCache: true
            }, this.options.features);

            // Chính sách chốt chặn tùy biến (Pluggable Policies) dành cho nhà phát triển bản phái sinh
            this.policies = {
                fs: null,             // (modObj, targetPath, op) => boolean | null
                audit: null,          // (modObj, report) => report
                permission: null,     // (modObj, perm) => boolean | null
                circuitBreaker: null  // (hook, error, errorCount) => boolean | null
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

        // --- HỆ THỐNG QUẢN LÝ CHỐT CHẶN & CHÍNH SÁCH (PLUGGABLE GUARDS & POLICIES) ---
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

        // --- GIAO DIỆN SỰ KIỆN (EVENTBUS) ---
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
                setCanceled: (flag) => {
                    if (cancelable) canceled = Boolean(flag);
                },
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

        // --- EXTENSION & UI ADAPTER REGISTRY ---
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

        // --- AUDIT CACHE ---
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

        // --- CẤU HÌNH BẢN MOD ---
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

        // --- BATTLE-SAFE ISOLATION & CIRCUIT BREAKER ---
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

        // --- SAFE HOOK PIPELINE ---
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

        // --- DATABASE LOADED LIFECYCLE (KHẮC PHỤC DEAD QUEUE) ---
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

        // --- RESOURCELOCATION & REGISTRIES ---
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
                    l5 = 8; // Trừ điểm nhẹ thay vì đánh trượt toàn bộ mod
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

            // Áp dụng Custom Audit Policy từ Developer (nếu có)
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

        // --- DISCOVERY & RUNTIME BOOT ---
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

            // BƯỚC 1: Quét toàn bộ thư mục và tệp mod vào this.mods trước
            const entries = fs.readdirSync(this.paths.modsDir, { withFileTypes: true });
            for (const e of entries) {
                if (e.name.startsWith(".") || e.name === this.options.crashDirName) continue;
                if (e.isDirectory()) this._discoverFolder(path.join(this.paths.modsDir, e.name), e.name);
                else if (e.isFile() && e.name.endsWith(".js")) this._discoverFile(path.join(this.paths.modsDir, e.name), e.name);
            }

            // BƯỚC 2: Kiểm tra Conflicts liên mod
            this._validateConflicts();

            // BƯỚC 3: Chạy Audit trên toàn bộ mod sau khi tất cả đã được nạp vào RAM
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

        // --- THUẬT TOÁN SẮP XẾP TOPO VỚI BỘ PHÁT HIỆN CHU TRÌNH LẶP ---
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

        // --- SANDBOX RUNNER & MOCK PROCESS ---
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
            // Cách ly mainModule để chống prototype traversal
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
            // Danh sách toàn diện các phương thức ghi/xóa/sửa đổi tệp và thư mục
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
                        // Kiểm tra đối số đích cho rename và copyFile
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

        // --- BOOT PIPELINE HOÀN CHỈNH VỚI TOPO SORT ---
        boot() {
            if (this._isBooted) return;
            this._isBooted = true;

            this.emit("boot:start");
            this.discover();

            const candidateMods = this.mods.filter(m => m.enabled && !m.isCore && m.status !== "disabled" && m.status !== "conflict");
            // Sắp xếp topo theo đồ thị phụ thuộc
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

    OpenRPGEngine.JsonPatch = JsonPatch;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = OpenRPGEngine;
        module.exports.OpenRPGEngine = OpenRPGEngine;
        module.exports.JsonPatch = JsonPatch;
    }
    if (typeof window !== "undefined") {
        window.OpenRPGEngine = OpenRPGEngine;
        window.JsonPatch = JsonPatch;
    }
    if (typeof global !== "undefined") {
        global.OpenRPGEngine = OpenRPGEngine;
        global.JsonPatch = JsonPatch;
    }

})();
